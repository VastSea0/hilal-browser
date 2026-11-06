#!/usr/bin/env bash
# Builds and packages Hilal for one target on a CI runner.
#
#   scripts/ci/build.sh linux|macos|windows
#
# Expects engine/ to be set up and patched (hil setup && hil apply --force).
# Linux builds natively. macOS and Windows are cross-compiled on Linux, the way
# Mozilla and Zen build them; configure bootstraps the macOS SDK and the
# Windows sysroot from Mozilla's public toolchain index.
#
# The packages end up in dist/.

set -euo pipefail

target="${1:?usage: scripts/ci/build.sh linux|macos|windows}"
repo="$(cd "$(dirname "$0")/../.." && pwd)"
engine="$repo/engine"

case "$target" in
  linux|macos|windows) ;;
  *) echo "Unknown target: $target" >&2; exit 2 ;;
esac

cp "$repo/mozconfigs/ci-$target" "$engine/mozconfig"
echo "=== mozconfig ($target)"
cat "$engine/mozconfig"

cd "$engine"
export MOZBUILD_STATE_PATH="${MOZBUILD_STATE_PATH:-$HOME/.mozbuild}"

./mach --no-interactive build

# Translations are compiled into the app instead of shipped as langpack
# add-ons: release builds require signed langpacks and ours cannot be signed.
IFS=', ' read -r -a locales <<< "${HILAL_LOCALES:-tr}"
"$repo/scripts/setup-locales.sh" "${locales[@]}"
./mach package-multi-locale --locales en-US "${locales[@]}"

objdir="$(./mach environment --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["topobjdir"])')"
mkdir -p "$repo/dist"

case "$target" in
  linux)
    find "$objdir/dist" -maxdepth 1 -type f -name '*.linux-*.tar.*' \
      ! -name '*.tests.*' ! -name '*.crashreporter-symbols*' \
      -exec cp {} "$repo/dist/" \;
    ;;
  macos)
    find "$objdir/dist" -maxdepth 1 -type f -name '*.dmg' -exec cp {} "$repo/dist/" \;
    ;;
  windows)
    find "$objdir/dist" -maxdepth 1 -type f -name '*.win64.zip' -exec cp {} "$repo/dist/" \;
    # make package writes the installer next to the zip (dist/install/sea in
    # Mozilla's automation). A release without it is broken, so fail here.
    installer="$(find "$objdir/dist" -maxdepth 3 -type f -name '*.installer.exe' | head -n1)"
    [ -n "$installer" ] || { echo "No Windows installer was built." >&2; exit 1; }
    cp "$installer" "$repo/dist/"
    ;;
esac

# The packaged app version, used by later steps for naming.
python3 - "$objdir/dist/bin/application.ini" "$objdir/dist/Hilal Browser.app/Contents/Resources/application.ini" <<'EOF' > "$repo/dist/BUILD_INFO" || true
import configparser, sys
for path in sys.argv[1:]:
    c = configparser.ConfigParser()
    if c.read(path):
        app = c["App"]
        print(f"version={app.get('Version')}\nbuildid={app.get('BuildID')}")
        break
EOF

echo "=== dist/"
ls -la "$repo/dist"
