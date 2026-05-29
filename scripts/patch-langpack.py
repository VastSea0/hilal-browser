#!/usr/bin/env python3
# scripts/patch-langpack.py
#
# Merge Hilal's custom Turkish Fluent overlays into the bundled langpack XPI.

from __future__ import annotations

import re
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

HILAL_BLOCK_BEGIN = "# --- Hilal custom localization begin ---"
HILAL_BLOCK_END = "# --- Hilal custom localization end ---"


def strip_hilal_block(content: str) -> str:
    pattern = re.compile(
        rf"\n*{re.escape(HILAL_BLOCK_BEGIN)}.*?{re.escape(HILAL_BLOCK_END)}\n*",
        re.S,
    )
    return pattern.sub("\n", content).rstrip()


def merge_content(existing: str, custom: str) -> str:
    existing = strip_hilal_block(existing)
    custom = custom.strip()
    return (
        f"{existing}\n\n"
        f"{HILAL_BLOCK_BEGIN}\n"
        f"{custom}\n"
        f"{HILAL_BLOCK_END}\n"
    )


def main() -> int:
    if len(sys.argv) != 4:
        print("Usage: patch-langpack.py <repo_root> <firefox_src> <langpack_xpi>")
        return 1

    repo_root = Path(sys.argv[1])
    firefox_src = Path(sys.argv[2])
    xpi_path = Path(sys.argv[3])

    overlay_root = repo_root / "prefs/browser/locales/tr"
    if not overlay_root.exists():
        print("[hilal] No Turkish locale overlays found; skipping langpack patch.")
        return 0

    if not xpi_path.exists():
        raise SystemExit(f"Langpack XPI does not exist: {xpi_path}")

    entries: dict[str, bytes] = {}
    with zipfile.ZipFile(xpi_path, "r") as zin:
        for info in zin.infolist():
            entries[info.filename] = zin.read(info.filename)

    changed = False
    for custom_file in sorted(overlay_root.rglob("*.ftl")):
        rel = custom_file.relative_to(overlay_root).as_posix()
        target = f"browser/localization/tr/{rel}"
        custom_content = custom_file.read_text(encoding="utf-8")
        existing_content = entries.get(target, b"").decode("utf-8", "replace")
        patched = merge_content(existing_content, custom_content)
        if patched.encode("utf-8") != entries.get(target, b""):
            entries[target] = patched.encode("utf-8")
            changed = True

    if not changed:
        print("[hilal] Langpack already contains the custom overlays.")
        return 0

    with tempfile.NamedTemporaryFile(suffix=".xpi", delete=False) as tmp:
        tmp_path = Path(tmp.name)

    try:
        with zipfile.ZipFile(xpi_path, "r") as zin, zipfile.ZipFile(
            tmp_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as zout:
            for info in zin.infolist():
                data = entries.get(info.filename, zin.read(info.filename))
                zout.writestr(info, data)

            for custom_file in sorted(overlay_root.rglob("*.ftl")):
                rel = custom_file.relative_to(overlay_root).as_posix()
                target = f"browser/localization/tr/{rel}"
                if target not in {info.filename for info in zin.infolist()}:
                    info = zipfile.ZipInfo(target)
                    info.compress_type = zipfile.ZIP_DEFLATED
                    zout.writestr(info, entries[target])

        shutil.move(tmp_path, xpi_path)
        print(f"[hilal] Patched langpack: {xpi_path}")
        return 0
    finally:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
