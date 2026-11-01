#!/usr/bin/env bash
# scripts/setup-locales.sh
# Fetches official Firefox translations and integrates Hilal custom overlays.

set -euo pipefail

. "$(dirname "$0")/lib.sh"

require_firefox_src

usage() {
  cat <<'USAGE'
Usage:
  scripts/setup-locales.sh [locale ...]

Examples:
  scripts/setup-locales.sh tr
  scripts/setup-locales.sh de fr es-ES
  HILAL_LOCALES="tr,de,fr" scripts/setup-locales.sh

When no locale is passed, locales are discovered from changes/browser/locales/.
USAGE
}

discover_locales() {
  local locale_dir="$HILAL_REPO_ROOT/changes/browser/locales"
  if [ -d "$locale_dir" ]; then
    find "$locale_dir" -mindepth 1 -maxdepth 1 -type d ! -name en-US -exec basename {} \; | sort
  fi
}

normalize_locale_args() {
  if [ "$#" -gt 0 ]; then
    printf '%s\n' "$@"
  elif [ -n "${HILAL_LOCALES:-}" ]; then
    printf '%s\n' "$HILAL_LOCALES" | tr ', ' '\n'
  else
    discover_locales
  fi
}

validate_locale() {
  case "$1" in
    ""|*/*|.*|*..*)
      die "Invalid locale code: $1"
      ;;
  esac
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

LOCALES=()
while IFS= read -r locale; do
  [ -n "$locale" ] && LOCALES+=("$locale")
done < <(normalize_locale_args "$@" | awk 'NF' | sort -u)
if [ "${#LOCALES[@]}" -eq 0 ]; then
  LOCALES=(tr)
fi

for locale in "${LOCALES[@]}"; do
  validate_locale "$locale"
done

L10N_TEMP="$HILAL_REPO_ROOT/scratch/l10n-temp"

log "Creating cache directory at $L10N_TEMP"
mkdir -p "$L10N_TEMP"

(
  cd "$L10N_TEMP"
  if [ ! -d .git ]; then
    log "Initializing sparse git checkout for official locales..."
    git init
    git remote add origin https://github.com/mozilla-l10n/firefox-l10n.git
    git config core.sparseCheckout true
  else
    git remote set-url origin https://github.com/mozilla-l10n/firefox-l10n.git
  fi

  : > .git/info/sparse-checkout
  for locale in "${LOCALES[@]}"; do
    printf '%s/*\n' "$locale" >> .git/info/sparse-checkout
  done

  log "Fetching official Firefox localizations: ${LOCALES[*]}"
  git fetch --depth=1 origin main
  git reset --hard origin/main
  git read-tree -mu HEAD
)

for locale in "${LOCALES[@]}"; do
  source_dir="$L10N_TEMP/$locale"
  target_dir="$HILAL_FIREFOX_SRC/browser/locales/$locale"

  [ -d "$source_dir" ] || die "Locale '$locale' was not fetched from firefox-l10n."

  log "Copying official $locale locale files to source tree..."
  mkdir -p "$target_dir"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete "$source_dir/" "$target_dir/"
  else
    rm -rf "$target_dir"
    cp -R "$source_dir" "$target_dir"
  fi
done

log "Merging Hilal custom translations..."
python3 "$HILAL_REPO_ROOT/scripts/merge-locales.py" "$HILAL_REPO_ROOT" "$HILAL_FIREFOX_SRC" "${LOCALES[@]}"

log "Locale setup successfully completed."
