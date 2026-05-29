#!/usr/bin/env python3
"""
Patch the bundled uBlock Origin XPI with a small Firefox-compatibility guard.

This keeps uBlock from throwing when a content-script registration promise
resolves to an empty/undefined handle in our build/profile combination.
"""

from __future__ import annotations

import shutil
import sys
import tempfile
import zipfile
from pathlib import Path


SCRIPT_PATH = "js/scriptlet-filtering.js"


def patch_scriptlet_filtering(source: str) -> str:
    old = """    register(hostname, code) {
        if ( browser.contentScripts === undefined ) { return false; }
        if ( hostname === '' ) { return false; }
        const details = this.hostnameToDetails.get(hostname);
        if ( details !== undefined ) {
            if ( code === details.code ) {
                return details.handle instanceof Promise === false;
            }
            details.handle.unregister();
            this.hostnameToDetails.delete(hostname);
        }
        const promise = browser.contentScripts.register({
            js: [ { code } ],
            allFrames: true,
            matches: [ `*://*.${hostname}/*` ],
            matchAboutBlank: true,
            runAt: 'document_start',
        }).then(handle => {
            this.hostnameToDetails.set(hostname, { handle, code });
        }).catch(( ) => {
            this.hostnameToDetails.delete(hostname);
        });
        this.hostnameToDetails.set(hostname, { handle: promise, code });
        return false;
    }
"""
    new = """    register(hostname, code) {
        if ( browser.contentScripts === undefined ) { return false; }
        if ( hostname === '' ) { return false; }
        const details = this.hostnameToDetails.get(hostname);
        if ( details !== undefined ) {
            if ( code === details.code ) {
                return details.handle instanceof Promise === false;
            }
            if ( details.handle instanceof Promise ) {
                details.handle.then(handle => {
                    handle?.unregister?.();
                }).catch(() => {});
            } else {
                details.handle?.unregister?.();
            }
            this.hostnameToDetails.delete(hostname);
        }
        const promise = browser.contentScripts.register({
            js: [ { code } ],
            allFrames: true,
            matches: [ `*://*.${hostname}/*` ],
            matchAboutBlank: true,
            runAt: 'document_start',
        }).then(handle => {
            if ( handle?.unregister ) {
                this.hostnameToDetails.set(hostname, { handle, code });
            } else {
                this.hostnameToDetails.delete(hostname);
            }
        }).catch(( ) => {
            this.hostnameToDetails.delete(hostname);
        });
        this.hostnameToDetails.set(hostname, { handle: promise, code });
        return false;
    }
"""
    if old not in source:
        return source
    return source.replace(old, new)


def patch_xpi(xpi_path: Path) -> bool:
    if not xpi_path.exists():
        raise SystemExit(f"uBlock XPI does not exist: {xpi_path}")

    with zipfile.ZipFile(xpi_path, "r") as zin:
        entries = {info.filename: zin.read(info.filename) for info in zin.infolist()}
        if SCRIPT_PATH not in entries:
            raise SystemExit(f"Missing {SCRIPT_PATH} in {xpi_path}")

    original = entries[SCRIPT_PATH].decode("utf-8", "replace")
    patched = patch_scriptlet_filtering(original)
    if patched == original:
        print(f"[hilal] uBlock already patched: {xpi_path}")
        return False

    entries[SCRIPT_PATH] = patched.encode("utf-8")

    with tempfile.NamedTemporaryFile(suffix=".xpi", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        with zipfile.ZipFile(xpi_path, "r") as zin, zipfile.ZipFile(
            tmp_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as zout:
            for info in zin.infolist():
                data = entries.get(info.filename, zin.read(info.filename))
                zout.writestr(info, data)
        shutil.move(tmp_path, xpi_path)
        print(f"[hilal] Patched uBlock XPI: {xpi_path}")
        return True
    finally:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: patch-ublock.py <uBlock_xpi>")
        return 1
    patch_xpi(Path(sys.argv[1]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
