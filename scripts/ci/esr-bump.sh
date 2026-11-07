#!/usr/bin/env bash
# Moves the Firefox base to the newest point release of the current ESR line.
# Prints the new version, or nothing when the pin is already the newest.
set -euo pipefail

repo="$(cd "$(dirname "$0")/../.." && pwd)"
upstream="${HILAL_FIREFOX_UPSTREAM:-https://github.com/mozilla-firefox/firefox.git}"

current="$(sed -n 's/^firefox_version *= *"\(.*\)"/\1/p' "$repo/upstream.lock")"
major="${current%%.*}"

# Tags look like FIREFOX_153_6_0esr_RELEASE; the dotted-out version sorts
# with sort -V.
latest_line="$(git ls-remote --tags "$upstream" "refs/tags/FIREFOX_${major}_*esr_RELEASE" |
  sed -E 's#^([0-9a-f]+)\trefs/tags/FIREFOX_([0-9_]+)esr_RELEASE$#\2 \1#' |
  awk '{ v=$1; gsub("_", ".", v); print v, $2 }' | sort -V | tail -n1)"
latest="${latest_line% *}esr"
commit="${latest_line#* }"

if [ -z "$latest_line" ] || [ "$latest" = "$current" ]; then
  exit 0
fi

sed -i.bak -E \
  -e "s/^(firefox_version *= *)\".*\"/\1\"$latest\"/" \
  -e "s/^(commit *= *)\".*\"/\1\"$commit\"/" "$repo/upstream.lock"
echo "$commit" > "$repo/FIREFOX_COMMIT"
sed -i.bak -E "s/^-[0-9.]+esr$/-$latest/" "$repo/changes/browser/config/version.patch"
rm -f "$repo/upstream.lock.bak" "$repo/changes/browser/config/version.patch.bak"

echo "$latest"
