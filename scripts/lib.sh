# Shared helpers for the Hüma scripts. Source this from other scripts;
# do not execute it directly.
#
# Resolves the repo root and the Firefox source tree, and provides
# small logging / safety primitives.

# shellcheck shell=bash

set -u

# Repo root: the directory containing scripts/, patches/, branding/.
HUMA_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export HUMA_REPO_ROOT

# Firefox source tree. Default: <repo>/firefox. Override with
# HUMA_FIREFOX_SRC=/some/other/path before running any script.
HUMA_FIREFOX_SRC="${HUMA_FIREFOX_SRC:-$HUMA_REPO_ROOT/firefox}"
export HUMA_FIREFOX_SRC

log()  { printf '\033[1;34m[huma]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[huma]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[huma]\033[0m %s\n' "$*" >&2; exit 1; }

require_firefox_src() {
  if [ ! -d "$HUMA_FIREFOX_SRC" ]; then
    die "Firefox source tree not found at: $HUMA_FIREFOX_SRC
Hint: set HUMA_FIREFOX_SRC, or run scripts/setup-firefox.sh first."
  fi
  if [ ! -d "$HUMA_FIREFOX_SRC/.git" ]; then
    die "$HUMA_FIREFOX_SRC is not a git checkout. The patch workflow needs git."
  fi
  if [ ! -f "$HUMA_FIREFOX_SRC/mach" ]; then
    die "$HUMA_FIREFOX_SRC does not look like a Firefox source tree (no ./mach)."
  fi
}

# Read patches/series into a bash array, stripping comments and blanks.
read_series() {
  local series_file="$HUMA_REPO_ROOT/patches/series"
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
