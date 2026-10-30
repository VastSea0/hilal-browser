# Lepton icons

Hilal ships only the icon rules of [Firefox-UI-Fix](https://github.com/black7375/Firefox-UI-Fix)
(Lepton) by @black7375 (MPL 2.0). They add icons to menus, context menus,
panels and the library window. The rest of Lepton (tab shapes, auto-hide,
paddings, themes) is not used.

## File layout

| File | Role |
|------|------|
| `changes/browser/themes/shared/hilal-icons.css` | Lepton's `Icons` section, generated; do not edit by hand |
| `changes/browser/themes/shared/icons/` | The SVGs that section references, as `chrome://browser/skin/icons/` |
| `changes/browser/themes/hilal-theme-integration.patch` | Imports the stylesheet and lists the files in `jar.inc.mn` |
| `third_party/firefox-ui-fix/` | License and upstream pin |

The rules are gated by Lepton's own `userChrome.icon.*` prefs. Hilal sets
upstream's recommended values in `changes/browser/branding/hilal/pref/firefox-branding.js`.

## Syncing upstream

```bash
scripts/sync-lepton-icons.sh [ref]
```

Default `ref` is `master`. The script reads upstream's compiled
`css/leptonChrome.css`, keeps the `Icons` section, rewrites `../icons/` to
`chrome://browser/skin/icons/`, and replaces the SVGs with the ones the section
uses. If the icon list changed, it prints the difference; update the
`jar.inc.mn` hunk in `hilal-theme-integration.patch` to match.
