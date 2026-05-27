#!/usr/bin/env python3
# scripts/merge-locales.py
# Safely merges Hilal's custom translations into the official Firefox localization files.

import os
import re
import sys
from pathlib import Path

HILAL_BLOCK_BEGIN = "# --- Hilal custom localization begin ---"
HILAL_BLOCK_END = "# --- Hilal custom localization end ---"
LEGACY_HILAL_MARKERS = (
    "## Hilal Welcome Screen",
    "## Hilal Browser Settings",
    "# Hilal Redesigned Sidebar",
)


def read_text(path):
    return path.read_text(encoding="utf-8")


def write_text_if_changed(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and read_text(path) == content:
        return False
    path.write_text(content, encoding="utf-8")
    return True


def strip_hilal_block(content):
    pattern = re.compile(
        rf"\n*{re.escape(HILAL_BLOCK_BEGIN)}.*?{re.escape(HILAL_BLOCK_END)}\n*",
        re.S,
    )
    content = pattern.sub("\n", content)

    for marker in LEGACY_HILAL_MARKERS:
        index = content.find(marker)
        if index != -1:
            content = content[:index]
            break

    return content.rstrip()


def append_hilal_content(existing_content, custom_content):
    existing_content = strip_hilal_block(existing_content)
    custom_content = custom_content.strip()
    return (
        f"{existing_content}\n\n"
        f"{HILAL_BLOCK_BEGIN}\n"
        f"{custom_content}\n"
        f"{HILAL_BLOCK_END}\n"
    )


def merge_locales(repo_root, firefox_src):
    custom_dir = repo_root / "prefs/browser/locales/tr"
    target_dir = firefox_src / "browser/locales/tr"

    if not custom_dir.exists():
        print("[hilal] No custom locales folder found in prefs/browser/locales/tr")
        return False

    if not target_dir.exists():
        print("[hilal] Target locales directory does not exist yet: firefox/browser/locales/tr")
        print("[hilal] Run scripts/setup-locales.sh first to initialize the locale files.")
        return False

    print(f"[hilal] Merging custom translations into {target_dir}")

    changed = False
    for custom_file in sorted(custom_dir.rglob("*")):
        if not custom_file.is_file():
            continue

        rel_path = custom_file.relative_to(custom_dir)
        # Map Hilal's overlay structure to the expected Firefox l10n nested structure (browser -> browser/browser)
        parts = list(rel_path.parts)
        if parts and parts[0] == "browser":
            parts.insert(1, "browser")
        target_file = target_dir / Path(*parts)

        if custom_file.suffix == ".ftl":
            existing = read_text(target_file) if target_file.exists() else ""
            custom_content = read_text(custom_file)
            patched = append_hilal_content(existing, custom_content)

            if write_text_if_changed(target_file, patched):
                print(f"  Merged Fluent: {rel_path}")
                changed = True
        else:
            # For non-fluent files, copy directly or append
            custom_content = read_text(custom_file)
            if write_text_if_changed(target_file, custom_content):
                print(f"  Copied Asset: {rel_path}")
                changed = True

    if changed:
        print("[hilal] Locale merge complete.")
    else:
        print("[hilal] All locale files are already up-to-date.")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: merge-locales.py <repo_root> <firefox_src>")
        sys.exit(1)

    merge_locales(Path(sys.argv[1]), Path(sys.argv[2]))
