# Firefox-UI-Fix integration

Most Hilal chrome styling comes from [Firefox-UI-Fix](https://github.com/black7375/Firefox-UI-Fix)
by @black7375 (MPL 2.0). Hilal does not use profile `userChrome.css`; the bundle is
built into the browser.

## File layout

| File | Role |
|------|------|
| `changes/browser/themes/shared/hilal-ui-fix.css` | Entry: top-level `@import`s (must not be nested in `@media`) |
| `changes/browser/themes/shared/firefox-ui-fix.css` | Vendored Lepton CSS, wrapped in `@media -moz-pref("hilal.uifix.enabled")` |
| `changes/browser/themes/shared/hilal-ui-overrides.css` | Hilal-only overrides, same pref gate |
| `changes/browser/themes/shared/icons/` | Icons referenced as `chrome://browser/skin/icons/` |
| `third_party/firefox-ui-fix/` | License, upstream pin metadata |

Preferences and toggles are wired in `changes/browser/ui-fix.patch` and
`changes/browser/components/preferences/hilal.inc.xhtml`.

## Syncing upstream

```bash
scripts/sync-firefox-ui-fix.sh [ref]
```

Default `ref` is `master`. The script builds `css/leptonChrome.css`, rewrites
`../icons/` paths for packaged chrome, and updates `firefox-ui-fix.css`. Review
diffs carefully; upstream may change selectors that break Hilal features.

## Manual edits

- Upstream-derived changes: prefer `scripts/sync-firefox-ui-fix.sh`, then small
  follow-up commits if needed.
- Hilal-only styling: edit `hilal-ui-overrides.css` only.
