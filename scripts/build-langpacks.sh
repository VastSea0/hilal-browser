#!/usr/bin/env bash
# scripts/build-langpacks.sh
# Compiles custom Turkish language pack and copies it to distribution extensions directory.

set -euo pipefail

. "$(dirname "$0")/lib.sh"

require_firefox_src

log "Triggering custom Turkish language pack compilation..."
(
  cd "$HILAL_FIREFOX_SRC"
  ./mach build langpack-tr
)

log "Locating compiled custom language pack..."
# Find langpack-tr xpi file in object directory under dist/
xpi_path=$(find "$HILAL_FIREFOX_SRC"/obj-*/dist -name "*tr.langpack.xpi" -type f | head -n 1)

if [ -z "$xpi_path" ] || [ ! -f "$xpi_path" ]; then
  die "Failed to locate compiled Turkish language pack in object directory."
fi

log "Found compiled langpack at: $xpi_path"

DIST_EXT_DIR="$HILAL_FIREFOX_SRC/browser/app/distribution/extensions"
mkdir -p "$DIST_EXT_DIR"

log "Copying langpack to distribution directory..."
cp -f "$xpi_path" "$DIST_EXT_DIR/langpack-tr@firefox.mozilla.org.xpi"

log "Custom Turkish language pack bundled successfully."
