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
#   HILAL_FIREFOX_SRC=/path/to/ff scripts/apply.sh

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

FORCE=0
for arg in "$@"; do
  case "$arg" in
    --force|-f) FORCE=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

require_firefox_src

if [ "$FORCE" = 1 ]; then
  warn "--force: resetting tracked files in $HILAL_FIREFOX_SRC to HEAD"
  warn "         and removing branding/hilal + prefs overlays."
  git -C "$HILAL_FIREFOX_SRC" reset --hard HEAD
  rm -rf "$HILAL_FIREFOX_SRC/browser/branding/hilal"
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
    # rsync is available on macOS by default; --delete keeps things clean
    # when files are removed upstream-in-repo.
    rsync -a --delete "$src" "$dst/"
  done
fi

# -- 2. Apply patches in series order ----------------------------------------

read_series
if [ "${#SERIES[@]}" -eq 0 ]; then
  warn "patches/series is empty; no patches to apply."
else
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
fi

# -- 3. Copy any prefs/ overlays ---------------------------------------------

if [ -d "$HILAL_REPO_ROOT/prefs" ] && compgen -G "$HILAL_REPO_ROOT/prefs/*" >/dev/null; then
  log "Syncing prefs/ overlays into Firefox tree"
  # Convention: a file at prefs/<relative/path/in/firefox> is copied to that
  # path in the Firefox source. Subdirectories under prefs/ mirror the tree.
  (
    cd "$HILAL_REPO_ROOT/prefs"
    find . -type f ! -name '.DS_Store' ! -name '.gitkeep' -print0 | while IFS= read -r -d '' rel; do
      rel="${rel#./}"
      dst="$HILAL_FIREFOX_SRC/$rel"
      mkdir -p "$(dirname "$dst")"
      cp -f "$rel" "$dst"
      log "  prefs -> $rel"
    done
  )
fi

log "All Hilal changes applied. Build with: scripts/build-macos.sh"
