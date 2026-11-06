#!/usr/bin/env bash
# Installs Ubuntu packages on a CI runner, keeping the downloaded .debs in
# ~/apt-cache so actions/cache can restore them. The runners' Azure apt
# mirror sometimes needs half an hour for a few MB; with the cache apt only
# downloads what changed since the cache was made.
#
#   scripts/ci/apt-install.sh <package>...

set -euo pipefail

cache="$HOME/apt-cache"
mkdir -p "$cache/partial"
sudo apt-get update
sudo apt-get install -y --no-install-recommends -o Dir::Cache::Archives="$cache" "$@"
sudo rm -rf "$cache/partial" "$cache/lock"
sudo chown -R "$USER" "$cache"
