#!/usr/bin/env bash
# scripts/sign-macos.sh
#
# Sign, notarize, and staple the Hilal Browser macOS app bundle.
#
# Environment variables:
#   CODESIGN_IDENTITY          Developer ID Application identity (e.g. "Developer ID Application: Team (ABCD123456)")
#   APPLE_ID                   Apple ID email for notarization
#   APPLE_APP_SPECIFIC_PASSWORD  App-specific password for notarization
#   APPLE_TEAM_ID              Apple Team ID for notarization
#   HILAL_FIREFOX_SRC          Override Firefox source tree path
#
# Usage:
#   scripts/sign-macos.sh                    # sign only (no notarization)
#   scripts/sign-macos.sh --notarize         # sign + notarize + staple
#   scripts/sign-macos.sh --verify-only      # only run verification checks

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

require_firefox_src

if [ "$(uname -s)" != "Darwin" ]; then
  die "This script must run on macOS."
fi

DO_NOTARIZE=0
VERIFY_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --notarize) DO_NOTARIZE=1 ;;
    --verify-only) VERIFY_ONLY=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

CODESIGN_IDENTITY="${CODESIGN_IDENTITY:-}"
if [ -z "$CODESIGN_IDENTITY" ]; then
  die "CODESIGN_IDENTITY is not set. Export it before running this script."
fi

# Locate the built app bundle
APP_BUNDLE=""
for candidate in "$HILAL_FIREFOX_SRC"/obj-*/dist/*.app; do
  if [ -d "$candidate" ]; then
    APP_BUNDLE="$candidate"
    break
  fi
done

if [ -z "$APP_BUNDLE" ] || [ ! -d "$APP_BUNDLE" ]; then
  die "No .app bundle found in $HILAL_FIREFOX_SRC/obj-*/dist/
Hint: run scripts/build-macos.sh package first."
fi

log "App bundle: $APP_BUNDLE"

if [ "$VERIFY_ONLY" = 1 ]; then
  log "Running verification only..."
  codesign --verify --deep --strict "$APP_BUNDLE"
  log "codesign --verify --deep --strict: OK"
  spctl -a -t exec -vv "$APP_BUNDLE" || warn "spctl assessment failed (expected for unsigned or un-notarized builds)"
  exit 0
fi

ENTITLEMENTS="$(dirname "$0")/macos-entitlements.plist"
if [ ! -f "$ENTITLEMENTS" ]; then
  die "Entitlements plist not found: $ENTITLEMENTS"
fi

# Sign inner binaries, frameworks, and plugins first
log "Signing inner binaries and frameworks..."
find "$APP_BUNDLE/Contents/MacOS" -type f -perm +111 -print0 2>/dev/null | while IFS= read -r -d '' f; do
  codesign --sign "$CODESIGN_IDENTITY" --force --options runtime --entitlements "$ENTITLEMENTS" "$f" 2>/dev/null || true
done

if [ -d "$APP_BUNDLE/Contents/Frameworks" ]; then
  find "$APP_BUNDLE/Contents/Frameworks" -type f \( -name '*.dylib' -o -perm +111 \) -print0 2>/dev/null | while IFS= read -r -d '' f; do
    codesign --sign "$CODESIGN_IDENTITY" --force --options runtime --entitlements "$ENTITLEMENTS" "$f" 2>/dev/null || true
  done
fi

# Sign the entire bundle
log "Signing app bundle..."
codesign --sign "$CODESIGN_IDENTITY" --force --deep --options runtime --entitlements "$ENTITLEMENTS" "$APP_BUNDLE"

# Verify signature
log "Verifying signature..."
codesign --verify --deep --strict "$APP_BUNDLE"
log "codesign --verify --deep --strict: OK"

# Notarization
if [ "$DO_NOTARIZE" = 1 ]; then
  APPLE_ID="${APPLE_ID:-}"
  APPLE_APP_SPECIFIC_PASSWORD="${APPLE_APP_SPECIFIC_PASSWORD:-}"
  APPLE_TEAM_ID="${APPLE_TEAM_ID:-}"

  if [ -z "$APPLE_ID" ] || [ -z "$APPLE_APP_SPECIFIC_PASSWORD" ] || [ -z "$APPLE_TEAM_ID" ]; then
    die "Notarization requires APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, and APPLE_TEAM_ID."
  fi

  ZIP_PATH="$(mktemp -t hilal-browser-notarize).zip"
  log "Creating zip for notarization: $ZIP_PATH"
  ditto -c -k --keepParent "$APP_BUNDLE" "$ZIP_PATH"

  log "Submitting to Apple notary service..."
  xcrun notarytool submit "$ZIP_PATH" \
    --apple-id "$APPLE_ID" \
    --password "$APPLE_APP_SPECIFIC_PASSWORD" \
    --team-id "$APPLE_TEAM_ID" \
    --wait

  log "Stapling notarization ticket..."
  xcrun stapler staple "$APP_BUNDLE"

  rm -f "$ZIP_PATH"

  log "Running final spctl assessment..."
  spctl -a -t exec -vv "$APP_BUNDLE"
  log "Notarization and stapling complete."
fi

log "Done."
