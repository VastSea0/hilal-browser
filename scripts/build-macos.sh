#!/usr/bin/env bash
# scripts/build-macos.sh
#
# Thin convenience wrapper around `./mach build` and `./mach package` for Hilal on macOS.
#
# Usage:
#   scripts/build-macos.sh                 # full build
#   scripts/build-macos.sh faster          # front-end only
#   scripts/build-macos.sh binaries        # C++/Rust only
#   scripts/build-macos.sh run             # build and run
#   scripts/build-macos.sh package         # build and package
#   scripts/build-macos.sh --no-symlinks   # copy instead of symlink prefs
#   scripts/build-macos.sh -- <args>       # pass arguments to mach build

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

require_firefox_src

if [ "$(uname -s)" != "Darwin" ]; then
  warn "This script is tuned for macOS. On Linux, please use build-linux.sh."
fi

# Parse args
NO_SYMLINKS=0
remaining=()
for arg in "$@"; do
  case "$arg" in
    --no-symlinks) NO_SYMLINKS=1 ;;
    *) remaining+=("$arg") ;;
  esac
done
set -- "${remaining[@]+"${remaining[@]}"}"

# Ensure patches/branding are applied
APPLY_ARGS=()
if [ "$NO_SYMLINKS" = 1 ]; then
  APPLY_ARGS+=(--no-symlinks)
fi
bash "$(dirname "$0")/apply.sh" "${APPLY_ARGS[@]+"${APPLY_ARGS[@]}"}"

# Copy macOS mozconfig
if [ -f "$(dirname "$0")/../mozconfigs/macos" ]; then
  log "Copying mozconfigs/macos -> firefox/mozconfig"
  cp "$(dirname "$0")/../mozconfigs/macos" "$HILAL_FIREFOX_SRC/mozconfig"
fi

cmd=("./mach" "build")
run_after=0
package_after=0

if [ $# -gt 0 ]; then
  case "$1" in
    faster)   cmd=("./mach" "build" "faster") ;;
    binaries) cmd=("./mach" "build" "binaries") ;;
    run)
      run_after=1
      ;;
    package)
      package_after=1
      ;;
    --) shift; cmd=("./mach" "build" "$@") ;;
    *)  cmd=("./mach" "build" "$@") ;;
  esac
fi

log "Building in $HILAL_FIREFOX_SRC: ${cmd[*]}"
log "(this can take 10-40 minutes on a first full build)"
(cd "$HILAL_FIREFOX_SRC" && "${cmd[@]}")

if [ "$run_after" = 1 ]; then
  log "Launching Hilal Browser..."
  (cd "$HILAL_FIREFOX_SRC" && ./mach run)
elif [ "$package_after" = 1 ]; then
  log "Packaging Hilal Browser..."
  (cd "$HILAL_FIREFOX_SRC" && ./mach package)
  log "Package created. Look in:"
  log "  $HILAL_FIREFOX_SRC/obj-aarch64-apple-darwin*/dist/"
fi

log "Done."

