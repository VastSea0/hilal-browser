#!/usr/bin/env python3
# scripts/check-locales.py
# Checks that custom Hilal locale overlays have the same files and Fluent IDs.

import argparse
import re
import sys
from pathlib import Path

FTL_MESSAGE_RE = re.compile(r"^\s*(-?[A-Za-z][A-Za-z0-9_-]*)\s*=", re.MULTILINE)


def repo_root():
    return Path(__file__).resolve().parents[1]


def locale_root():
    return repo_root() / "changes/browser/locales"


def discover_locales():
    root = locale_root()
    if not root.exists():
        return []
    return sorted(
        path.name for path in root.iterdir() if path.is_dir() and path.name != "en-US"
    )


def custom_files(locale):
    root = locale_root() / locale
    if not root.exists():
        return []
    return sorted(path for path in root.rglob("*") if path.is_file())


def ftl_ids(path):
    return set(FTL_MESSAGE_RE.findall(path.read_text(encoding="utf-8")))


def check_locale(reference, locale):
    reference_dir = locale_root() / reference
    locale_dir = locale_root() / locale
    issues = []

    for reference_file in custom_files(reference):
        rel_path = reference_file.relative_to(reference_dir)
        candidate = locale_dir / rel_path

        if not candidate.exists():
            issues.append(f"{locale}: missing file {rel_path}")
            continue

        if reference_file.suffix != ".ftl":
            continue

        missing_ids = sorted(ftl_ids(reference_file) - ftl_ids(candidate))
        for message_id in missing_ids:
            issues.append(f"{locale}: missing Fluent message {message_id} in {rel_path}")

    return issues


def main(argv):
    parser = argparse.ArgumentParser(
        description="Check Hilal custom locale overlays against a reference locale."
    )
    parser.add_argument(
        "--reference",
        default="tr",
        help="Reference locale to compare against. Defaults to tr.",
    )
    parser.add_argument(
        "locales",
        nargs="*",
        help="Locale folders to check. Defaults to all locale folders except the reference.",
    )
    args = parser.parse_args(argv)

    available = discover_locales()
    if args.reference not in available:
        print(f"[hilal] Reference locale not found: {args.reference}", file=sys.stderr)
        print(f"[hilal] Available locale overlays: {', '.join(available) or '(none)'}")
        return 1

    targets = args.locales or [locale for locale in available if locale != args.reference]
    targets = [locale for locale in targets if locale != args.reference]

    reference_count = len(custom_files(args.reference))
    if not targets:
        print(
            f"[hilal] Reference locale {args.reference} has {reference_count} custom file(s)."
        )
        print("[hilal] No additional custom locale folders found yet.")
        return 0

    missing_targets = [locale for locale in targets if locale not in available]
    if missing_targets:
        print(
            f"[hilal] Missing locale overlay folder(s): {', '.join(missing_targets)}",
            file=sys.stderr,
        )
        return 1

    all_issues = []
    for locale in targets:
        all_issues.extend(check_locale(args.reference, locale))

    if all_issues:
        print("[hilal] Locale coverage check failed:", file=sys.stderr)
        for issue in all_issues:
            print(f"  - {issue}", file=sys.stderr)
        return 1

    print(f"[hilal] Locale coverage check passed for: {', '.join(targets)}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
