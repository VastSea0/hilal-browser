# Hüma Browser — Branding

This directory holds the visual identity, installer chrome, and locale
strings for the **Hüma Browser** product. It is selected at build time via
`MOZ_BRANDING_DIRECTORY=browser/branding/huma`, which is the project
default (see `browser/confvars.sh`).

## 1. Branding strategy

Hüma takes its name from the Hüma bird, a mythological phoenix-like
creature. The mark is meant to feel:

| Attribute | How it shows up in the design |
| --- | --- |
| **Modern** | Geometric circle (orb), no skeuomorphism, flat fills. |
| **Minimal** | Two motifs only: an orb and a single stylized wing. |
| **Fast** | The wing sweeps left-to-right, breaking the orb to imply motion. |
| **Intelligent / focused** | Centered, balanced composition; symmetric orb. |
| **Free / phoenix** | Wing detaches from and rises across the orb. |
| **Privacy / depth** | Deep-navy core (the orb) — the wing is the "outside world." |

The mark is fully original. It does **not** reuse Firefox's fox-and-globe,
its color palette, or its wordmark.

## 2. Color palette

### Primary
| Token | Hex | Usage |
| --- | --- | --- |
| Hüma Navy | `#0E1E3F` | App background, installer chrome, orb base |
| Deep Navy | `#0A1733` | Orb shadow, deep accents |
| Mid Navy | `#1F3A6B` | Orb highlight, progress-bar track |
| Hüma Cyan | `#5FD4E6` | Primary accent, wing highlight, progress fill |
| Mid Teal | `#3BA9B8` | Wing mid-tone |
| Deep Teal | `#1F6470` | Wing shadow, secondary text on light |

### Secondary
| Token | Hex | Usage |
| --- | --- | --- |
| Pure White | `#FFFFFF` | Primary text on dark |
| Silver | `#B8C5D6` | Secondary text, footnotes |
| Charcoal | `#0D1117` | Dialog background, code surfaces |
| Private Purple | `#7847D1` | Private-browsing accent |

## 3. Typography

| Role | Recommended family | Fallbacks |
| --- | --- | --- |
| UI / body | **Inter** | `system-ui, -apple-system, "Segoe UI", sans-serif` |
| Display / hero | Space Grotesk | Inter |
| Monospace / code | JetBrains Mono | `ui-monospace, "SF Mono", monospace` |

Wordmarks use Inter at weight 600 for "Hüma" and weight 300 for the
optional "Browser" suffix, letter-spacing `-1.2`.

## 4. Asset inventory

### SVG sources (`content/`)
| File | Purpose | Notes |
| --- | --- | --- |
| `about-logo.svg` | Canonical full-color mark | 512×512, gradients, gloss |
| `logo-dark.svg` | Dark-mode variant | Brighter wing, deeper orb |
| `logo-monochrome.svg` | Single-color variant | Uses `currentColor` |
| `logo-favicon.svg` | Simplified for 16×16 | No clip path, no gloss |
| `about-wordmark.svg` | Full "Hüma Browser" lockup | About dialog |
| `huma-wordmark.svg` | "Hüma" only, `currentColor` | Exposed at the chrome URL `firefox-wordmark.svg` for compatibility |
| `document_pdf.svg` | PDF document icon | Navy + cyan band |

### Generated rasters (`./`)
All of the following are produced from the SVGs by
`tools/gen_huma_assets.py` (using `qlmanage` + `Pillow` + `iconutil`).
They are committed to the tree so contributors do not need the renderer
toolchain.

| File | Size(s) | Consumer |
| --- | --- | --- |
| `default{16,22,24,32,48,64,128,256}.png` | Listed | Linux GTK icons; chrome jar (`icon16.png`, …) |
| `VisualElements_{70,150}.png` | 70, 150 | Windows Start tile |
| `PrivateBrowsing_{70,150}.png` | 70, 150 | Windows Start tile (private mode) — purple-tinted |
| `firefox.icns` | 16…1024 | macOS app bundle icon |
| `firefox.ico` | 16,24,32,48,64,128,256 | Windows EXE icon |
| `firefox64.ico` | 16…64 | Smaller Windows asset |
| `document.icns` / `document.ico` | multi | File-type icons |
| `document_pdf.ico` | multi | PDF file-type icon |
| `disk.icns` | multi | macOS DMG volume icon |
| `newtab.ico`, `newwindow.ico`, `pbmode.ico` | multi | Windows jump-list icons |
| `wizHeader.bmp`, `wizHeaderRTL.bmp`, `wizWatermark.bmp` | NSIS sizes | Windows installer chrome |
| `background.png` | 660×400 | macOS DMG background |
| `content/about-logo.png` (+ `@2x`) | 128, 256 | `chrome://branding/content/about-logo.png` |
| `content/about-logo-private.png` (+ `@2x`) | 128, 256 | Private-browsing about logo |
| `content/about.png` | 512 | `chrome://branding/content/about.png` |

### Locale strings
- `locales/en-US/brand.ftl` — Fluent brand tokens (`-brand-short-name`, etc.)
- `locales/en-US/brand.properties` — Legacy `.properties` tokens

### Build glue
- `moz.build` — `include("../branding-common.mozbuild"); FirefoxBranding()`
- `configure.sh` — `MOZ_APP_DISPLAYNAME`, `MOZ_APP_REMOTINGNAME`, `MOZ_MACBUNDLE_ID`
- `branding.nsi` — Windows installer text + colors
- `firefox.VisualElementsManifest.xml` / `private_browsing.VisualElementsManifest.xml`
- `pref/firefox-branding.js` — Update URLs, etc.

## 5. Build-system wiring

`browser/confvars.sh` already pins:

```sh
MOZ_BRANDING_DIRECTORY=browser/branding/huma
MOZ_OFFICIAL_BRANDING_DIRECTORY=browser/branding/huma
```

`browser/moz.configure` pins:

```python
imply_option("MOZ_APP_VENDOR", "Huma")
imply_option("--with-distribution-id", "org.huma")
```

Together these produce:

- macOS `CFBundleIdentifier` = `org.huma.browser`
- Linux `WM_CLASS` / `.desktop` `Exec=huma`
- Helper process bundle ids: `org.huma.browser.plugincontainer`, etc.

## 6. Regenerating raster assets

Re-run the asset script after editing any SVG:

```sh
# From the repo root.
mkdir -p browser/branding/huma/_raster
for s in 16 22 24 32 48 64 70 128 150 256 512 1024; do
  qlmanage -t -s $s -o browser/branding/huma/_raster \
    browser/branding/huma/content/about-logo.svg >/dev/null
  mv "browser/branding/huma/_raster/about-logo.svg.png" \
     "browser/branding/huma/_raster/logo-${s}.png"
done
python3 browser/branding/huma/tools/gen_huma_assets.py
rm -rf browser/branding/huma/_raster
```

(The `tools/gen_huma_assets.py` script is the same one used to seed this
directory; it is kept in the tree for reproducibility — see below.)

## 7. Remaining manual tasks

These items are intentionally **out of scope** for this first rebranding
pass (desktop branding directory only) and should be tackled in follow-up
commits:

1. **MSIX assets** (`msix/Assets/*.png`) — required only for the Windows
   Store package; not produced yet. Generate from `about-logo.svg` at the
   sizes Microsoft expects (Square44, Square150, Wide310x150, StoreLogo,
   etc.).
2. **macOS `Assets.car`** — compiled asset catalog used by recent macOS
   builds for `AppIcon`. Build with `actool` from a `.xcassets` bundle that
   contains `firefox.icns`-equivalent slices.
3. **Hardcoded "Firefox" / "Mozilla" strings** in `.ftl` files outside the
   branding directory (e.g. `browser/locales/en-US/browser/aboutDialog.ftl`).
   Most prose already references `{ -brand-short-name }`, but marketing
   copy in onboarding flows still mentions "Firefox" verbatim.
4. **Android (Fenix / GeckoView) branding** — `mobile/android/branding/`.
   Intentionally excluded per scope.
5. **Update channel branding** — separate icons / wordmarks for Beta /
   Nightly / DevEdition if you intend to ship multiple channels.
6. **App signing / notarization identifiers** — `org.mozilla.updater` in
   `Info.plist` should become `org.huma.updater` once a real developer
   certificate exists.
7. **Crash-reporter and Sentry/Glean app IDs** — review
   `toolkit/crashreporter/` and telemetry configs before public release.

## 8. Build verification notes

A full `./mach build` was **not** run as part of this rebranding pass
(per project instructions). A future verification pass should at minimum:

- `./mach configure` — confirms `MOZ_BRANDING_DIRECTORY` resolves.
- `./mach build faster` — covers the JAR manifests and chrome URL
  resolution (`chrome://branding/content/about-logo.png`).
- Smoke-test `./mach run` and inspect the About dialog, new-tab page,
  and `about:logo`.

## 9. License

All Hüma branding assets in this directory are released under the
**Mozilla Public License, v. 2.0**, matching the rest of the tree. They
are original works; no Firefox / Mozilla trademark material is reused.
