#!/usr/bin/env bash
# scripts/setup-locales.sh
# Fetches official Firefox Turkish translations and integrates Hilal custom overlays.

set -euo pipefail

. "$(dirname "$0")/lib.sh"

require_firefox_src

L10N_TEMP="$HILAL_REPO_ROOT/scratch/l10n-temp"
TARGET_TR_DIR="$HILAL_FIREFOX_SRC/browser/locales/tr"

log "Creating cache directory at $L10N_TEMP"
mkdir -p "$L10N_TEMP"

(
  cd "$L10N_TEMP"
  if [ ! -d .git ]; then
    log "Initializing sparse git checkout for official locales..."
    git init
    git remote add origin https://github.com/mozilla-l10n/firefox-l10n.git
    git config core.sparseCheckout true
    echo "tr/*" >> .git/info/sparse-checkout
  fi

  log "Fetching official Turkish localizations..."
  git pull --depth=1 origin main
)

log "Copying official Turkish locales to source tree..."
mkdir -p "$TARGET_TR_DIR"

if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete "$L10N_TEMP/tr/" "$TARGET_TR_DIR/"
else
  rm -rf "$TARGET_TR_DIR"
  cp -r "$L10N_TEMP/tr" "$TARGET_TR_DIR"
fi

log "Merging Hilal custom Turkish translations..."
python3 "$HILAL_REPO_ROOT/scripts/merge-locales.py" "$HILAL_REPO_ROOT" "$HILAL_FIREFOX_SRC"

log "Locale setup successfully completed."
