#!/usr/bin/env bash
# Build a complete MAR update for the current Firefox/Hilal build.

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

usage() {
  cat <<'EOF'
Usage:
  scripts/make-full-update.sh <version> [output.mar]

Environment:
  HILAL_MAR_CHANNEL_ID   MAR channel id to embed. Defaults to hilal-release.
  HILAL_SIGNMAR_NSS_DIR  Optional NSS database containing the MAR signing cert.
  HILAL_SIGNMAR_CERT     Optional signing certificate nickname. Defaults to mar_sig.

Notes:
  Run after a successful package build. This creates a complete MAR from the
  packaged application in firefox/<objdir>/dist/firefox.
  Production update MARs must be signed with the private key matching the
  certificate embedded in the shipped updater.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ] || [ $# -lt 1 ]; then
  usage
  exit 0
fi

require_firefox_src

version="$1"
channel="${HILAL_MAR_CHANNEL_ID:-${MAR_CHANNEL_ID:-hilal-release}}"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
out="${2:-$repo_root/dist/hilal-$version.complete.mar}"

log "Resolving Firefox object directory..."
obj_dir="$(
  cd "$HILAL_FIREFOX_SRC"
  ./mach environment --format json | python3 -c 'import json, sys; print(json.load(sys.stdin)["topobjdir"])'
)"

dist_dir="$obj_dir/dist"
package_root="$dist_dir/firefox"

if [ ! -d "$package_root" ]; then
  die "Packaged app not found at $package_root. Run scripts/build-macos.sh package or scripts/build-linux.sh package first."
fi

mar_bin="$dist_dir/host/bin/mar"
if [ ! -x "$mar_bin" ] && [ -x "$mar_bin.exe" ]; then
  mar_bin="$mar_bin.exe"
fi
if [ ! -x "$mar_bin" ]; then
  die "MAR tool not found at $dist_dir/host/bin/mar. Build/package Firefox first."
fi

signmar_bin="$dist_dir/host/bin/signmar"
if [ ! -x "$signmar_bin" ] && [ -x "$signmar_bin.exe" ]; then
  signmar_bin="$signmar_bin.exe"
fi

update_root="$package_root"
mac_app="$(find "$package_root" -maxdepth 1 -type d -name '*.app' | head -n 1 || true)"
if [ -n "$mac_app" ]; then
  update_root="$mac_app"
  precomplete="$update_root/Contents/Resources/precomplete"
else
  precomplete="$update_root/precomplete"
fi

mkdir -p "$(dirname "$out")"
touch "$precomplete"

log "Creating complete MAR"
log "  version : $version"
log "  channel : $channel"
log "  source  : $update_root"
log "  output  : $out"

(
  cd "$HILAL_FIREFOX_SRC"
  MAR="$mar_bin" \
    MOZ_PRODUCT_VERSION="$version" \
    MAR_CHANNEL_ID="$channel" \
    ./tools/update-packaging/make_full_update.sh "$out" "$update_root"
)

if [ -n "${HILAL_SIGNMAR_NSS_DIR:-}" ]; then
  [ -x "$signmar_bin" ] || die "signmar tool not found at $dist_dir/host/bin/signmar. Build/package Firefox first."
  cert_name="${HILAL_SIGNMAR_CERT:-mar_sig}"
  signed_out="$out.signed"
  log "Signing complete MAR"
  log "  nss dir : $HILAL_SIGNMAR_NSS_DIR"
  log "  cert    : $cert_name"
  "$signmar_bin" -d "$HILAL_SIGNMAR_NSS_DIR" -n "$cert_name" -s "$out" "$signed_out"
  "$signmar_bin" -d "$HILAL_SIGNMAR_NSS_DIR" -n "$cert_name" -v "$signed_out"
  mv "$signed_out" "$out"
  log "Signed MAR verified: $out"
else
  warn "MAR is unsigned. Set HILAL_SIGNMAR_NSS_DIR for production updates."
fi

log "Complete MAR created: $out"
