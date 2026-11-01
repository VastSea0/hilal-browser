#!/usr/bin/env bash
# scripts/build-langpacks.sh
# Compiles custom language packs and copies them to distribution extensions.

set -euo pipefail

. "$(dirname "$0")/lib.sh"

require_firefox_src

usage() {
  cat <<'USAGE'
Usage:
  scripts/build-langpacks.sh [locale ...]

Examples:
  scripts/build-langpacks.sh tr
  scripts/build-langpacks.sh tr de fr
  HILAL_LOCALES="tr,de,fr" scripts/build-langpacks.sh

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

find_langpack() {
  local locale="$1"
  local dist_dir

  for dist_dir in "$HILAL_FIREFOX_SRC"/obj-*/dist; do
    [ -d "$dist_dir" ] || continue
    find "$dist_dir" -type f \( -name "*.${locale}.langpack.xpi" -o -name "*${locale}.langpack.xpi" \)
  done | sort | tail -n 1
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

ENGINE_DIST_EXT_DIR="$HILAL_FIREFOX_SRC/browser/app/distribution/extensions"
REPO_DIST_EXT_DIR="$HILAL_REPO_ROOT/changes/browser/app/distribution/extensions"
mkdir -p "$ENGINE_DIST_EXT_DIR" "$REPO_DIST_EXT_DIR"

for locale in "${LOCALES[@]}"; do
  log "Triggering $locale language pack compilation..."
  (
    cd "$HILAL_FIREFOX_SRC"
    ./mach build "langpack-$locale"
  )

  log "Locating compiled $locale language pack..."
  xpi_path="$(find_langpack "$locale")"

  if [ -z "$xpi_path" ] || [ ! -f "$xpi_path" ]; then
    die "Failed to locate compiled $locale language pack in object directory."
  fi

  log "Found compiled langpack at: $xpi_path"

  artifact_name="langpack-$locale@firefox.mozilla.org.xpi"
  cp -f "$xpi_path" "$ENGINE_DIST_EXT_DIR/$artifact_name"
  cp -f "$xpi_path" "$REPO_DIST_EXT_DIR/$artifact_name"

  log "$locale language pack bundled as $artifact_name."
done

log "Language pack build completed."
