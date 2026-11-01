# Boosts

Boosts restyle one site: colors, fonts, text size and case, hidden elements
(Zap), Focus, and custom CSS. They are adapted from Zen Browser's Boosts
(`src/zen/boosts` in https://github.com/zen-browser/desktop), which are under
the MPL 2.0 like Hilal. Ported files keep their MPL headers and say where they
came from.

## Where the code lives

| Part | Path in `changes/` |
|------|--------------------|
| Color backend in layout, style, gfx and widget code | `hilal-boosts-engine.patch` |
| Manager, editor, dialogs, actors, C++ backend sources | `browser/components/hilal/boosts/` |
| Build and actor registration | `browser/components/hilal-boosts-registration.patch` |
| Address bar button, menu and toasts | `browser/base/content/hilal/HilalShell.js`, `HilalShell.css` |
| Strings | `browser/locales/en-US/browser/hilal-boosts.ftl`, `browser/locales/tr/browser/hilal-boosts.ftl` |
| Preferences (`hilal.boosts.*`) | `browser/branding/hilal/pref/firefox-branding.js` |
| Share server | `www/api/boosts.ts`, `www/src/components/BoostSharePage.tsx` |

The engine patch is the only part that needs a full build. Everything under
`browser/` rebuilds with `./mach build faster`.

The color backend works at paint time: the content actor stores the Boost's
packed accent color in synced `BrowsingContext` fields (`hilalBoostsData`,
`hilalBoostsComplementaryRotation`, `isHilalBoostsInverted`), and the patched
paint paths recolor page colors without touching images.

## Differences from Zen

- The editor is Hilal's own Material 3 Expressive design, not Zen's layout: a
  color wheel instead of Zen's square picker, a connected button group for
  invert, theme and adjust, inline sliders, font chips, a size stepper, a case
  segmented button and connected tiles for Zap, Focus and Custom CSS.
- The editor, Zap bar and dialogs take their colors and font from the shell's
  Material tokens (`gHilalBoostsManager.applyShellTheme()`), so they follow the
  workspace color and dark mode.
- Boosts open from the bolt button in the address bar. With saved Boosts it
  shows a menu to switch them on and off, edit them or make a new one.
- Night-only Boosts (a Hilal addition) apply only while Hilal is in dark mode.
  Set it from the Boost name menu in the editor.

## Sharing

Sharing uploads the Boost to `https://hilal-browser.vercel.app/api/boosts` and
returns a `/boost/<id>` link. Opening such a link in Hilal offers to add the
Boost; other browsers show a page that explains it. The base URL can be changed
with the `hilal.share.base-url` pref.

The server keeps shared Boosts in Vercel Blob. Until the project has a Blob
store, the endpoint answers 503 and Hilal shows a share error. To turn it on:

1. In the Vercel dashboard, open the project's Storage tab and create a Blob
   store connected to the project.
2. Check that `BLOB_READ_WRITE_TOKEN` now appears in the project's environment
   variables, then redeploy.
