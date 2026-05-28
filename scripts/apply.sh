#!/usr/bin/env bash
# scripts/apply.sh
#
# Apply all Hilal changes to a Firefox source tree:
#   1. Copy the branding/ assets into browser/branding/<name>/
#   2. Apply every patch listed in patches/series, in order, via `git apply`
#   3. Copy any extra preference files (prefs/) into the tree
#
# Idempotent-ish: if everything is already applied, `git apply --check`
# will fail and we'll skip the patch. Use --force to reapply unconditionally
# (this will reset tracked files to upstream first).
#
# Usage:
#   scripts/apply.sh
#   scripts/apply.sh --force      # reset Firefox tree to a clean state first
#   scripts/apply.sh --no-symlinks # copy instead of symlink (Windows CI)
#   HILAL_FIREFOX_SRC=/path/to/ff scripts/apply.sh
#   HILAL_UBLOCK_XPI=/path/to/uBlock.xpi scripts/apply.sh # offline extension source

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

FORCE=0
NO_SYMLINKS=0
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    --no-symlinks) NO_SYMLINKS=1 ;;
    -h|--help)
      sed -n '2,17p' "$0"
      exit 0
      ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

require_firefox_src

PINNED_FIREFOX_COMMIT=""
if [ -f "$HILAL_REPO_ROOT/FIREFOX_COMMIT" ]; then
  PINNED_FIREFOX_COMMIT="$(tr -d '[:space:]' < "$HILAL_REPO_ROOT/FIREFOX_COMMIT")"
fi
if [ -n "$PINNED_FIREFOX_COMMIT" ]; then
  if ! git -C "$HILAL_FIREFOX_SRC" cat-file -e "$PINNED_FIREFOX_COMMIT^{commit}" 2>/dev/null; then
    die "Pinned Firefox commit is not present in $HILAL_FIREFOX_SRC: $PINNED_FIREFOX_COMMIT. Run scripts/setup-firefox.sh first."
  fi
  CURRENT_FIREFOX_COMMIT="$(git -C "$HILAL_FIREFOX_SRC" rev-parse HEAD)"
  if [ "$CURRENT_FIREFOX_COMMIT" != "$PINNED_FIREFOX_COMMIT" ]; then
    die "Firefox checkout is at $CURRENT_FIREFOX_COMMIT, but Hilal patches are pinned to $PINNED_FIREFOX_COMMIT. Run scripts/setup-firefox.sh before applying patches."
  fi
fi

if [ "$FORCE" = 1 ]; then
  if [ -t 0 ]; then
    warn "WARNING: --force will reset tracked files in $HILAL_FIREFOX_SRC to HEAD"
    warn "         and permanently delete untracked/modified files inside the Firefox checkout!"
    printf "Are you sure you want to continue? (y/N): "
    read -r reply
    if [[ ! "$reply" =~ ^[Yy]$ ]]; then
      die "Aborted by user."
    fi
  fi
  warn "--force: resetting tracked files in $HILAL_FIREFOX_SRC to HEAD"
  warn "         and removing branding/hilal + prefs overlays."
  git -C "$HILAL_FIREFOX_SRC" reset --hard HEAD
  rm -rf "$HILAL_FIREFOX_SRC/browser/branding/hilal"
  rm -f "$HILAL_FIREFOX_SRC/.hilal-applied"
  # Remove untracked files created by Hilal patches (new files not tracked by Firefox git).
  git -C "$HILAL_FIREFOX_SRC" clean -fd \
    browser/components/preferences/hilal.inc.xhtml \
    browser/base/content/hilal/ \
    browser/themes/shared/hilal-ui-fix.css \
    browser/themes/shared/firefox-ui-fix.css \
    browser/themes/shared/hilal-ui-overrides.css \
    browser/app/distribution/policies.json \
    browser/app/distribution/extensions/ \
    browser/modules/HilalBangs.sys.mjs \
    > /dev/null 2>&1 || true
fi

calculate_series_hash() {
  local series_file="$HILAL_REPO_ROOT/patches/series"
  [ -f "$series_file" ] || return 1

  stream_contents() {
    cat "$series_file"
    while IFS= read -r line || [ -n "$line" ]; do
      line="${line#"${line%%[![:space:]]*}"}"
      line="${line%"${line##*[![:space:]]}"}"
      [ -z "$line" ] && continue
      [ "${line:0:1}" = "#" ] && continue
      if [ -f "$HILAL_REPO_ROOT/patches/$line" ]; then
        cat "$HILAL_REPO_ROOT/patches/$line"
      fi
    done < "$series_file"
  }

  if command -v sha256sum >/dev/null 2>&1; then
    stream_contents | sha256sum | cut -d' ' -f1
  elif command -v shasum >/dev/null 2>&1; then
    stream_contents | shasum -a 256 | cut -d' ' -f1
  else
    stream_contents | python3 -c "import sys, hashlib; print(hashlib.sha256(sys.stdin.buffer.read()).hexdigest())"
  fi
}

read_series
CURRENT_HASH=""
STATE_FILE="$HILAL_FIREFOX_SRC/.hilal-applied"
SKIP_PATCHES=0
if [ "${#SERIES[@]}" -gt 0 ]; then
  CURRENT_HASH=$(calculate_series_hash)
  if [ "$FORCE" = 0 ] && [ -f "$STATE_FILE" ]; then
    STORED_HASH=$(cat "$STATE_FILE" 2>/dev/null || true)
    if [ "$CURRENT_HASH" = "$STORED_HASH" ]; then
      log "Patches are already up-to-date (matching checksum: $CURRENT_HASH). Skipping patch application."
      SKIP_PATCHES=1
    else
      die "Patch series changed since this Firefox tree was stamped (stored $STORED_HASH, current $CURRENT_HASH). Run scripts/apply.sh --force from the pinned Firefox checkout to rebuild a clean Hilal tree."
    fi
  fi
fi

if [ -d "$HILAL_FIREFOX_SRC/browser/branding/huma" ]; then
  warn "Removing stale pre-Hilal branding overlay: browser/branding/huma"
  rm -rf "$HILAL_FIREFOX_SRC/browser/branding/huma"
fi

# -- 1. Copy branding/* into browser/branding/* ------------------------------

if [ -d "$HILAL_REPO_ROOT/branding" ]; then
  for src in "$HILAL_REPO_ROOT/branding"/*/; do
    [ -d "$src" ] || continue
    name="$(basename "$src")"
    dst="$HILAL_FIREFOX_SRC/browser/branding/$name"
    log "Syncing branding: $name -> browser/branding/$name"
    mkdir -p "$dst"
    # Prefer rsync (macOS/Linux) for --delete semantics.
    # Fall back to rm + cp for environments without rsync (e.g. Git Bash on Windows).
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete "$src" "$dst/"
    else
      rm -rf "$dst"
      cp -r "$src" "$dst"
    fi
  done
fi

# -- 2. Apply patches in series order ----------------------------------------

if [ "${#SERIES[@]}" -eq 0 ]; then
  warn "patches/series is empty; no patches to apply."
else
  if [ "$SKIP_PATCHES" = 0 ]; then
    applied=0
    skipped=0
    for p in "${SERIES[@]}"; do
      patch_path="$HILAL_REPO_ROOT/patches/$p"
      [ -f "$patch_path" ] || die "Patch listed in series not found: $p"
      if git -C "$HILAL_FIREFOX_SRC" apply --check --reverse "$patch_path" >/dev/null 2>&1; then
        log "Skip (already applied): $p"
        skipped=$((skipped + 1))
        continue
      fi
      log "Applying: $p"
      if ! git -C "$HILAL_FIREFOX_SRC" apply --whitespace=nowarn "$patch_path"; then
        die "Failed to apply $p. Try: scripts/apply.sh --force, or refresh patches against current upstream."
      fi
      applied=$((applied + 1))
    done
    log "Patches: $applied applied, $skipped already in tree."
    echo "$CURRENT_HASH" > "$STATE_FILE"
  fi
fi

# -- 3. Copy any prefs/ overlays ---------------------------------------------

if [ -d "$HILAL_REPO_ROOT/prefs" ] && [ "$(find "$HILAL_REPO_ROOT/prefs" -type f ! -name '.DS_Store' ! -name '.gitkeep' -print -quit 2>/dev/null)" ]; then
  log "Syncing prefs/ overlays into Firefox tree"
  # Convention: a file at prefs/<relative/path/in/firefox> is copied to that
  # path in the Firefox source. Subdirectories under prefs/ mirror the tree.
  (
    cd "$HILAL_REPO_ROOT/prefs"
    find . -type f ! -path './browser/locales/*' ! -name '.DS_Store' ! -name '.gitkeep' -print0 | while IFS= read -r -d '' rel; do
      rel="${rel#./}"
      dst="$HILAL_FIREFOX_SRC/$rel"
      mkdir -p "$(dirname "$dst")"
      if [ "$NO_SYMLINKS" = 1 ]; then
        cp -f "$(pwd)/$rel" "$dst"
        log "  prefs -> $rel (copy)"
      else
        src_abs="$(pwd)/$rel"
        dst_dir="$(dirname "$dst")"
        rel_link="$(python3 -c 'import os.path; import sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))' "$src_abs" "$dst_dir")"
        ln -sf "$rel_link" "$dst"
        log "  prefs -> $rel (symlink)"
      fi
    done
  )
fi

# -- 4. Download and copy default extensions ---------------------------------

UBO_VERSION="1.57.2"
UBO_URL="https://github.com/gorhill/uBlock/releases/download/${UBO_VERSION}/uBlock0_${UBO_VERSION}.firefox.signed.xpi"
UBO_SHA256="9928e79a52cecf7cfa231fdb0699c7d7a427660d94eb10d711ed5a2f10d2eb89"

EXT_DIR="$HILAL_FIREFOX_SRC/browser/app/distribution/extensions"
mkdir -p "$EXT_DIR"
UBO_PATH="$EXT_DIR/uBlock0@raymondhill.net.xpi"

get_sha256() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | cut -d' ' -f1
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | cut -d' ' -f1
  else
    python3 - "$file" <<'PY'
import hashlib
import sys

with open(sys.argv[1], "rb") as f:
    print(hashlib.sha256(f.read()).hexdigest())
PY
  fi
}

verify_ubo_checksum() {
  if [ -f "$UBO_PATH" ]; then
    local current_hash
    current_hash=$(get_sha256 "$UBO_PATH")
    if [ "$current_hash" = "$UBO_SHA256" ]; then
      return 0
    fi
  fi
  return 1
}

if ! verify_ubo_checksum; then
  if [ -n "${HILAL_UBLOCK_XPI:-}" ]; then
    [ -f "$HILAL_UBLOCK_XPI" ] || die "HILAL_UBLOCK_XPI does not exist: $HILAL_UBLOCK_XPI"
    local_ubo_hash="$(get_sha256 "$HILAL_UBLOCK_XPI")"
    if [ "$local_ubo_hash" != "$UBO_SHA256" ]; then
      die "HILAL_UBLOCK_XPI checksum mismatch: expected $UBO_SHA256, got $local_ubo_hash"
    fi
    log "Using uBlock Origin v${UBO_VERSION} from HILAL_UBLOCK_XPI."
    cp -f "$HILAL_UBLOCK_XPI" "$UBO_PATH"
  else
    log "Downloading uBlock Origin v${UBO_VERSION} extension..."
    if ! curl -L -f -s -o "$UBO_PATH" "$UBO_URL"; then
      die "Failed to download uBlock Origin from ${UBO_URL}."
    fi
  fi
  if ! verify_ubo_checksum; then
    rm -f "$UBO_PATH"
    die "CRITICAL: uBlock Origin checksum verification failed! Downloaded file is corrupt or compromised."
  fi
  log "uBlock Origin v${UBO_VERSION} successfully downloaded and verified."
else
  log "uBlock Origin v${UBO_VERSION} is already present and verified."
fi

# -- 5. Merge Hilal custom Turkish translations into local source tree -------
python3 "$HILAL_REPO_ROOT/scripts/merge-locales.py" "$HILAL_REPO_ROOT" "$HILAL_FIREFOX_SRC"

log "All Hilal changes applied. Build with: scripts/build-macos.sh"

