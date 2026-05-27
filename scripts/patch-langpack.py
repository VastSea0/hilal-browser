#!/usr/bin/env python3
import json
import os
import re
import sys
import tempfile
import zipfile
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


def get_langpack_locale(xpi_path):
    fallback = xpi_path.name.removeprefix("langpack-").removesuffix(
        "@firefox.mozilla.org.xpi"
    )
    try:
        with zipfile.ZipFile(xpi_path, "r") as zip_ref:
            manifest = json.loads(zip_ref.read("manifest.json"))
    except (KeyError, json.JSONDecodeError, zipfile.BadZipFile):
        return fallback

    return (
        manifest.get("langpack_id")
        or next(iter(manifest.get("languages", {}) or {}), None)
        or fallback
    )


def repack_zip(source_dir, xpi_path):
    real_xpi_path = Path(os.path.realpath(xpi_path))
    with zipfile.ZipFile(real_xpi_path, "w", zipfile.ZIP_DEFLATED) as zip_ref:
        files = sorted(path for path in source_dir.rglob("*") if path.is_file())
        for file_path in files:
            rel_path = file_path.relative_to(source_dir).as_posix()
            info = zipfile.ZipInfo(rel_path, date_time=(1980, 1, 1, 0, 0, 0))
            info.external_attr = 0o644 << 16
            zip_ref.writestr(info, file_path.read_bytes(), zipfile.ZIP_DEFLATED)


def patch_branding(temp_dir, locale, repo_root):
    changed = False
    branding_dir = repo_root / "branding/hilal/locales/en-US"
    brand_targets = {
        branding_dir / "brand.ftl": temp_dir
        / f"browser/localization/{locale}/branding/brand.ftl",
        branding_dir / "brand.properties": temp_dir
        / f"browser/chrome/{locale}/locale/branding/brand.properties",
    }

    for src_file, dst_file in brand_targets.items():
        if not src_file.exists():
            continue
        if write_text_if_changed(dst_file, read_text(src_file).rstrip() + "\n"):
            rel_dst = dst_file.relative_to(temp_dir)
            print(f"  Branding: {src_file.name} -> {rel_dst}")
            changed = True

    return changed


def patch_custom_browser_ftl(temp_dir, locale, repo_root):
    src_dir = repo_root / "prefs/browser/locales" / locale / "browser"
    if not src_dir.exists():
        print(f"  No Hilal browser locale overlay for {locale}: {src_dir}")
        return False

    changed = False
    for src_file in sorted(src_dir.rglob("*.ftl")):
        rel_path = src_file.relative_to(src_dir)
        dst_file = (
            temp_dir / "browser/localization" / locale / "browser" / rel_path
        )
        existing_content = read_text(dst_file) if dst_file.exists() else ""
        patched_content = append_hilal_content(
            existing_content, read_text(src_file)
        )
        if write_text_if_changed(dst_file, patched_content):
            print(f"  Fluent: {rel_path} -> {dst_file.relative_to(temp_dir)}")
            changed = True

    return changed


def patch_langpack_xpi(repo_root, xpi_path):
    locale = get_langpack_locale(xpi_path)
    print(f"[hilal] Patching {locale} langpack: {xpi_path}")

    with tempfile.TemporaryDirectory() as temp_root:
        temp_dir = Path(temp_root)
        with zipfile.ZipFile(xpi_path, "r") as zip_ref:
            zip_ref.extractall(temp_dir)

        changed = False
        changed |= patch_branding(temp_dir, locale, repo_root)
        changed |= patch_custom_browser_ftl(temp_dir, locale, repo_root)

        if changed:
            repack_zip(temp_dir, xpi_path)
            print(f"[hilal] Repacked {locale} langpack.")
        else:
            print(f"[hilal] No {locale} langpack changes needed.")

    return True


def patch_langpacks(repo_root, firefox_src):
    ext_dir = firefox_src / "browser/app/distribution/extensions"
    langpacks = sorted(ext_dir.glob("langpack-*@firefox.mozilla.org.xpi"))
    if not langpacks:
        print(f"[hilal] No bundled langpacks found in {ext_dir}")
        return False

    for xpi_path in langpacks:
        patch_langpack_xpi(repo_root, xpi_path)

    return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: patch-langpack.py <repo_root> <firefox_src>")
        sys.exit(1)

    patch_langpacks(Path(sys.argv[1]), Path(sys.argv[2]))
