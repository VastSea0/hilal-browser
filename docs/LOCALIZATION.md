# Localization Workflow

Hilal builds its translations into the browser (a multi-locale build), using
Firefox's official translations plus Hilal-specific UI strings. They are not
shipped as language pack add-ons, because release builds only load signed
langpacks. The browser follows the operating system language when a matching
built-in locale exists. Without a matching bundled locale, Firefox falls back to `en-US`.

The default is controlled by:

```js
pref("intl.locale.requested", "");
```

Users can choose a language in Settings > Hilal Preferences > Language
Selection. Firefox applies the selection through its multilingual restart flow.

## Quick Start

Set up one or more locales:

```bash
scripts/setup-locales.sh tr de fr
```

Or use an environment variable when repeating the same set:

```bash
HILAL_LOCALES="tr,de,fr" scripts/setup-locales.sh
```

The setup script fetches official Firefox translations from
`mozilla-l10n/firefox-l10n`, copies them into `engine/browser/locales/<locale>/`,
and merges any Hilal custom strings from `changes/browser/locales/<locale>/`.

## Adding A Language

1. Initialize the official locale files:

   ```bash
   scripts/setup-locales.sh de
   ```

2. Add Hilal-specific strings under:

   ```text
   changes/browser/locales/de/browser/
   ```

   For a new translation, copy the current reference locale and translate only
   the values:

   ```bash
   cp -R changes/browser/locales/tr changes/browser/locales/de
   ```

3. Check that the new locale has the same custom Fluent IDs as the reference:

   ```bash
   python3 scripts/check-locales.py --reference tr de
   ```

4. Merge the custom strings into the Firefox source tree:

   ```bash
   python3 scripts/merge-locales.py . engine de
   ```

   `scripts/setup-locales.sh de` also performs this merge after fetching the
   official locale files.

5. Add the locale to the build. CI builds the locales in `HILAL_LOCALES`
   (default `tr`, see `scripts/ci/build.sh`). Locally, after `./mach build`:

   ```bash
   (cd engine && ./mach package-multi-locale --locales en-US tr de)
   ```

## Useful Commands

Run all known custom locale folders:

```bash
scripts/setup-locales.sh
python3 scripts/check-locales.py
```

Run a specific set:

```bash
HILAL_LOCALES="tr,de,fr" scripts/setup-locales.sh
```

If `./bin/hil apply --force` warns that a target locale directory does not
exist, run `scripts/setup-locales.sh <locale>` first. The Firefox l10n files are
large and are intentionally not stored directly in this overlay repo.

## Notes

- The app name stays Hilal. Product branding lives under
  `changes/browser/branding/hilal/locales/en-US/`.
- Hilal custom strings should use matching files and message IDs across locales.
- Missing Hilal custom translations may fall back to English or produce Fluent
  missing-message logs, so run `scripts/check-locales.py` before release.
- `browser/app/distribution/moz.build` includes bundled language packs with a
  wildcard; new langpack XPI files do not need a manual `moz.build` edit.
