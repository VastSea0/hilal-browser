# Localization Release Checklist

Use this checklist before publishing a release with more built-in locales.

## Before Building

1. Decide the supported locale set for the release:

   ```bash
   export HILAL_LOCALES="tr,de,fr"
   ```

2. Fetch official Firefox locale files and merge Hilal custom strings:

   ```bash
   scripts/setup-locales.sh
   ```

3. Check Hilal custom translation coverage:

   ```bash
   python3 scripts/check-locales.py --reference tr
   ```

4. Add the locales to `HILAL_LOCALES` for the CI build (`scripts/ci/build.sh`
   defaults to `tr`). CI packages them with `mach package-multi-locale`.

5. Review the repo diff. Locale changes should normally include:

   ```text
   changes/browser/locales/<locale>/
   ```

## Smoke Checks

1. Build the browser package for the target platform.
2. Launch a clean profile.
3. Open Settings > Hilal Preferences > Language Selection.
4. Confirm bundled locales appear in the dropdown.
5. Select each release locale once and restart when prompted.
6. Confirm Hilal-specific screens do not show raw Fluent IDs.

## Packaging Notes

- Linux release artifacts should include the tar.gz package and AppImage.
- Windows release artifacts should include the installer and zip package.
- `scripts/setup-locales.sh` fetches the firefox-l10n revision pinned in
  `engine/browser/locales/l10n-changesets.json`, so translations match the
  Firefox version.
