#!/usr/bin/env bash
# scripts/build-macos.sh
#
# Thin convenience wrapper around `./mach build` for the Hilal workflow.
# Does not invent its own build system; delegates entirely to mach.
#
# Prerequisites (one-time, per Mozilla's setup docs):
#   https://firefox-source-docs.mozilla.org/setup/macos_build.html
#
# Usage:
#   scripts/build-macos.sh                 # full build
#   scripts/build-macos.sh faster          # front-end only (JS/HTML/CSS)
#   scripts/build-macos.sh binaries        # C++/Rust only, skip front-end
#   scripts/build-macos.sh run             # ./mach run after building
#   scripts/build-macos.sh -- <args>       # pass through to ./mach build

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

require_firefox_src

if [ "$(uname -s)" != "Darwin" ]; then
  warn "This script is tuned for macOS. On Linux/Windows, run ./mach directly."
fi

cmd=("./mach" "build")

if [ $# -gt 0 ]; then
  case "$1" in
    faster)   cmd=("./mach" "build" "faster") ;;
    binaries) cmd=("./mach" "build" "binaries") ;;
    run)
      log "Building, then running Hilal"
      (cd "$HILAL_FIREFOX_SRC" && ./mach build && ./mach run "${@:2}")
      exit 0
      ;;
    --) shift; cmd=("./mach" "build" "$@") ;;
    *)  cmd=("./mach" "build" "$@") ;;
  esac
fi

log "Building in $HILAL_FIREFOX_SRC: ${cmd[*]}"
log "(this can take 10-40 minutes on a first full build)"
(cd "$HILAL_FIREFOX_SRC" && "${cmd[@]}")

log "Build finished. Launch with: (cd $HILAL_FIREFOX_SRC && ./mach run)"
