#!/usr/bin/env bash
# scripts/build-linux.sh
#
# Thin convenience wrapper around `./mach build` and `./mach package` for Hilal on Linux.
#
# Usage:
#   scripts/build-linux.sh                 # full build
#   scripts/build-linux.sh faster          # front-end only
#   scripts/build-linux.sh binaries        # C++/Rust only
#   scripts/build-linux.sh no-lag          # build using only 75% of CPU cores
#   scripts/build-linux.sh run             # build and run
#   scripts/build-linux.sh package         # build and package
#   scripts/build-linux.sh -- <args>       # pass arguments to mach build

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

require_firefox_src

if [ "$(uname -s)" != "Linux" ]; then
  warn "This script is tuned for Linux. On macOS, please use build-macos.sh."
fi

# Ensure patches/branding are applied
bash "$(dirname "$0")/apply.sh"

# Copy Linux mozconfig
if [ -f "$(dirname "$0")/../mozconfigs/linux" ]; then
  log "Copying mozconfigs/linux -> firefox/mozconfig"
  cp "$(dirname "$0")/../mozconfigs/linux" "$HILAL_FIREFOX_SRC/mozconfig"
fi

cmd=("./mach" "build")
run_after=0
package_after=0
no_lag_active=0
unknown_parameter=0

for arg in "$@"; do
  case "$arg" in
    faster)
      cmd+=("faster")
      ;;
    binaries)
      cmd+=("binaries")
      ;;
    no-lag)
      no_lag_active=1
      ;;
    run)
      run_after=1
      ;;
    package)
      package_after=1
      ;;
    --)
      shift
      if [ $# -gt 0 ]; then
        cmd+=("$@")
      fi
      break
      ;;
    *)
      cmd+=("$1")
      shift
      unknown_parameter+=1
      ;;
  esac
done

if [ $no_lag_active -eq 1 ]; then
  cpu=$(grep -c ^processor /proc/cpuinfo)
  process=$(( cpu * 75 / 100 ))
  [ $process -lt 1 ] && process=1
  cmd+=("-j${process}")
fi

if [ $unknown_parameter -gt 0 ]; then
  echo ""
  read -rp "Unknown parameters passed. Do you want to continue? [y/N] " response
  echo ""
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    log ""
    exit 1
  fi
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
  log "  $HILAL_FIREFOX_SRC/obj-x86_64-pc-linux-gnu/dist/"
fi

log "Done."
