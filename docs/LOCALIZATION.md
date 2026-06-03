# Localization Workflow

Hilal follows the operating system language when a matching bundled locale is
installed. If no installed locale matches the system language, Firefox's locale
negotiation falls back to the packaged `en-US` locale.

The default is controlled by:

```js
pref("intl.locale.requested", "");
```

## Adding a New Language

1. Add the signed Firefox language pack to:

   ```text
   changes/browser/app/distribution/extensions/langpack-<locale>@firefox.mozilla.org.xpi
   ```

2. Add Hilal-specific Fluent translations under:

   ```text
   changes/browser/locales/<locale>/browser/
   ```

   This directory mirrors the language pack path after
   `browser/localization/<locale>/browser/`. For example:

   ```text
   changes/browser/locales/tr/browser/browser.ftl
   changes/browser/locales/tr/browser/sidebar.ftl
   changes/browser/locales/tr/browser/preferences/preferences.ftl
   ```

3. Run:

   ```bash
    ./bin/hil apply
    ```

    The apply step copies the overlay files into the Firefox tree and then merges
    the custom translation overrides directly using `hil`'s built-in locale merging.
    The merging logic patches the Fluent `.ftl` files to append Hilal-specific
    translations.

4. Build or package normally.

## Notes

- Brand strings are not translated. Each bundled langpack receives the Hilal
  brand values from changes under `changes/browser/branding/hilal/`.
- Keep Hilal-specific strings in matching files across locales where practical.
  Missing translations can fall back to English, but complete locale overlays
  avoid noisy Fluent missing-message logs.
- `browser/app/distribution/moz.build` includes bundled langpacks with a
  wildcard, so new language packs do not need a moz.build edit.

## User Language Selection Settings

The interface language can be set explicitly by the user in **Settings → Hilal Preferences → Language Selection**:
1. Choosing **System Language (Default)** sets `intl.locale.requested` to `""`, falling back to the OS system language negotiation.
2. Selecting a specific language sets `intl.locale.requested` to that locale code (e.g., `"tr"`).
3. The available options in the dropdown are fetched dynamically from the bundled language packs, with a static fallback to `["en-US", "tr"]` if dynamic detection fails.
4. When a new language is applied, the user is prompted to restart the browser to apply the settings.

