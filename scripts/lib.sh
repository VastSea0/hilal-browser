# Shared helpers for the Hilal scripts. Source this from other scripts;
# do not execute it directly.
#
# Resolves the repo root and the Firefox source tree, and provides
# small logging / safety primitives.

# shellcheck shell=bash

set -u

# Repo root: the directory containing scripts/, patches/, branding/.
HILAL_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export HILAL_REPO_ROOT

# Firefox source tree. Default: <repo>/firefox. Override with
# HILAL_FIREFOX_SRC=/some/other/path before running any script.
HILAL_FIREFOX_SRC="${HILAL_FIREFOX_SRC:-$HILAL_REPO_ROOT/firefox}"
export HILAL_FIREFOX_SRC

log()  { printf '\033[1;34m[hilal]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[hilal]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[hilal]\033[0m %s\n' "$*" >&2; exit 1; }

require_firefox_src() {
  if [ ! -d "$HILAL_FIREFOX_SRC" ]; then
    die "Firefox source tree not found at: $HILAL_FIREFOX_SRC
Hint: set HILAL_FIREFOX_SRC, or run scripts/setup-firefox.sh first."
  fi
  if [ ! -d "$HILAL_FIREFOX_SRC/.git" ]; then
    die "$HILAL_FIREFOX_SRC is not a git checkout. The patch workflow needs git."
  fi
  if [ ! -f "$HILAL_FIREFOX_SRC/mach" ]; then
    die "$HILAL_FIREFOX_SRC does not look like a Firefox source tree (no ./mach)."
  fi
}

# Read patches/series into a bash array, stripping comments and blanks.
read_series() {
  local series_file="$HILAL_REPO_ROOT/patches/series"
  [ -f "$series_file" ] || die "Missing patches/series file."
  # shellcheck disable=SC2034
  SERIES=()
  while IFS= read -r line; do
    # strip leading/trailing whitespace
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [ -z "$line" ] && continue
    [ "${line:0:1}" = "#" ] && continue
    SERIES+=("$line")
  done < "$series_file"
}
