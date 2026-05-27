#!/usr/bin/env python3
import os
import sys
import zipfile
import shutil
import tempfile

def patch_langpack(repo_root, firefox_src):
    xpi_path = os.path.join(firefox_src, "browser/app/distribution/extensions/langpack-tr@firefox.mozilla.org.xpi")
    if not os.path.exists(xpi_path):
        print(f"[hilal] Error: Turkish langpack not found at {xpi_path}")
        return False
        
    # Source plain text FTL files in our repo
    src_locales_dir = os.path.join(repo_root, "prefs/browser/locales/tr/browser")
    if not os.path.exists(src_locales_dir):
        print(f"[hilal] Warning: Plain text Turkish FTL source directory not found: {src_locales_dir}")
        return False

    temp_dir = tempfile.mkdtemp()
    try:
        # Extract the entire XPI
        print(f"[hilal] Patching Turkish langpack in Firefox tree...")
        with zipfile.ZipFile(xpi_path, 'r') as zip_ref:
            zip_ref.extractall(temp_dir)
            
        # Target files inside the extracted langpack
        targets = {
            "browser.ftl": "browser/localization/tr/browser/browser.ftl",
            "preferences/preferences.ftl": "browser/localization/tr/browser/preferences/preferences.ftl",
            "sidebar.ftl": "browser/localization/tr/browser/sidebar.ftl"
        }
        
        patched_any = False
        for rel_src, rel_dst in targets.items():
            src_file = os.path.join(src_locales_dir, rel_src)
            dst_file = os.path.join(temp_dir, rel_dst)
            
            if os.path.exists(src_file) and os.path.exists(dst_file):
                print(f"  Appending custom strings from {rel_src} -> {rel_dst}")
                # Read original and new strings
                with open(src_file, 'r', encoding='utf-8') as sf:
                    custom_content = sf.read()
                    
                with open(dst_file, 'r', encoding='utf-8') as df:
                    existing_content = df.read()
                    
                # To prevent double appending, check if one of our unique keys is already present
                unique_key = "hilal-"
                if unique_key in existing_content:
                    # Clean/restore original file first if it was already patched
                    # Since we are running on a fresh extraction of the XPI from the source
                    # (which might be a symlink to a previously patched XPI), let's strip
                    # everything starting from the first custom banner.
                    banner = "## Hilal Welcome Screen"
                    if banner in existing_content:
                        existing_content = existing_content.split(banner)[0]
                    banner_prefs = "## Hilal Browser Settings"
                    if banner_prefs in existing_content:
                        existing_content = existing_content.split(banner_prefs)[0]
                    banner_sidebar = "# Hilal Redesigned Sidebar"
                    if banner_sidebar in existing_content:
                        existing_content = existing_content.split(banner_sidebar)[0]

                # Append custom content to clean/original content
                with open(dst_file, 'w', encoding='utf-8') as df:
                    df.write(existing_content.strip() + "\n\n" + custom_content.strip() + "\n")
                patched_any = True
                
        if patched_any:
            # Handle if the XPI path is a symlink (we want to write to the actual file)
            real_xpi_path = os.path.realpath(xpi_path)
            
            # Repack the zip
            with zipfile.ZipFile(real_xpi_path, 'w', zipfile.ZIP_DEFLATED) as zip_ref:
                for root, _, files in os.walk(temp_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, temp_dir)
                        zip_ref.write(file_path, rel_path)
            print("[hilal] Patched Turkish langpack repacked successfully.")
            return True
            
    finally:
        shutil.rmtree(temp_dir)
        
    return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: patch-langpack.py <repo_root> <firefox_src>")
        sys.exit(1)
    patch_langpack(sys.argv[1], sys.argv[2])
