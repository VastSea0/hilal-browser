#!/usr/bin/env bash
# Build a complete MAR update for the current Firefox/Hilal build.

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

usage() {
  cat <<'EOF'
Usage:
  scripts/make-full-update.sh [--allow-unsigned] <app-version> [output.mar]

<app-version> is the Firefox application version of the build (for example
153.5.1), not Hilal's display version: the updater rejects a MAR whose version
is lower than the installed one.

Options:
  --allow-unsigned       Allow creating an unsigned MAR for development/local testing.

Environment:
  HILAL_MAR_CHANNEL_ID   MAR channel id to embed. Defaults to hilal-release.
  HILAL_MAR_SIGNING_KEY  PEM file with the RSA-4096 private key whose certificate
                         is changes/toolkit/mozapps/update/updater/release_primary.der.
                         Required unless --allow-unsigned is passed.
  HILAL_BUILD_MAR        Mozilla's build-mar CLI (pip install mar), used for
                         signing. Defaults to `mar` on PATH.
  HILAL_UPDATE_ROOT      Packaged app to make the MAR from instead of the build
                         tree's dist/firefox (a .app bundle on macOS).
  HILAL_UPDATE_PACKAGING_DIR
                         Firefox's tools/update-packaging, needed with
                         HILAL_UPDATE_ROOT.

Notes:
  Run after a successful package build. This creates a complete MAR from the
  packaged application in HILAL_FIREFOX_SRC/<objdir>/dist/firefox.
  Production update MARs must be signed with the private key matching the
  certificate embedded in the shipped updater. Signing uses build-mar, so it
  works on any host, including Linux hosts that cross-compile macOS and
  Windows builds.
EOF
}

ALLOW_UNSIGNED=0
ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --allow-unsigned)
      ALLOW_UNSIGNED=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      die "Unknown argument: $1"
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

if [ ${#ARGS[@]} -lt 1 ]; then
  usage
  exit 1
fi

version="${ARGS[0]}"
channel="${HILAL_MAR_CHANNEL_ID:-${MAR_CHANNEL_ID:-hilal-release}}"
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
out="${ARGS[1]:-$repo_root/dist/hilal-$version.complete.mar}"

if [ -n "${HILAL_UPDATE_ROOT:-}" ]; then
  # A packaged app outside a build tree, e.g. the ad-hoc signed macOS bundle.
  update_root="$HILAL_UPDATE_ROOT"
  packaging_dir="${HILAL_UPDATE_PACKAGING_DIR:?HILAL_UPDATE_PACKAGING_DIR must point at tools/update-packaging from Firefox}"
  mar_bin=""
  [ -d "$update_root" ] || die "HILAL_UPDATE_ROOT is not a directory: $update_root"
else
  require_firefox_src
  packaging_dir="$HILAL_FIREFOX_SRC/tools/update-packaging"

  log "Resolving Firefox object directory..."
  obj_dir="$(
    cd "$HILAL_FIREFOX_SRC"
    ./mach environment --format json | python3 -c 'import json, sys; print(json.load(sys.stdin)["topobjdir"])'
  )"

  dist_dir="$obj_dir/dist"
  package_root="$dist_dir/firefox"

  if [ ! -d "$package_root" ]; then
    die "Packaged app not found at $package_root. Run ./mach package first."
  fi

  mar_bin="$dist_dir/host/bin/mar"
  if [ ! -x "$mar_bin" ] && [ -x "$mar_bin.exe" ]; then
    mar_bin="$mar_bin.exe"
  fi

  update_root="$package_root"
  mac_app="$(find "$package_root" -maxdepth 1 -type d -name '*.app' | head -n 1 || true)"
  [ -n "$mac_app" ] && update_root="$mac_app"
fi

case "$update_root" in
  *.app) precomplete="$update_root/Contents/Resources/precomplete" ;;
  *) precomplete="$update_root/precomplete" ;;
esac

mkdir -p "$(dirname "$out")"
touch "$precomplete"

log "Creating complete MAR"
log "  version : $version"
log "  channel : $channel"
log "  source  : $update_root"
log "  output  : $out"

if [ -n "${HILAL_MAR_SIGNING_KEY:-}" ]; then
  [ -f "$HILAL_MAR_SIGNING_KEY" ] || die "HILAL_MAR_SIGNING_KEY does not point at a file: $HILAL_MAR_SIGNING_KEY"
  build_mar="${HILAL_BUILD_MAR:-mar}"
  command -v "$build_mar" >/dev/null 2>&1 || die "build-mar not found ($build_mar). Install it with: pip install mar"
  # make_full_update.sh runs `$MAR ... -C workdir -c output.mar files`. Host
  # mar resolves output.mar inside workdir, build-mar relative to the caller,
  # so the wrapper changes into workdir first.
  mar_command="$(mktemp)"
  cat > "$mar_command" <<EOF
#!/usr/bin/env bash
args=(); dir=.
while [ \$# -gt 0 ]; do
  case "\$1" in
    -C) dir="\$2"; shift 2 ;;
    *) args+=("\$1"); shift ;;
  esac
done
cd "\$dir" && exec "$(command -v "$build_mar")" -k "$HILAL_MAR_SIGNING_KEY" "\${args[@]}"
EOF
  chmod +x "$mar_command"
  log "  signing : $HILAL_MAR_SIGNING_KEY"
elif [ "$ALLOW_UNSIGNED" = "1" ]; then
  [ -x "$mar_bin" ] || die "MAR tool not found at $mar_bin. Build/package Firefox first."
  mar_command="$mar_bin"
  warn "MAR is unsigned. This is dangerous and not suitable for production updates."
else
  die "Production updates must be signed. Set HILAL_MAR_SIGNING_KEY or pass --allow-unsigned for development/testing."
fi

MAR="$mar_command" \
  MOZ_PRODUCT_VERSION="$version" \
  MAR_CHANNEL_ID="$channel" \
  "$packaging_dir/make_full_update.sh" "$out" "$update_root"

if [ -n "${HILAL_MAR_SIGNING_KEY:-}" ]; then
  # Check against the certificate the updater ships with, not the key itself,
  # so a key that does not match the updater fails here instead of in users'
  # browsers.
  cert="$repo_root/changes/toolkit/mozapps/update/updater/release_primary.der"
  pub="$(mktemp)"
  openssl x509 -inform der -in "$cert" -pubkey -noout > "$pub"
  "$build_mar" -k "$pub" -v "$out" || die "MAR signature does not match $cert: $out"
  rm -f "$pub" "$mar_command"
  log "Signed MAR verified against the updater certificate: $out"
fi

log "Complete MAR created: $out"
