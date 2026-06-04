#!/usr/bin/env bash
# Launches a built Hilal browser with a disposable profile and checks the
# packaged release-critical files that are easy to regress.

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

APP_BUNDLE="${HILAL_APP_BUNDLE:-}"
BINARY="${HILAL_BROWSER_BINARY:-}"
METADATA_ONLY=0
TIMEOUT_SECONDS=45

usage() {
  cat <<'EOF'
Usage:
  scripts/smoke-browser.sh [--app-bundle path/to/Hilal Browser.app]
  scripts/smoke-browser.sh [--binary path/to/firefox]

Options:
  --metadata-only        Check packaged files without launching the browser.
  --timeout SECONDS      Browser launch timeout. Defaults to 45.

Environment:
  HILAL_APP_BUNDLE       macOS .app bundle to smoke-test.
  HILAL_BROWSER_BINARY   Browser binary to smoke-test.
  HILAL_FIREFOX_SRC      Firefox source tree. Defaults to ./engine.
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --app-bundle)
      APP_BUNDLE="${2:-}"
      [ -n "$APP_BUNDLE" ] || die "Missing value for --app-bundle"
      shift 2
      ;;
    --binary)
      BINARY="${2:-}"
      [ -n "$BINARY" ] || die "Missing value for --binary"
      shift 2
      ;;
    --metadata-only)
      METADATA_ONLY=1
      shift
      ;;
    --timeout)
      TIMEOUT_SECONDS="${2:-}"
      [ -n "$TIMEOUT_SECONDS" ] || die "Missing value for --timeout"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

absolute_path() {
  case "$1" in
    /*) printf '%s\n' "$1" ;;
    *) printf '%s\n' "$PWD/$1" ;;
  esac
}

find_first() {
  find "$@" 2>/dev/null | head -n 1 || true
}

sha512_file() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 512 "$1" | awk '{print $1}'
  else
    sha512sum "$1" | awk '{print $1}'
  fi
}

require_file() {
  [ -f "$1" ] || die "Missing required packaged file: $1"
  [ -s "$1" ] || die "Required packaged file is empty: $1"
}

require_modern_firefox_version() {
  local value="$1"
  local major="${value%%.*}"
  if ! [[ "$value" =~ ^[0-9]+(\.[0-9]+)*((a|b)[0-9]+|esr)?$ ]] || [ "${major:-0}" -lt 100 ]; then
    die "Expected a modern Firefox/Gecko app version, got: $value"
  fi
}

resolve_target() {
  if [ -n "$APP_BUNDLE" ]; then
    APP_BUNDLE="$(absolute_path "$APP_BUNDLE")"
    [ -d "$APP_BUNDLE" ] || die "App bundle not found: $APP_BUNDLE"
    RESOURCES_DIR="$APP_BUNDLE/Contents/Resources"
    INFO_PLIST="$APP_BUNDLE/Contents/Info.plist"
    for candidate in \
      "$APP_BUNDLE/Contents/MacOS/firefox" \
      "$APP_BUNDLE/Contents/Resources/firefox" \
      "$APP_BUNDLE/Contents/Resources/firefox-bin"; do
      if [ -x "$candidate" ]; then
        BINARY="$candidate"
        break
      fi
    done
  elif [ -n "$BINARY" ]; then
    BINARY="$(absolute_path "$BINARY")"
    [ -x "$BINARY" ] || die "Browser binary not executable: $BINARY"
    local bin_dir
    bin_dir="$(cd "$(dirname "$BINARY")" && pwd)"
    if [ -d "$bin_dir/../Resources" ]; then
      RESOURCES_DIR="$(cd "$bin_dir/../Resources" && pwd)"
      INFO_PLIST="$(cd "$bin_dir/.." && pwd)/Info.plist"
    else
      RESOURCES_DIR="$bin_dir"
      INFO_PLIST=""
    fi
  else
    require_firefox_src
    APP_BUNDLE="$(find_first "$HILAL_FIREFOX_SRC"/obj-*/dist -maxdepth 1 -type d -name "Hilal Browser.app" -print)"
    if [ -n "$APP_BUNDLE" ]; then
      resolve_target
      return
    fi
    BINARY="$(find_first "$HILAL_FIREFOX_SRC"/obj-*/dist -maxdepth 3 -type f \( -name firefox -o -name firefox.exe \) -perm -111 -print)"
    [ -n "$BINARY" ] || die "No packaged Hilal browser found. Build and package first."
    resolve_target
    return
  fi

  [ -n "${BINARY:-}" ] || die "Could not resolve browser binary."
  [ -x "$BINARY" ] || die "Browser binary not executable: $BINARY"
  [ -d "$RESOURCES_DIR" ] || die "Resources directory not found: $RESOURCES_DIR"
}

check_info_plist() {
  [ -n "${INFO_PLIST:-}" ] && [ -f "$INFO_PLIST" ] || return 0
  if command -v plutil >/dev/null 2>&1; then
    local bundle_name
    bundle_name="$(plutil -extract CFBundleName raw -o - "$INFO_PLIST" 2>/dev/null || true)"
    if [ -n "$bundle_name" ] && ! [[ "$bundle_name" =~ Hilal ]]; then
      die "CFBundleName should identify Hilal, got: $bundle_name"
    fi
  fi
}

check_application_ini() {
  local app_ini=""
  for candidate in \
    "$RESOURCES_DIR/application.ini" \
    "$RESOURCES_DIR/browser/application.ini" \
    "$(dirname "$BINARY")/application.ini"; do
    if [ -f "$candidate" ]; then
      app_ini="$candidate"
      break
    fi
  done
  [ -n "$app_ini" ] || return 0

  local version
  version="$(awk -F= '$1 == "Version" { print $2; exit }' "$app_ini")"
  [ -n "$version" ] || die "application.ini does not expose [App] Version."
  require_modern_firefox_version "$version"
}

check_distribution() {
  local distribution_dir="$RESOURCES_DIR/distribution"
  local policies="$distribution_dir/policies.json"
  require_file "$policies"

  if ! grep -q "updates.hilal.gkdevstudio.org" "$policies"; then
    die "Packaged policies.json does not point app updates at Hilal infrastructure."
  fi
  if grep -q "aus5.mozilla.org" "$policies"; then
    die "Packaged policies.json still references Mozilla production updates."
  fi

  local extension_dir="$distribution_dir/extensions"
  local ublock="$extension_dir/uBlock0@raymondhill.net.xpi"
  local langpack="$extension_dir/langpack-tr@firefox.mozilla.org.xpi"
  require_file "$ublock"
  require_file "$langpack"

  for rel in \
    "policies.json" \
    "extensions/uBlock0@raymondhill.net.xpi" \
    "extensions/langpack-tr@firefox.mozilla.org.xpi"; do
    local source="$HILAL_REPO_ROOT/changes/browser/app/distribution/$rel"
    local packaged="$distribution_dir/$rel"
    [ -f "$source" ] || continue
    if [ "$(sha512_file "$source")" != "$(sha512_file "$packaged")" ]; then
      die "Packaged distribution file differs from repo overlay: $rel"
    fi
  done
}

launch_browser() {
  local tmpdir profile screenshot log_file pid status
  tmpdir="$(mktemp -d "${TMPDIR:-/tmp}/hilal-smoke.XXXXXX")"
  profile="$tmpdir/profile"
  screenshot="$tmpdir/screenshot.png"
  log_file="$tmpdir/browser.log"
  mkdir -p "$profile"

  log "Launching browser headlessly with disposable profile"
  MOZ_HEADLESS=1 "$BINARY" \
    --headless \
    --window-size 800,600 \
    --screenshot "$screenshot" \
    --profile "$profile" \
    "data:text/html,<title>Hilal Smoke</title><body>Hilal smoke</body>" >"$log_file" 2>&1 &
  pid=$!

  local deadline=$((SECONDS + TIMEOUT_SECONDS))
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      tail -80 "$log_file" >&2 || true
      die "Browser smoke launch timed out after ${TIMEOUT_SECONDS}s."
    fi
    sleep 1
  done

  status=0
  wait "$pid" || status=$?
  if [ "$status" -ne 0 ]; then
    tail -80 "$log_file" >&2 || true
    die "Browser smoke launch failed with exit code $status."
  fi
  if grep -Eiq "MOZ_CRASH|Segmentation fault|Trace/BPT trap|FATAL|panic" "$log_file"; then
    tail -80 "$log_file" >&2 || true
    die "Browser smoke log contains a critical startup failure."
  fi
  if [ ! -s "$screenshot" ]; then
    warn "Browser launched and exited, but headless screenshot was not created."
  fi

  rm -rf "$tmpdir"
}

resolve_target
log "Smoke target: $BINARY"
check_info_plist
check_application_ini
check_distribution

if [ "$METADATA_ONLY" = "0" ]; then
  launch_browser
fi

log "Browser smoke passed."
