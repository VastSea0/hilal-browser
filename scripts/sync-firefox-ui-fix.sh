#!/usr/bin/env bash
# scripts/sync-firefox-ui-fix.sh
#
# Refresh prefs/browser/themes/shared/firefox-ui-fix.css from upstream
# Firefox-UI-Fix (Lepton). Hilal-only rules stay in hilal-ui-overrides.css.
#
# Usage:
#   scripts/sync-firefox-ui-fix.sh              # build from upstream master
#   scripts/sync-firefox-ui-fix.sh v8.0.0       # build from tag or commit

set -euo pipefail

# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

REF="${1:-master}"
UPSTREAM_URL="${HILAL_FIREFOX_UI_FIX_UPSTREAM:-https://github.com/black7375/Firefox-UI-Fix.git}"
WORK_DIR="${HILAL_FIREFOX_UI_FIX_WORK:-$HILAL_REPO_ROOT/.cache/firefox-ui-fix}"
DEST="$HILAL_REPO_ROOT/prefs/browser/themes/shared/firefox-ui-fix.css"
SOURCE_META="$HILAL_REPO_ROOT/third_party/firefox-ui-fix/SOURCE"
HEADER='/* This file contains CSS derived from Firefox-UI-Fix (Lepton).
 * Upstream: https://github.com/black7375/Firefox-UI-Fix
 * License: MPL 2.0 — see third_party/firefox-ui-fix/LICENSE
 * Source pin: third_party/firefox-ui-fix/SOURCE
 *
 * Hilal ships this inside browser chrome (not profile userChrome.css), so
 * relative ../icons/ paths from upstream are rewritten to chrome:// URLs.
 */
'

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

require_cmd git
require_cmd python3

if ! command -v yarn >/dev/null 2>&1; then
  die "yarn is required to build upstream CSS. Install Node.js/yarn first."
fi

mkdir -p "$WORK_DIR"
if [ ! -d "$WORK_DIR/.git" ]; then
  log "Cloning Firefox-UI-Fix into $WORK_DIR"
  git clone "$UPSTREAM_URL" "$WORK_DIR"
else
  log "Fetching Firefox-UI-Fix"
  git -C "$WORK_DIR" fetch --tags origin
fi

log "Checking out $REF"
git -C "$WORK_DIR" checkout --force "$REF"
PINNED_COMMIT="$(git -C "$WORK_DIR" rev-parse HEAD)"
PINNED_DATE="$(git -C "$WORK_DIR" log -1 --format=%cs)"

log "Building Lepton CSS (yarn build:scss)"
(
  cd "$WORK_DIR"
  yarn install --immutable 2>/dev/null || yarn install
  yarn build:scss
)

BUILT="$WORK_DIR/css/leptonChrome.css"
[ -f "$BUILT" ] || die "Build did not produce $BUILT"

log "Applying Hilal chrome adaptations"
TMP="$(mktemp)"
python3 - "$BUILT" "$TMP" <<'PY'
import re
import sys

src_path, dst_path = sys.argv[1:3]
text = open(src_path, encoding="utf-8").read()
text = text.replace("../icons/", "chrome://browser/skin/icons/")
text = re.sub(r'\[customizing="true"\]', "[customizing]", text)
text = '@media -moz-pref("hilal.uifix.enabled") {\n' + text + "\n}\n"
open(dst_path, "w", encoding="utf-8").write(text)
PY

{
  printf '%s' "$HEADER"
  cat "$TMP"
} > "$DEST"
rm -f "$TMP"

if [ -f "$SOURCE_META" ]; then
  log "Updating $SOURCE_META"
  python3 - "$SOURCE_META" "$PINNED_COMMIT" "$PINNED_DATE" <<'PY'
import pathlib
import re
import sys

path, commit, date = sys.argv[1:4]
text = pathlib.Path(path).read_text(encoding="utf-8")
text = re.sub(r"^pinned_commit=.*$", f"pinned_commit={commit}", text, flags=re.M)
text = re.sub(r"^pinned_date=.*$", f"pinned_date={date}", text, flags=re.M)
pathlib.Path(path).write_text(text, encoding="utf-8")
PY
fi

log "Wrote $DEST (pinned $PINNED_COMMIT)"
log "Review the diff, then run scripts/apply.sh --force and test the browser UI."
