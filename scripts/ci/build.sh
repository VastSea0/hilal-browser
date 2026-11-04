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
./mach package

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
    find "$objdir/dist/install/sea" -maxdepth 1 -type f -name '*.installer.exe' -exec cp {} "$repo/dist/" \; 2>/dev/null || true
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
