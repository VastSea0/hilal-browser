# Hilal Browser

<p align="center">
  <img src="https://raw.githubusercontent.com/VastSea0/hilal-browser/main/changes/browser/branding/hilal/default128.png" alt="Hilal Browser Logo" width="128" height="128" />
</p>

<p align="center">
  A premium, privacy-first, light-weight web browser built on top of Firefox Quantum (Gecko) featuring custom Vertical Tabs, built-in uBlock Origin protection, and elegant glassmorphism transparency.
</p>

<p align="center">
  <a href="https://github.com/VastSea0/hilal-browser/actions/workflows/verify-patches.yml"><img src="https://img.shields.io/github/actions/workflow/status/VastSea0/hilal-browser/verify-patches.yml?branch=main&style=flat-square&label=patches" alt="Patch Verification" /></a>
  <a href="https://discord.gg/JZJ4tmPHFw"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=flat-square&logo=discord&logoColor=white" alt="Discord Server" /></a>
  <a href="https://github.com/VastSea0/hilal-browser/releases"><img src="https://img.shields.io/github/v/release/VastSea0/hilal-browser?style=flat-square&color=teal&label=alpha" alt="Latest Release" /></a>
  <a href="https://github.com/VastSea0/hilal-browser/blob/main/LICENSE"><img src="https://img.shields.io/github/license/VastSea0/hilal-browser?style=flat-square&color=blue" alt="License" /></a>
</p>

<p align="center">
  <img src="changes/browser/base/content/hilal/black-white.png" alt="Hilal Browser Interface Preview" width="800" />
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

| Folder / File | Purpose |
| --- | --- |
| `changes/` | Unified folder structure containing all patches (`*.patch`) and overlays (branding, CSS, assets) mirroring the Firefox source tree layout. |
| `manifest.toml` | Declarative configuration mapping the exact application sequence of patches and overlays. |
| `upstream.lock` | Strict lock file tracking the pinned upstream version, commit hash, and tarball checksums. |
| `bin/hil` | Zero-dependency native patch manager utility compiled in Rust. |
| `scripts/` | Workflow platform build and sync helpers. |
| `docs/` | Workflow and build documentation. |

---

## Quick Start (macOS)

```bash
# 1. Complete Mozilla's one-time macOS setup:
#    https://firefox-source-docs.mozilla.org/setup/macos_build.html

# 2. Clone this repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 3. Setup workspace (clones Firefox into gitignored engine/ and checks out pinned commit)
./bin/hil setup

# 4. Apply all patches and overlays sequentially
./bin/hil apply

# 5. Build (delegates to ./mach build inside engine/)
scripts/build-macos.sh

# 6. Run the browser
(cd engine && ./mach run)
```

The Firefox source tree under `./engine/` is **gitignored** inside this repository to prevent accidental commits of upstream files.

---

## Core Operations

| Goal | Command |
| --- | --- |
| Setup the pinned Firefox checkout | `./bin/hil setup` |
| Apply all patches + overlays | `./bin/hil apply` |
| Reset and force-reapply patches | `./bin/hil apply --force` |
| Regenerate patches from changes made in `./engine` | `./bin/hil refresh` |
| Show current workspace status | `./bin/hil status` |
| Verify upstream tarball checksum | `./bin/hil verify` |
| Build on macOS | `scripts/build-macos.sh` |

---

## Layering Mechanics

### Patches & Overlays (`changes/`)
All customization files are unified under the `changes/` directory. 
- **Patches**: Diff files ending in `.patch` representing source-code edits. Applied to the code tree via `git apply`.
- **Overlays**: Asset directories (like `changes/browser/branding/hilal`) or config files that are synced directly to the matching path in the source tree.

### Build Manifest (`manifest.toml`)
The application order is strictly governed by `manifest.toml`. The `[patches]` block defines the exact order in which patch diffs are applied and overlays are copied. The Rust `hil` tool commits each step sequentially in the local `engine/` Git history. This allows `./bin/hil refresh` to automatically maps edits back to individual patch files while cleanly preserving any description headers.

---

## Documentation

- `docs/WORKFLOW.md` — full developer workflow, conflict resolution, when to patch vs overlay
- `docs/BUILD-MACOS.md` — macOS-specific build notes
- `docs/BUILD-WINDOWS.md` — Windows-specific build notes
- `docs/BUILD-FLATPAK.md` — Flatpak and Flathub packaging notes
- `docs/LOCALIZATION.md` — bundled langpacks and Hilal locale overlays
- `docs/UPSTREAM-SYNC.md` — how to roll forward to a newer Firefox
- `docs/UPDATES.md` — application update channel, MAR creation, and release signing checklist
- `docs/STABLE-READINESS.md` — repo guardrails, browser smoke, and human release checks

---

## License

The Hilal branding assets in `changes/browser/branding/hilal/` are © Hilal Browser contributors. The build glue, scripts, and patches in this repository are released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) to match Firefox.
