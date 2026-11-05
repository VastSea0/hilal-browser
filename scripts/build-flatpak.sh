#!/usr/bin/env bash
#
# scripts/build-flatpak.sh
# Flatpak build, install, run, lint, clean, and readiness-check automation.
# Modified to use only the build output (tar.xz) in the dist/ directory as the source.
# Uses Git tag and date info for dynamic naming and manifest updates.
#
# Usage:
# scripts/build-flatpak.sh build        # Create a Flatpak bundle
# scripts/build-flatpak.sh install      # Build and install to user local directory
# scripts/build-flatpak.sh run [args]   # Run the installed Flatpak
# scripts/build-flatpak.sh lint         # Run manifest and metadata linters
# scripts/build-flatpak.sh check-ready  # Check version metadata suitability for stable release
# scripts/build-flatpak.sh clean        # Clean Flatpak build artifacts

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ -f "$(dirname "$0")/lib.sh" ]; then
    # shellcheck source=/dev/null
    . "$(dirname "$0")/lib.sh"
else
    log() { echo -e "${BLUE}[INFO]${NC} $*"; }
    warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
    die() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }
fi

HILAL_REPO_ROOT="$(cd "$(dirname "$0")/../" && pwd)"
TARGET_DIST_DIR="${HILAL_REPO_ROOT}/dist"
CONFIG_FILE="${HILAL_REPO_ROOT}/config.yml"
APP_ID="io.github.VastSea0.Hilal"
BUILD_DIR="${HILAL_REPO_ROOT}/flatpak-build"
REPO_DIR="${HILAL_REPO_ROOT}/repo"

usage() {
    cat <<'USAGE'
Usage:
  scripts/build-flatpak.sh build        # Create a Flatpak bundle (Uses only the package under dist/)
  scripts/build-flatpak.sh install      # Build and install to user local directory
  scripts/build-flatpak.sh run [args]   # Run the installed Flatpak
  scripts/build-flatpak.sh lint         # Run manifest and metadata linters
  scripts/build-flatpak.sh check-ready  # Verify stable release readiness of metadata
  scripts/build-flatpak.sh clean        # Clean Flatpak build artifacts
USAGE
}

need() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

get_git_tag() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        git describe --tags --abbrev=0 2>/dev/null || echo "v0.1.0"
    else
        echo "v0.1.0"
    fi
}

get_git_date() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        local tag
        tag=$(get_git_tag)
        git log -1 --format=%cd --date=format:'%Y%m%d' "$tag" 2>/dev/null || date +'%Y%m%d'
    else
        date +'%Y%m%d'
    fi
}

find_package() {
    local pkg
    pkg=$(find "$TARGET_DIST_DIR" -maxdepth 1 -type f \( \
        -name "firefox-*.tar.xz" -o \
        -name "firefox-*.tar.gz" -o \
        -name "hilal-*.tar.xz" -o \
        -name "hilal-*.tar.gz" \
    \) 2>/dev/null | head -1 || true)
    printf '%s\n' "$pkg"
}

find_manifest() {
    local candidate
    for candidate in \
        "$HILAL_REPO_ROOT/flatpak/$APP_ID.json" \
        "$HILAL_REPO_ROOT/$APP_ID.json" \
        "$HILAL_REPO_ROOT/flatpak/io.github.VastSea0.Hilal.json" \
        "$HILAL_REPO_ROOT/io.github.VastSea0.Hilal.json"; do
        if [ -f "$candidate" ]; then
            echo "$candidate"
            return 0
        fi
    done
    return 0
}

display_version() {
    local version_patch="$HILAL_REPO_ROOT/changes/browser/config/version.patch"
    if [ -f "$version_patch" ]; then
        awk '/^\+[0-9]/{ sub(/^\+/, ""); print; exit }' "$version_patch"
    elif [ -f "$HILAL_REPO_ROOT/manifest.toml" ]; then
        awk '
          /^\[browser\]/ { in_browser=1; next }
          /^\[/ { in_browser=0 }
          in_browser && /^[[:space:]]*version[[:space:]]*=/ {
            gsub(/"/, "", $3)
            print $3
            exit
          }
        ' "$HILAL_REPO_ROOT/manifest.toml"
    else
        get_git_tag
    fi
}

manifest_hilal_tag() {
    local candidate manifest_path tag
    manifest_path=$(find_manifest)
    for candidate in \
        "$manifest_path" \
        "$HILAL_REPO_ROOT/$APP_ID.yml" \
        "$HILAL_REPO_ROOT/$APP_ID.yaml" \
        "$HILAL_REPO_ROOT/flatpak/$APP_ID.yml" \
        "$HILAL_REPO_ROOT/flatpak/$APP_ID.yaml"; do
        [ -n "$candidate" ] && [ -f "$candidate" ] || continue
        tag=$(awk -F ':' '
          /^[[:space:]]*"tag"[[:space:]]*:/ || /^[[:space:]]*tag[[:space:]]*:/ {
            value=$2
            gsub(/^[[:space:]"\047]+/, "", value)
            gsub(/[",#[:space:]].*$/, "", value)
            print value
            exit
          }
        ' "$candidate")
        if [ -n "$tag" ]; then
            printf '%s\n' "$tag"
            return 0
        fi
    done
    echo ""
}

flatpak_lint() {
    local manifest_path
    manifest_path=$(find_manifest)
    if [ -z "$manifest_path" ]; then
        echo -e "${RED}[Error]${NC} Cannot run lint: Manifest not found."
        return 1
    fi
    echo -e "${BLUE}[Lint]${NC} Validating manifest and application metadata..."
    
    if command -v flatpak-builder-lint >/dev/null 2>&1; then
        flatpak-builder-lint manifest "$manifest_path"
    elif command -v flatpak >/dev/null 2>&1; then
        flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest "$manifest_path"
    else
        warn "Skipping flatpak-builder-lint: install flatpak-builder-lint or org.flatpak.Builder."
    fi

    local desktop_file="$HILAL_REPO_ROOT/flatpak/$APP_ID.desktop"
    if [ -f "$desktop_file" ] && command -v desktop-file-validate >/dev/null 2>&1; then
        desktop-file-validate "$desktop_file"
    else
        warn "Skipping desktop-file-validate: command not found or desktop file missing."
    fi

    local metainfo_file="$HILAL_REPO_ROOT/flatpak/$APP_ID.metainfo.xml"
    if [ -f "$metainfo_file" ] && command -v appstreamcli >/dev/null 2>&1; then
        appstreamcli validate --strict "$metainfo_file"
    else
        warn "Skipping appstreamcli: command not found or metainfo file missing."
    fi

    if [ -d "$REPO_DIR" ]; then
        if command -v flatpak-builder-lint >/dev/null 2>&1; then
            flatpak-builder-lint repo "$REPO_DIR"
        elif command -v flatpak >/dev/null 2>&1; then
            flatpak run --command=flatpak-builder-lint org.flatpak.Builder repo "$REPO_DIR"
        fi
    else
        warn "Skipping repo lint: $REPO_DIR does not exist yet."
    fi
}

check_stable_ready() {
    local version tag bad=0
    version="$(display_version)"
    tag="$(manifest_hilal_tag)"
    
    case "$version" in
        *alpha*|*beta*|*nightly*|*dev*|*a[0-9]*)
            warn "Display version is not Flathub-stable ready: $version"
            bad=1
            ;;
    esac
    case "$tag" in
        *alpha*|*beta*|*nightly*|*dev*|*a[0-9]*|"")
            warn "Manifest source tag is not Flathub-stable ready: ${tag:-}"
            bad=1
            ;;
    esac
    if [ "$bad" = 1 ]; then
        die "Flatpak packaging is present, but Flathub stable submission must wait for a stable release tag."
    fi
    log "Flatpak metadata is stable-release ready: version=$version tag=$tag"
}

force_cleanup_fuse() {
    local mountpoint
    if [ -d "$HILAL_REPO_ROOT/.flatpak-builder" ]; then
        find "$HILAL_REPO_ROOT/.flatpak-builder" -type d -name "rofiles-*" 2>/dev/null | while read -r mountpoint; do
            if mountpoint -q "$mountpoint" 2>/dev/null || (command -v gvfs-mount >/dev/null && gvfs-mount -l 2>/dev/null | grep -q "$mountpoint"); then
                echo -e "${YELLOW}[Cleanup]${NC} Cleaning up locked FUSE mountpoint: $mountpoint"
                if command -v fusermount3 >/dev/null 2>&1; then
                    fusermount3 -u -z "$mountpoint" 2>/dev/null || true
                elif command -v fusermount >/dev/null 2>&1; then
                    fusermount -u -z "$mountpoint" 2>/dev/null || true
                else
                    umount -l "$mountpoint" 2>/dev/null || true
                fi
            fi
        done
    fi
}

cmd="${1:-build}"
case "$cmd" in
    -h|--help|help)
        usage
        exit 0
        ;;
    run)
        need flatpak
        log "Starting Hilal Flatpak: $APP_ID"
        shift
        flatpak run "$APP_ID" "$@"
        exit 0
        ;;
    lint)
        flatpak_lint
        exit 0
        ;;
    check-ready)
        check_stable_ready
        exit 0
        ;;
    clean)
        force_cleanup_fuse
        rm -rf "$BUILD_DIR" "$REPO_DIR"
        rm -rf "$TARGET_DIST_DIR/flatpak-src"
        log "Temporary Flatpak build directories cleaned."
        exit 0
        ;;
    build|install)
        ;;
    *)
        usage >&2
        die "Unknown command: $cmd"
        ;;
esac

force_cleanup_fuse

echo -e "${BLUE}[Flatpak Automation]${NC} Scanning dist/ directory for local packages..."
PACKAGE_FILE=$(find_package)
if [ -z "$PACKAGE_FILE" ]; then
    echo -e "${RED}[Error]${NC} A compiled package (.tar.xz or .tar.gz) must exist in 'dist/' to build the Flatpak!" >&2
    echo -e "${YELLOW}[Tip]${NC} Please move or copy the build artifact into the 'dist/' folder." >&2
    exit 1
fi
echo -e "${GREEN}[Found Package]${NC} $PACKAGE_FILE"

GIT_TAG=$(get_git_tag)
GIT_DATE=$(get_git_date)
echo -e "${GREEN}[Git Details]${NC} Latest Tag: $GIT_TAG | Tag Date: $GIT_DATE"

LOCAL_SRC_DIR="$TARGET_DIST_DIR/flatpak-src"
echo -e "${BLUE}[Action]${NC} Extracting package to temporary Flatpak source directory: $LOCAL_SRC_DIR"
rm -rf "$LOCAL_SRC_DIR"
mkdir -p "$LOCAL_SRC_DIR"
tar -xf "$PACKAGE_FILE" -C "$LOCAL_SRC_DIR" --strip-components=1

if [ -d "$HILAL_REPO_ROOT/flatpak" ]; then
    echo -e "${BLUE}[Action]${NC} Copying auxiliary flatpak/ files to source directory..."
    find "$HILAL_REPO_ROOT/flatpak" -maxdepth 1 ! -name "*.json" ! -name "*.json.bak" -not -path "$HILAL_REPO_ROOT/flatpak" -exec cp -R -t "$LOCAL_SRC_DIR/" {} +
fi
if [ -d "$HILAL_REPO_ROOT/branding/hilal" ]; then
    echo -e "${BLUE}[Action]${NC} Copying icons from branding/hilal to source directory..."
    mkdir -p "$LOCAL_SRC_DIR/branding/hilal"
    cp "$HILAL_REPO_ROOT/branding/hilal"/default*.png "$LOCAL_SRC_DIR/branding/hilal/" 2>/dev/null || true
fi

MANIFEST_PATH=$(find_manifest)
if [ -z "$MANIFEST_PATH" ]; then
    echo -e "${RED}[Error]${NC} Flatpak manifest file ($APP_ID.json) not found!" >&2
    exit 1
fi
echo -e "${GREEN}[Found Manifest]${NC} $MANIFEST_PATH"

MANIFEST_BAK="${MANIFEST_PATH}.bak"
cp "$MANIFEST_PATH" "$MANIFEST_BAK"
cleanup() {
    if [ -f "$MANIFEST_BAK" ]; then
        echo -e "${BLUE}[Cleanup]${NC} Restoring original Flatpak manifest file..."
        mv "$MANIFEST_BAK" "$MANIFEST_PATH"
    fi
    rm -rf "$LOCAL_SRC_DIR"
    force_cleanup_fuse
}
trap cleanup EXIT INT TERM

echo -e "${BLUE}[Action]${NC} Redirecting Flatpak manifest to local sources with dynamic Git metadata..."
MANIFEST_PATH="$MANIFEST_PATH" LOCAL_SRC_DIR="$LOCAL_SRC_DIR" GIT_TAG="$GIT_TAG" python3 - <<'EOF'
import json
import sys
import os

manifest_file = os.environ['MANIFEST_PATH']
local_dir = os.environ['LOCAL_SRC_DIR']
git_tag = os.environ['GIT_TAG']

with open(manifest_file, 'r') as f:
    try:
        data = json.load(f)
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        sys.exit(1)

patched_count = 0

def patch_recursive(node):
    global patched_count
    if isinstance(node, dict):
        name = node.get('name', '')
        if isinstance(name, str) and any(x in name.lower() for x in ['hilal', 'firefox']):
            node['sources'] = [{
                "type": "dir",
                "path": local_dir
            }]
            node.pop('branch', None)
            node.pop('tag', None)
            node.pop('commit', None)
            print(f"-> Redirected '{name}' module to local directory ({local_dir}).")
            patched_count += 1

        for key, val in list(node.items()):
            patch_recursive(val)
            
    elif isinstance(node, list):
        for item in node:
            patch_recursive(item)

patch_recursive(data)

if patched_count == 0 and 'modules' in data and len(data['modules']) > 0:
    last_mod = data['modules'][-1]
    last_mod['sources'] = [{
        "type": "dir",
        "path": local_dir
    }]
    print(f"-> Last module '{last_mod.get('name')}' redirected to local directory as a fallback safety measure.")

if 'x-git-tag' in data:
    data['x-git-tag'] = git_tag
if 'tag' in data:
    data['tag'] = git_tag

with open(manifest_file, 'w') as f:
    json.dump(data, f, indent=2)
EOF

echo -e "${BLUE}[Flatpak Automation]${NC} Starting Flatpak $cmd process..."
FLATPAK_BUNDLE_NAME="hilal-${GIT_TAG}-${GIT_DATE}.flatpak"
FLATPAK_BUNDLE=""
mkdir -p "$BUILD_DIR"
BUILD_SUCCESS=0

log "Starting standard Flatpak build..."
if [ "$cmd" = "install" ]; then
    if flatpak-builder --force-clean --user --install "$BUILD_DIR" "$MANIFEST_PATH"; then
        BUILD_SUCCESS=1
    fi
else
    if flatpak-builder --force-clean --repo="$REPO_DIR" "$BUILD_DIR" "$MANIFEST_PATH"; then
        BUILD_SUCCESS=1
    fi
fi

# If standard build fails, unlock FUSE and retry with the --no-rofiles-fuse flag
if [ "$BUILD_SUCCESS" -eq 0 ]; then
    warn "Standard build failed (likely due to a FUSE/rofiles locking issue)."
    warn "Starting auto-recovery: Clearing hung connections and retrying with --no-rofiles-fuse parameter..."

    force_cleanup_fuse
    if [ "$cmd" = "install" ]; then
        flatpak-builder --force-clean --no-rofiles-fuse --user --install "$BUILD_DIR" "$MANIFEST_PATH"
    else
        flatpak-builder --force-clean --no-rofiles-fuse --repo="$REPO_DIR" "$BUILD_DIR" "$MANIFEST_PATH"
    fi
    log "Fallback build mode (--no-rofiles-fuse) completed successfully!"
fi

if [ "$cmd" != "install" ]; then
    FLATPAK_BUNDLE="$TARGET_DIST_DIR/$FLATPAK_BUNDLE_NAME"
    echo -e "${BLUE}[Action]${NC} Generating dynamic Flatpak bundle: $FLATPAK_BUNDLE"
    flatpak build-bundle "$REPO_DIR" "$FLATPAK_BUNDLE" "$APP_ID"
fi
echo -e "\n--------------------------------------------------"

CURRENT_BUILD=0
if [ -f "$CONFIG_FILE" ]; then
    CURRENT_BUILD=$(grep -E '^build_count:' "$CONFIG_FILE" | awk '{print $2}' || echo 0)
    if [[ ! "$CURRENT_BUILD" =~ ^[0-9]+$ ]]; then
        CURRENT_BUILD=0
    fi
else
    mkdir -p "$(dirname "$CONFIG_FILE")"
    echo "build_count: 0" > "$CONFIG_FILE"
fi
NEXT_BUILD=$((CURRENT_BUILD + 1))

sed -i "s/^build_count:.*/build_count: $NEXT_BUILD/" "$CONFIG_FILE" 2>/dev/null || \
echo "build_count: $NEXT_BUILD" > "$CONFIG_FILE"

if [ "$cmd" = "install" ]; then
    if flatpak info "$APP_ID" >/dev/null 2>&1; then
        echo -e "${GREEN}[Success]${NC} Flatpak successfully installed: $APP_ID"
        echo -e "${YELLOW}[To Run]${NC} scripts/build-flatpak.sh run"
    else
        echo -e "${YELLOW}[Info]${NC} Flatpak build completed. Installation verification could not be performed."
    fi
    exit 0
fi

if [ -n "$FLATPAK_BUNDLE" ] && [ -f "$FLATPAK_BUNDLE" ]; then
    echo -e "${GREEN}[Success]${NC} Flatpak bundle saved to dist/ directory: $FLATPAK_BUNDLE"
else
    echo -e "${YELLOW}[Info]${NC} Flatpak build completed. Bundle file could not be automatically detected."
    echo -e "${YELLOW}[Info]${NC} Flatpak installation can be performed using the 'scripts/build-flatpak.sh install' command."
fi

log "Done."
