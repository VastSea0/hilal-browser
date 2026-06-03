# Shared helpers for the Hilal scripts. Source this from other scripts;
# do not execute it directly.
#
# Resolves the repo root and the Firefox source tree, and provides
# small logging / safety primitives.

# shellcheck shell=bash

set -u

# Repo root: the directory containing scripts/, changes/.
HILAL_REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export HILAL_REPO_ROOT

# Firefox source tree. Default: <repo>/engine. Override with
# HILAL_FIREFOX_SRC=/some/other/path before running any script.
HILAL_FIREFOX_SRC="${HILAL_FIREFOX_SRC:-$HILAL_REPO_ROOT/engine}"
export HILAL_FIREFOX_SRC

log()  { printf '\033[1;34m[hilal]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[hilal]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[hilal]\033[0m %s\n' "$*" >&2; exit 1; }

require_firefox_src() {
  if [ ! -d "$HILAL_FIREFOX_SRC" ]; then
    die "Firefox source tree not found at: $HILAL_FIREFOX_SRC
Hint: set HILAL_FIREFOX_SRC, or run ./bin/hil setup first."
  fi
  if [ ! -d "$HILAL_FIREFOX_SRC/.git" ]; then
    die "$HILAL_FIREFOX_SRC is not a git checkout. The patch workflow needs git."
  fi
  if [ ! -f "$HILAL_FIREFOX_SRC/mach" ]; then
    die "$HILAL_FIREFOX_SRC does not look like a Firefox source tree (no ./mach)."
  fi
}

# Read patches from manifest.toml into a bash array, filtering for files ending in .patch.
read_series() {
  local manifest_file="$HILAL_REPO_ROOT/manifest.toml"
  [ -f "$manifest_file" ] || die "Missing manifest.toml file."
  # shellcheck disable=SC2034
  SERIES=()
  
  # Parse manifest.toml to get patch paths ending in .patch
  local patches_list
  patches_list=$(python3 -c "
import re
patches = []
current = {}
with open('$manifest_file', 'r') as f:
    for line in f:
        line = line.strip()
        if line == '[[patches]]':
            if 'path' in current and current['path'].endswith('.patch'):
                patches.append(current['path'])
            current = {}
        elif line.startswith('path'):
            m = re.match(r'path\s*=\s*\"([^\"]+)\"', line)
            if m:
                current['path'] = m.group(1)
if 'path' in current and current['path'].endswith('.patch'):
    patches.append(current['path'])
print('\n'.join(patches))
")
  
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    SERIES+=("$line")
  done <<< "$patches_list"
}
