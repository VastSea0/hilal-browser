#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

"""Builds and signs the Android live update bundle from android/ota/.

    build.py --key signing-key.pem --out ota.json [--latest-apk apk.json]

Writes the envelope {"payload": base64(json), "signature": base64(der)} that
LiveUpdates.kt verifies. Without --key it only validates the sources and prints
the payload, which is how pull requests are checked.
"""

import argparse
import base64
import json
import re
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "android" / "ota"
APP_KEY_FILE = ROOT / "android/app/src/main/java/com/vastsea/hilal/live/LiveUpdates.kt"
RUN_AT = {"document_start", "document_end", "document_idle"}
MAX_BYTES = 1_000_000


def fail(message):
    print(f"error: {message}", file=sys.stderr)
    sys.exit(1)


def check_version_range(where, entry):
    for key in ("minVersionCode", "maxVersionCode"):
        if key in entry and not isinstance(entry[key], int):
            fail(f"{where}: {key} must be an integer")


def check_text(where, value):
    if isinstance(value, str) and value:
        return
    if isinstance(value, dict) and value and all(isinstance(v, str) for v in value.values()):
        return
    fail(f"{where}: expected a string or a {{language: text}} object")


def load_config():
    config = json.loads((SOURCE / "config.json").read_text())
    flags = config.get("flags", {})
    for name, value in flags.items():
        if isinstance(value, dict):
            check_version_range(f"flag {name}", value)
            if not isinstance(value.get("value"), bool):
                fail(f"flag {name}: value must be true or false")
        elif not isinstance(value, bool):
            fail(f"flag {name}: must be true, false or an object with value")
    ids = set()
    for notice in config.get("notices", []):
        nid = notice.get("id")
        if not nid or nid in ids:
            fail(f"notice {nid!r}: needs a unique id")
        ids.add(nid)
        check_text(f"notice {nid} title", notice.get("title"))
        if "body" in notice:
            check_text(f"notice {nid} body", notice["body"])
        if "url" in notice and not notice["url"].startswith("https://"):
            fail(f"notice {nid}: url must be https")
        check_version_range(f"notice {nid}", notice)
    for engine in config.get("searchEngines", []):
        for key in ("searchUrl", "suggestUrl"):
            url = engine.get(key)
            if url is not None and not (url.startswith("https://") and "%s" in url):
                fail(f"search engine {engine.get('name')}: {key} must be https and contain %s")
    for bang in config.get("bangs", []):
        if not bang.get("trigger") or not bang.get("url", "").startswith("https://") or "%s" not in bang["url"]:
            fail(f"bang {bang!r}: needs a trigger and an https url with %s")
    return config


def load_site_fixes():
    """Each fix is a folder in site-fixes/ with fix.json and style.css and/or script.js."""
    fixes = []
    for folder in sorted(p for p in (SOURCE / "site-fixes").iterdir() if p.is_dir()):
        meta = json.loads((folder / "fix.json").read_text())
        matches = meta.get("matches")
        if not isinstance(matches, list) or not matches:
            fail(f"site fix {folder.name}: matches must be a non-empty list")
        if "<all_urls>" in matches:
            fail(f"site fix {folder.name}: fixes must name the sites they fix")
        run_at = meta.get("runAt", "document_idle")
        if run_at not in RUN_AT:
            fail(f"site fix {folder.name}: runAt must be one of {sorted(RUN_AT)}")
        check_version_range(f"site fix {folder.name}", meta)
        fix = {"id": folder.name, "matches": matches, "runAt": run_at}
        for key in ("minVersionCode", "maxVersionCode"):
            if key in meta:
                fix[key] = meta[key]
        if (folder / "style.css").exists():
            fix["css"] = (folder / "style.css").read_text()
        if (folder / "script.js").exists():
            fix["js"] = (folder / "script.js").read_text()
        if "css" not in fix and "js" not in fix:
            fail(f"site fix {folder.name}: add style.css or script.js")
        fixes.append(fix)
    return fixes


def check_app_key():
    """The committed public key must be the one compiled into the app."""
    pem = (SOURCE / "public-key.pem").read_text()
    der = "".join(line for line in pem.splitlines() if not line.startswith("-----"))
    match = re.search(r'PUBLIC_KEY = "([^"]+)"', APP_KEY_FILE.read_text())
    if not match or match.group(1) != der:
        fail("android/ota/public-key.pem does not match LiveUpdates.PUBLIC_KEY")


def openssl(*args, data):
    return subprocess.run(["openssl", *args], input=data, capture_output=True, check=True).stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", help="PEM EC private key; omit to only validate")
    parser.add_argument("--out", default="ota.json")
    parser.add_argument("--latest-apk", help="JSON file with versionCode, versionName and url")
    args = parser.parse_args()

    check_app_key()
    payload = {"format": 1, "serial": int(time.time()), **load_config(), "siteFixes": load_site_fixes()}
    if args.latest_apk:
        payload["latestApk"] = json.loads(Path(args.latest_apk).read_text())
    data = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()

    if not args.key:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    signature = openssl("dgst", "-sha256", "-sign", args.key, data=data)
    with tempfile.NamedTemporaryFile() as sig:
        sig.write(signature)
        sig.flush()
        openssl("dgst", "-sha256", "-verify", str(SOURCE / "public-key.pem"), "-signature", sig.name, data=data)

    envelope = json.dumps({
        "payload": base64.b64encode(data).decode(),
        "signature": base64.b64encode(signature).decode(),
    })
    if len(envelope) > MAX_BYTES:
        fail(f"bundle is {len(envelope)} bytes; the app accepts at most {MAX_BYTES}")
    Path(args.out).write_text(envelope)
    print(f"wrote {args.out}: serial {payload['serial']}, {len(payload['siteFixes'])} site fixes, {len(envelope)} bytes")


if __name__ == "__main__":
    main()
