#!/usr/bin/env bash
# scripts/setup-firefox.sh
#
# Clone (or fast-forward) the upstream Firefox source tree into the
# location the rest of the scripts expect. This script does NOT touch
# the huma-browser repo itself; it only manages the Firefox checkout.
#
# Default checkout location: <huma-browser>/firefox
# Override with HUMA_FIREFOX_SRC=/some/path before running.
#
# Usage:
#   scripts/setup-firefox.sh              # clone if missing, fetch if present
#   scripts/setup-firefox.sh --pull       # also fast-forward main

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

UPSTREAM_URL="${HUMA_FIREFOX_UPSTREAM:-https://github.com/mozilla-firefox/firefox.git}"
DO_PULL=0
for arg in "$@"; do
  case "$arg" in
    --pull) DO_PULL=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

if [ ! -d "$HUMA_FIREFOX_SRC/.git" ]; then
  log "Cloning Firefox from $UPSTREAM_URL"
  log "  destination: $HUMA_FIREFOX_SRC"
  log "  this may take a long time (~5+ GB)..."
  git clone "$UPSTREAM_URL" "$HUMA_FIREFOX_SRC"
else
  log "Firefox checkout already present at $HUMA_FIREFOX_SRC"
  log "Fetching upstream..."
  git -C "$HUMA_FIREFOX_SRC" fetch origin
fi

if [ "$DO_PULL" = 1 ]; then
  branch="$(git -C "$HUMA_FIREFOX_SRC" rev-parse --abbrev-ref HEAD)"
  log "Fast-forwarding $branch from origin/$branch"
  git -C "$HUMA_FIREFOX_SRC" merge --ff-only "origin/$branch"
fi

log "Firefox source ready at $HUMA_FIREFOX_SRC"
log "Next step: scripts/apply.sh"
