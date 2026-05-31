#!/usr/bin/env bash
# scripts/build-appimage.sh
#
# AppImage build and run automation.
# Creates an AppImage solely from the firefox-*.tar.xz package in the mach package output.
# Version detection prioritizes the Git tag.
#
# Usage:
#   scripts/build-appimage.sh build   # Create AppImage
#   scripts/build-appimage.sh run     # Run the existing AppImage

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

TARGET_DIST_DIR="$HILAL_REPO_ROOT/dist"
CONFIG_FILE="$HILAL_REPO_ROOT/config.yml"
APPIMAGE_TOOL_URL="https://github.com/AppImage/appimagetool/releases/download/continuous/appimagetool-x86_64.AppImage"
APP_NAME="Hilal"
APP_ID="org.gkdevstudio.Hilal"

usage() {
  cat <<'USAGE'
Usage:
  scripts/build-appimage.sh build   # Create AppImage
  scripts/build-appimage.sh run     # Run the existing AppImage
  scripts/build-appimage.sh clean   # Clean AppImage build artifacts

Notes:
  - The 'build' command converts firefox-*.tar.xz from the mach package output into an AppImage.
  - The 'appimagetool' utility must be installed on your system or present in .appimagetool.
USAGE
}

# Safely returns the path to the appimagetool executable
get_appimagetool_path() {
  if command -v appimagetool >/dev/null 2>&1; then
    echo "appimagetool"
    return 0
  fi

  if [ -f "$HILAL_REPO_ROOT/.appimagetool/appimagetool" ]; then
    echo "$HILAL_REPO_ROOT/.appimagetool/appimagetool"
    return 0
  fi

  return 1
}

need_appimagetool() {
  if get_appimagetool_path >/dev/null 2>&1; then
    return 0
  fi

  cat <<EOF >&2
${RED}[Error]${NC} appimagetool not found.
${YELLOW}[Installation]${NC} Run the following command to download and set up appimagetool:

  mkdir -p .appimagetool
  wget -O .appimagetool/appimagetool "$APPIMAGE_TOOL_URL"
  chmod +x .appimagetool/appimagetool

${YELLOW}[Alternative]${NC} To install it system-wide:
  sudo wget -O /usr/local/bin/appimagetool "$APPIMAGE_TOOL_URL"
  sudo chmod +x /usr/local/bin/appimagetool
EOF
  exit 1
}

# Searches specifically for firefox-*.tar.xz packages
find_package() {
  local pkg
  # First, search within the obj-dir build directory's dist folder
  pkg=$(find "$HILAL_FIREFOX_SRC"/obj-* -name "firefox-*.tar.xz" 2>/dev/null | head -1 || true)

  # If not found, fall back to the main dist directory
  if [ -z "$pkg" ]; then
    pkg=$(find "$TARGET_DIST_DIR" -name "firefox-*.tar.xz" 2>/dev/null | head -1 || true)
  fi
  printf '%s\n' "$pkg"
}

find_appimage() {
  find "$TARGET_DIST_DIR" -name "Hilal*.AppImage" 2>/dev/null | sort -V | tail -1
}

# Reads and sanitizes the version number using the closest Git tag
get_version_by_git_tag() {
  if command -v git >/dev/null 2>&1 && git -C "$HILAL_REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    local git_tag
    # Fetch the most recent git tag (including unannotated tags)
    git_tag=$(git -C "$HILAL_REPO_ROOT" describe --tags --abbrev=0 2>/dev/null || echo "")
    if [ -n "$git_tag" ]; then
      # If the tag starts with 'v', strip it (e.g., v1.53.0 -> 1.53.0)
      echo "${git_tag#v}"
      return 0
    fi
  fi
  return 1
}

# Fallback method: returns the latest commit hash when no Git tag is found
get_version_by_git_hash() {
  if command -v git >/dev/null 2>&1 && git -C "$HILAL_REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    local git_hash
    # Fetch the short hash of the latest commit (e.g., 7a3f2b1)
    git_hash=$(git -C "$HILAL_REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo "")
    if [ -n "$git_hash" ]; then
      echo "git-$git_hash"
      return 0
    fi
  fi
  return 1
}

cmd="${1:-build}"

case "$cmd" in
  -h|--help|help)
    usage
    exit 0
    ;;
  run)
    APPIMAGE=$(find_appimage)
    if [ -z "$APPIMAGE" ]; then
      die "No AppImage found to run. Please run 'scripts/build-appimage.sh build' first."
    fi
    log "Launching AppImage: $APPIMAGE"
    exec "$APPIMAGE"
    ;;
  clean)
    log "Cleaning AppImage temporary files..."
    rm -rf "$HILAL_REPO_ROOT/dist/AppDir"
    log "AppDir cleaned."
    exit 0
    ;;
  build)
    # Continue to build steps below
    ;;
  *)
    usage >&2
    die "Unknown command: $cmd"
    ;;
esac

echo -e "${BLUE}[AppImage Automation]${NC} Starting AppImage build process..."

need_appimagetool

PACKAGE_FILE=$(find_package)

if [ -z "$PACKAGE_FILE" ]; then
  echo -e "${YELLOW}[Info]${NC} Package file in 'firefox-*.tar.xz' format not found. Please run the build and package steps first." >&2
  echo -e "${YELLOW}[Hint]${NC} Run: scripts/build-linux.sh build package" >&2
  exit 1
fi

echo -e "${GREEN}[Found Archive]${NC} $PACKAGE_FILE"

APPDIR="$HILAL_REPO_ROOT/dist/AppDir"
log "Preparing AppDir: $APPDIR"
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr"

echo -e "${BLUE}[Process]${NC} Extracting archive..."
tar -xf "$PACKAGE_FILE" -C "$APPDIR/usr" --strip-components=1

mkdir -p "$APPDIR/usr/bin"

if [ ! -f "$APPDIR/usr/bin/firefox" ] && [ -f "$APPDIR/usr/firefox" ]; then
  ln -s ../firefox "$APPDIR/usr/bin/firefox" 2>/dev/null || true
fi

# Icon copying setup
ICON_SRC=""
for size in 128 64 48 32 16; do
  candidate="$HILAL_REPO_ROOT/branding/hilal/default${size}.png"
  if [ -f "$candidate" ]; then
    ICON_SRC="$candidate"
    break
  fi
done

if [ -n "$ICON_SRC" ]; then
  cp "$ICON_SRC" "$APPDIR/$APP_NAME.png"
  cp "$ICON_SRC" "$APPDIR/$APP_ID.png"
  mkdir -p "$APPDIR/usr/share/icons/hicolor/128x128/apps"
  cp "$ICON_SRC" "$APPDIR/usr/share/icons/hicolor/128x128/apps/$APP_ID.png"
else
  if [ -f "$HILAL_REPO_ROOT/branding/hilal/default.png" ]; then
    cp "$HILAL_REPO_ROOT/branding/hilal/default.png" "$APPDIR/$APP_NAME.png"
    cp "$HILAL_REPO_ROOT/branding/hilal/default.png" "$APPDIR/$APP_ID.png"
  else
    echo -e "${YELLOW}[Info]${NC} Icon file not found. Default icon placeholder will be used."
  fi
fi

# Desktop file copying/creation
DESKTOP_SRC="$HILAL_REPO_ROOT/flatpak/$APP_ID.desktop"
if [ ! -f "$DESKTOP_SRC" ]; then
  DESKTOP_SRC="$HILAL_REPO_ROOT/flatpak/org.gkdevstudio.Hilal.desktop"
fi

if [ -f "$DESKTOP_SRC" ]; then
  cp "$DESKTOP_SRC" "$APPDIR/$APP_NAME.desktop"
  mkdir -p "$APPDIR/usr/share/applications"
  cp "$DESKTOP_SRC" "$APPDIR/usr/share/applications/$APP_ID.desktop"
  sed -i "s|^Exec=.*|Exec=AppRun %u|g" "$APPDIR/$APP_NAME.desktop"
else
  cat > "$APPDIR/$APP_NAME.desktop" <<DESKTOP
[Desktop Entry]
Version=1.0
Type=Application
Name=Hilal
Comment=Hilal Browser
Exec=AppRun %u
Icon=$APP_NAME
Categories=Network;WebBrowser;
MimeType=text/html;text/xml;application/xhtml+xml;application/xml;application/rss+xml;application/rdf+xml;
StartupNotify=true
DESKTOP
fi

# Create AppRun script
cat > "$APPDIR/AppRun" <<'APPRUN'
#!/usr/bin/env bash
HERE="$(dirname "$(readlink -f "$0")")"
export LD_LIBRARY_PATH="$HERE/usr/lib:$HERE/usr/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
export XDG_DATA_DIRS="$HERE/usr/share:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"

if [ -f "$HERE/usr/firefox" ]; then
  exec "$HERE/usr/firefox" --name org.gkdevstudio.Hilal "$@"
elif [ -f "$HERE/usr/bin/firefox" ]; then
  exec "$HERE/usr/bin/firefox" --name org.gkdevstudio.Hilal "$@"
else
  echo "Failed to launch Hilal: firefox binary not found." >&2
  exit 1
fi
APPRUN
chmod +x "$APPDIR/AppRun"

mkdir -p "$TARGET_DIST_DIR"

# Version resolution (prioritizing Git tag, then Git commit hash)
VERSION=""
if get_version_by_git_tag >/dev/null; then
  VERSION=$(get_version_by_git_tag)
  echo -e "${GREEN}[Version]${NC} Version detected from Git Tag: $VERSION"
elif get_version_by_git_hash >/dev/null; then
  VERSION=$(get_version_by_git_hash)
  echo -e "${GREEN}[Version]${NC} Git Tag not found. Version detected from latest Git Commit Hash: $VERSION"
else
  # If no Git environment is available, try to parse the version string from the package filename
  if [ -n "$PACKAGE_FILE" ]; then
    VERSION=$(basename "$PACKAGE_FILE" | grep -oE '[0-9]+[.][0-9]+[^.]*' | head -1 || echo "unknown")
    echo -e "${YELLOW}[Version]${NC} Git metadata not found. Version parsed from package filename: $VERSION"
  else
    VERSION="unknown"
  fi
fi

ARCH="$(uname -m)"
APPIMAGE_NAME="Hilal-${VERSION}-${ARCH}.AppImage"
APPIMAGE_PATH="$TARGET_DIST_DIR/$APPIMAGE_NAME"

echo -e "${BLUE}[Process]${NC} Creating AppImage: $APPIMAGE_NAME"

export APPIMAGE_EXTRACT_AND_RUN=1
export ARCH="$ARCH"

TOOL_PATH=$(get_appimagetool_path)

if ! "$TOOL_PATH" "$APPDIR" "$APPIMAGE_PATH"; then
  echo -e "${RED}[Error]${NC} appimagetool encountered an error during execution!" >&2
  exit 1
fi

if [ -f "$APPIMAGE_PATH" ] ; then
  echo -e "${GREEN}[Success]${NC} AppImage successfully created: $APPIMAGE_PATH"

  # Update build count
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

  sed -i "s/^build_count:.*/build_count: $NEXT_BUILD/" "$CONFIG_FILE" 2>/dev/null || echo "build_count: $NEXT_BUILD" > "$CONFIG_FILE"

  # Clean temporary AppDir build directory
  rm -rf "$APPDIR"

  echo "RESULT_PATH:$APPIMAGE_PATH"
else
  die "Failed to create AppImage: $APPIMAGE_PATH"
fi

log "Done."