#!/usr/bin/env python3
# scripts/merge-locales.py
# Safely merges Hilal custom translations into official Firefox localization files.

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


def write_bytes_if_changed(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists() and path.read_bytes() == content:
        return False
    path.write_bytes(content)
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


def discover_locales(repo_root):
    locale_root = repo_root / "changes/browser/locales"
    if not locale_root.exists():
        return []
    return sorted(
        path.name
        for path in locale_root.iterdir()
        if path.is_dir() and path.name != "en-US"
    )


def validate_locale(locale):
    if (
        not locale
        or "/" in locale
        or "\\" in locale
        or locale.startswith(".")
        or ".." in locale
    ):
        raise ValueError(f"Invalid locale code: {locale}")


def map_overlay_path(rel_path):
    parts = list(rel_path.parts)
    if parts and parts[0] == "browser":
        parts.insert(1, "browser")
    return Path(*parts)


def merge_locale(repo_root, firefox_src, locale):
    custom_dir = repo_root / "changes/browser/locales" / locale
    target_dir = firefox_src / "browser/locales" / locale

    if not custom_dir.exists():
        print(f"[hilal] No custom locale overlays found for {locale}; skipping.")
        return True

    if not target_dir.exists():
        print(f"[hilal] Target locales directory does not exist yet: {target_dir}")
        print(
            f"[hilal] Run scripts/setup-locales.sh {locale} first to initialize locale files."
        )
        return False

    print(f"[hilal] Merging custom {locale} translations into {target_dir}")

    changed = False
    for custom_file in sorted(custom_dir.rglob("*")):
        if not custom_file.is_file():
            continue

        rel_path = custom_file.relative_to(custom_dir)
        target_file = target_dir / map_overlay_path(rel_path)

        if custom_file.suffix == ".ftl":
            existing = read_text(target_file) if target_file.exists() else ""
            custom_content = read_text(custom_file)
            patched = append_hilal_content(existing, custom_content)

            if write_text_if_changed(target_file, patched):
                print(f"  Merged Fluent: {rel_path}")
                changed = True
        else:
            custom_content = custom_file.read_bytes()
            if write_bytes_if_changed(target_file, custom_content):
                print(f"  Copied Asset: {rel_path}")
                changed = True

    if changed:
        print(f"[hilal] Locale merge complete for {locale}.")
    else:
        print(f"[hilal] All {locale} locale files are already up-to-date.")
    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: merge-locales.py <repo_root> <firefox_src> [locale ...]")
        sys.exit(1)

    repo_root = Path(sys.argv[1])
    firefox_src = Path(sys.argv[2])
    locales = sys.argv[3:] or discover_locales(repo_root) or ["tr"]

    ok = True
    for locale in sorted(set(locales)):
        try:
            validate_locale(locale)
        except ValueError as exc:
            print(f"[hilal] {exc}", file=sys.stderr)
            ok = False
            continue

        if not merge_locale(repo_root, firefox_src, locale):
            ok = False

    sys.exit(0 if ok else 1)
