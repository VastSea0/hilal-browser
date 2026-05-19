#!/usr/bin/env bash
# scripts/build-android.sh
#
# Convenience wrapper around ./mach for Hilal on Android.
#
# Usage:
#   scripts/build-android.sh [arch] [action] [args...]
#
# Architectures:
#   arm64      - 64-bit ARM devices (default)
#   x86_64     - 64-bit Android Emulator
#   arm        - 32-bit legacy ARM devices
#   x86        - 32-bit legacy Android Emulator
#
# Actions:
#   build      - Run full GeckoView build (default)
#   install    - Build and install Fenix debug app on device/emulator
#   gradle     - Run a custom gradle task (e.g. fenix:assembleDebug)
#   clean      - Run ./mach clobber
#
# Examples:
#   scripts/build-android.sh arm64 build
#   scripts/build-android.sh x86_64 install
#   scripts/build-android.sh arm64 gradle fenix:assembleDebug

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

# Help message
if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  sed -n '3,24p' "$0" | sed 's/^#//'
  exit 0
fi

require_firefox_src

# 1. Parse target architecture
ARCH="arm64"
if [ $# -gt 0 ]; then
  case "$1" in
    arm64|x86_64|arm|x86)
      ARCH="$1"
      shift
      ;;
  esac
fi

# 2. Parse action
ACTION="build"
if [ $# -gt 0 ]; then
  case "$1" in
    build|install|gradle|clean)
      ACTION="$1"
      shift
      ;;
  esac
fi

# 3. Apply patches and branding overlays
bash "$(dirname "$0")/apply.sh"

# 4. Copy selected Android mozconfig
MOZCONFIG_SRC="$HILAL_REPO_ROOT/mozconfigs/android-$ARCH"
if [ -f "$MOZCONFIG_SRC" ]; then
  log "Copying mozconfigs/android-$ARCH -> firefox/mozconfig"
  cp "$MOZCONFIG_SRC" "$HILAL_FIREFOX_SRC/mozconfig"
else
  die "Could not find Android configuration file: $MOZCONFIG_SRC"
fi

# 5. Execute requested action
case "$ACTION" in
  clean)
    log "Cleaning object directory..."
    (cd "$HILAL_FIREFOX_SRC" && ./mach clobber)
    ;;
  build)
    log "Building Android ($ARCH) target..."
    (cd "$HILAL_FIREFOX_SRC" && ./mach build)
    log "Done building GeckoView backend. Run with action 'install' or use './mach gradle fenix:assembleDebug' to build APK."
    ;;
  gradle)
    if [ $# -eq 0 ]; then
      die "Action 'gradle' requires at least one gradle task argument."
    fi
    log "Running gradle tasks: $*"
    (cd "$HILAL_FIREFOX_SRC" && ./mach gradle "$@")
    ;;
  install)
    log "Building and installing Fenix debug APK on active Android device/emulator..."
    (cd "$HILAL_FIREFOX_SRC" && ./mach build && ./mach android install-fenix)
    log "Done. Launch Fenix on your device or emulator."
    ;;
esac

log "Done."
