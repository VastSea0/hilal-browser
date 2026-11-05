# Translator Guide

This guide is for translating Hilal-specific browser strings. Firefox's normal
browser strings come from Mozilla's official localization repository; this repo
only carries the extra Hilal UI strings.

## Files To Translate

Custom strings live under:

```text
changes/browser/locales/<locale>/browser/
```

The current reference locale is Turkish:

```text
changes/browser/locales/tr/browser/browser.ftl
changes/browser/locales/tr/browser/sidebar.ftl
changes/browser/locales/tr/browser/preferences/preferences.ftl
```

For a new locale, copy the reference folder and translate the values:

```bash
cp -R changes/browser/locales/tr changes/browser/locales/de
```

## Fluent Rules

Hilal uses Mozilla Fluent `.ftl` files. Translate the text after `=`, but keep
message IDs and syntax stable.

Keep this:

```ftl
hilal-language-selection-title = Dil Secimi
```

As this shape in another locale:

```ftl
hilal-language-selection-title = Language Selection
```

Do not rename `hilal-language-selection-title`. Firefox looks up strings by
that ID.

Also keep:

- Variables such as `{ $name }`, `{ $count }`, and `{ -brand-short-name }`.
- Attribute names such as `.label`, `.accesskey`, `.aria-label`, and `.title`.
- Fluent selectors, brackets, and indentation.
- The product name `Hilal`, unless there is an explicit branding decision to
  localize it.
- URLs, preference keys, extension IDs, and file names.

## Checking Your Work

Run the locale checker before handing off a translation:

```bash
python3 scripts/check-locales.py --reference tr de
```

The checker reports missing custom files and missing Fluent message IDs. Extra
translated strings are allowed, but missing IDs should be fixed before release.

## Testing In The Browser

After strings are added:

```bash
scripts/setup-locales.sh de
(cd engine && ./mach build && ./mach package-multi-locale --locales en-US de)
```

Then run the packaged browser, open Settings > Hilal Preferences > Language
Selection, choose the locale, and restart when prompted.
