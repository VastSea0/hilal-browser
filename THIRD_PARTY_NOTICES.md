# Third-party open source

Hilal Browser is built from open source projects. This file lists each one,
what Hilal uses it for, how it is included, and its license. Hilal's own
patches, scripts and other source files are under the
[Mozilla Public License 2.0](LICENSE).

Inside the desktop browser, `about:license` lists the licenses of Firefox's
components and, under "Hilal Browser Components", the components Hilal adds.

## Desktop browser

| Project | What Hilal uses it for | How it is included | License |
|---------|------------------------|--------------------|---------|
| [Mozilla Firefox ESR](https://www.mozilla.org/firefox/enterprise/) | The whole browser engine and base UI | Built from source at the commit pinned in `upstream.lock`, with Hilal's patches and overlays from `changes/` applied on top | [MPL 2.0](https://www.mozilla.org/MPL/2.0/), plus the licenses Firefox lists in `about:license` |
| [Zen Browser](https://github.com/zen-browser/desktop) | Boosts: per-site colors, fonts, Zap, Focus, custom CSS and sharing, including the C++ color backend | Adapted source in `changes/browser/components/hilal/boosts/` and `changes/hilal-boosts-engine.patch`; files keep their MPL headers and say where they came from. The editor UI is Hilal's own design | MPL 2.0 |
| [Firefox-UI-Fix (Lepton)](https://github.com/black7375/Firefox-UI-Fix) by black7375 | Icons in menus, context menus, panels and the Library window | The `Icons` section and its SVGs, copied by `scripts/sync-lepton-icons.sh` into `changes/browser/themes/shared/`; pin and license in `third_party/firefox-ui-fix/` | MPL 2.0 |
| [Beer CSS](https://github.com/beercss/beercss) 5.0.3 | Material Design components of the browser shell (address bar, menus, tabs, dialogs) | Vendored as `beer.min.css`, `beer.min.js` and the scoped `hilal-beer.css` in `changes/browser/themes/shared/` | MIT, Copyright (c) 2021 Beer css! |
| [M3E](https://github.com/matraic/m3e) by matraic | Material 3 Expressive switches, buttons and segmented buttons on the settings page | Vendored bundle `changes/browser/components/preferences/m3e-web.all.min.mjs` | MIT, Copyright (c) 2025-2026 matraic |
| [Material Symbols](https://github.com/google/material-design-icons) | Icon font of the shell, the new tab page and Boosts | `changes/browser/themes/shared/material-symbols-outlined.woff2`, loaded from the browser itself, never from the network | Apache 2.0, Copyright Google LLC |
| [uBlock Origin](https://github.com/gorhill/uBlock) by Raymond Hill | Built-in content blocker | The unmodified release (1.57.2) bundled as a distribution extension in `changes/browser/app/distribution/extensions/`; its GPL text ships inside the extension | GPL 3.0 |
| [Firefox translations](https://github.com/mozilla-l10n/firefox-l10n) | Turkish and other language packs | Fetched by `scripts/setup-locales.sh`, merged with Hilal's strings and built into language packs | MPL 2.0 |

## Android app

| Project | What Hilal uses it for | How it is included | License |
|---------|------------------------|--------------------|---------|
| [GeckoView](https://mozilla.github.io/geckoview/) | The browser engine | Maven dependency `org.mozilla.geckoview:geckoview-omni` | MPL 2.0 |
| [AndroidX and Jetpack Compose](https://developer.android.com/jetpack/androidx) (Core, Activity, Lifecycle, Splash Screen, Compose UI, Material 3, Material Icons, Room) | App structure, UI, Material 3 Expressive components and the local database | Gradle dependencies in `android/app/build.gradle.kts` | Apache 2.0 |
| [uBlock Origin](https://github.com/gorhill/uBlock) | Built-in content blocker | The unmodified release (1.57.2) in `android/app/src/main/assets/extensions/` | GPL 3.0 |
| [JUnit 4](https://junit.org/junit4/) | Unit tests only, not shipped | Gradle test dependency | EPL 1.0 |

## Website (`www/`)

| Project | What it is used for | License |
|---------|---------------------|---------|
| [React](https://react.dev) and React DOM | The site's UI | MIT |
| [Vite](https://vite.dev) and @vitejs/plugin-react | Building the site | MIT |
| [Tailwind CSS](https://tailwindcss.com) | Layout styles | MIT |
| [Beer CSS](https://github.com/beercss/beercss) | Material Design components and the Material Symbols font | MIT (font: Apache 2.0) |
| [material-dynamic-colors](https://github.com/leonardorafael/material-dynamic-colors) | Material color themes | MIT |
| [Motion](https://motion.dev) | Animations | MIT |
| [Lucide](https://lucide.dev) (lucide-react) | Icons | ISC |
| [@vercel/blob](https://github.com/vercel/storage) | Storing shared Boosts | Apache 2.0 |
| [Roboto Flex, Roboto](https://fonts.google.com/specimen/Roboto+Flex) and [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Fonts, served by Google Fonts | SIL Open Font License 1.1 |
| TypeScript, tsx, esbuild, autoprefixer | Development only, not shipped | Apache 2.0 / MIT |

## Tools

| Project | What it is used for | License |
|---------|---------------------|---------|
| clap, toml, serde, sha2, flate2, tar, anyhow | The `hil` patch manager in `hil/` | MIT or Apache 2.0 |

## Updating this file

When a dependency is added, removed or updated, change the matching row here.
For anything shipped inside the desktop browser, also update the "Hilal
Browser Components" section of `about:license`
(`changes/toolkit/content/hilal-license.patch`).
