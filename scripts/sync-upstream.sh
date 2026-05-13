#!/usr/bin/env bash
# scripts/sync-upstream.sh
#
# Pull the latest Firefox upstream, reset the working tree, and
# re-apply all Hilal patches on top. Intended to be the one-shot
# command to run after an upstream bump.
#
# What it does:
#   1. git -C $HILAL_FIREFOX_SRC fetch + fast-forward main
#   2. git reset --hard origin/main
#   3. Remove the branding/hilal overlay directory (so apply.sh recreates it)
#   4. Run scripts/apply.sh
#   5. Print a reminder to run a build and verify
#
# If a patch fails to apply because upstream changed conflicting code,
# the script will stop and tell you which patch failed. Fix the patch
# by hand in the Firefox tree, then run scripts/refresh.sh.
#
# Usage:
#   scripts/sync-upstream.sh
#   scripts/sync-upstream.sh --branch <name>   # default: current branch in checkout

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

BRANCH=""
for arg in "$@"; do
  case "$arg" in
    --branch)
      shift; BRANCH="${1:-}"; shift || true ;;
    -h|--help)
      sed -n '2,20p' "$0"; exit 0 ;;
    *) ;;
  esac
done

require_firefox_src

if [ -z "$BRANCH" ]; then
  BRANCH="$(git -C "$HILAL_FIREFOX_SRC" rev-parse --abbrev-ref HEAD)"
fi

log "Upstream sync starting"
log "  Firefox src : $HILAL_FIREFOX_SRC"
log "  Branch      : $BRANCH"

# Refuse to clobber local commits silently.
unmerged_commits="$(git -C "$HILAL_FIREFOX_SRC" rev-list "@{u}..HEAD" 2>/dev/null | wc -l | tr -d ' ' || echo 0)"
if [ "$unmerged_commits" != "0" ]; then
  warn "$unmerged_commits commit(s) on $BRANCH are not in origin/$BRANCH."
  warn "Refusing to fast-forward. Either commit them via scripts/refresh.sh"
  warn "(--from-commits) or stash and rerun."
  exit 1
fi

log "Fetching upstream..."
git -C "$HILAL_FIREFOX_SRC" fetch origin

log "Resetting $BRANCH to origin/$BRANCH (working tree changes will be discarded)"
git -C "$HILAL_FIREFOX_SRC" checkout "$BRANCH"
git -C "$HILAL_FIREFOX_SRC" reset --hard "origin/$BRANCH"
git -C "$HILAL_FIREFOX_SRC" clean -fdx -- browser/branding/hilal || true
git -C "$HILAL_FIREFOX_SRC" clean -fdx -- browser/branding/huma || true

log "Re-applying Hilal patches"
"$HILAL_REPO_ROOT/scripts/apply.sh"

log "Upstream sync complete."
log "Next: scripts/build-macos.sh and verify the browser still launches."
