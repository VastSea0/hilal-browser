# Hilal Browser

<p align="center">
  <img src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/branding/hilal/default128.png" alt="Hilal Browser Logo" width="128" height="128" />
</p>

<p align="center">
  A premium, privacy-first, light-weight web browser built on top of Firefox Quantum (Gecko) featuring custom Vertical Tabs, built-in uBlock Origin protection, and elegant glassmorphism transparency.
</p>

<p align="center">
  <a href="https://github.com/VastSea0/hilal-browser/actions"><img src="https://img.shields.io/github/actions/workflow/status/VastSea0/hilal-browser/build.yml?branch=main&style=flat-square&label=build" alt="Build Status" /></a>
  <a href="https://discord.gg/JZJ4tmPHFw"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=flat-square&logo=discord&logoColor=white" alt="Discord Server" /></a>
  <a href="https://github.com/VastSea0/hilal-browser/releases"><img src="https://img.shields.io/github/v/release/VastSea0/hilal-browser?style=flat-square&color=teal&label=alpha" alt="Latest Release" /></a>
  <a href="https://github.com/VastSea0/hilal-browser/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VastSea0/hilal-browser?style=flat-square&color=blue" alt="License" /></a>
</p>

<p align="center">
  <img src="prefs/browser/base/content/hilal/black-white.png" alt="Hilal Browser Interface Preview" width="800" />
</p>

---

## Core Features

*   **Gecko Engine Power**: Built on top of Firefox Quantum, providing standard add-on compatibility, memory safety, and top-tier web standards compliance.
*   **uBlock Origin Integrated**: Intrusive advertisements, tracking cookies, and telemetry popups are blocked by default for a clean, fast experience.
*   **Vertical Collapsible Tabs**: Reclaims vertical reading space on widescreen displays via a collapsible sidebar hierarchical list.
*   **Translucent Glass Interface**: Premium glassmorphic styles that harmonize with macOS native transparent and vibrant window boundaries.
*   **Sovereign Privacy**: No user profiling, no tracking telemetry, no remote storage, 100 percent open source and transparent.

---

## Project History

Hilal Browser is the continuation of the project previously developed as **Huma Browser**. The project has now been officially restarted and reintroduced under the **Hilal Browser** name, with the current repository, branding, defaults, and documentation reflecting that new identity.

This repository is **not** a fork of the Firefox source code — it is a small **patch and overlay layer** on top of upstream [mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox). We stay as close to upstream as possible so we can keep rebasing forward forever.

---

## Workspace Layout

Everything Hilal-specific lives in this repository:

| Folder | Purpose |
| --- | --- |
| `patches/` | Numbered, focused `.patch` files (unified diffs) applied to Firefox in `series` order. |
| `branding/` | Branding overlays. Subdirectories are copied to `browser/branding/<name>/` in Firefox. |
| `prefs/` | Optional preference / configuration overlays mirroring the Firefox directory structure. |
| `scripts/` | Workflow automation scripts for setup, apply, refresh, upstream sync, and builds. |
| `docs/` | Workflow and build documentation. |

---

## Quick Start (macOS)

```bash
# 1. Complete Mozilla's one-time macOS setup:
#    https://firefox-source-docs.mozilla.org/setup/macos_build.html

# 2. Clone this repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 3. Clone Firefox into ./firefox (gitignored) and checkout FIREFOX_COMMIT
scripts/setup-firefox.sh

# 4. Apply all Hilal patches and overlays
scripts/apply.sh

# 5. Build (delegates to ./mach build inside ./firefox)
scripts/build-macos.sh

# 6. Run the browser
(cd firefox && ./mach run)
```

The Firefox source tree under `./firefox/` is **gitignored** inside this repository to prevent accidental commits of upstream files.

---

## The Five Core Operations

| Goal | Command |
| --- | --- |
| Get the pinned Firefox checkout next to this repo | `scripts/setup-firefox.sh` |
| Apply every Hilal patch + overlay onto Firefox | `scripts/apply.sh` |
| Regenerate patches from changes you made in `./firefox` | `scripts/refresh.sh` |
| Pull upstream Firefox and rebase Hilal on top | `scripts/sync-upstream.sh` |
| Build on macOS | `scripts/build-macos.sh` |
| Build/test the Flatpak package | `scripts/build-flatpak.sh` |

All scripts accept `-h` for usage. See `docs/WORKFLOW.md` for the full developer flow.

---

## Layering Mechanics

### Patches
`patches/series` lists `.patch` files in the order they should be
applied. Each file is a plain unified diff (compatible with `git apply`
and `patch -p1`). `scripts/apply.sh` walks the series, skipping any
patch that's already in the tree.

Keep patches **small, focused, and one-purpose**. One feature per
patch, one bugfix per patch — same conventions that make a clean
Phabricator review.

### Branding & prefs overlays
Binary assets (icons, splash screens, etc.) make terrible patches.
Instead, anything under `branding/<name>/` is `rsync`'d directly into
`browser/branding/<name>/`. Anything under `prefs/` is copied to the
matching path in the Firefox tree. This keeps `patches/` text-only and
reviewable.

### Source tree layout
```
hilal-browser/              <- this repo
├── branding/hilal/         <- assets, mirrored into firefox/browser/branding/hilal/
├── patches/series         <- order of patch application
├── patches/*.patch        <- focused source-code patches
├── prefs/                 <- optional pref / config overlays
├── scripts/               <- workflow helpers
├── docs/                  <- detailed docs
└── firefox/               <- (gitignored) full Firefox checkout
```

---

## Documentation

- `docs/WORKFLOW.md` — full developer workflow, conflict resolution, when to patch vs overlay
- `docs/BUILD-MACOS.md` — macOS-specific build notes
- `docs/BUILD-WINDOWS.md` — Windows-specific build notes
- `docs/BUILD-FLATPAK.md` — Flatpak and Flathub packaging notes
- `docs/LOCALIZATION.md` — bundled langpacks and Hilal locale overlays
- `docs/UPSTREAM-SYNC.md` — how to roll forward to a newer Firefox
- `docs/UPDATES.md` — application update channel, MAR creation, and release signing checklist

---

## License

The Hilal branding assets in `branding/hilal/` are © Hilal Browser
contributors. The build glue, scripts, and patches in this repository
are released under the
[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) to
match Firefox.
