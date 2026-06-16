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

## Quick Start (macOS / Linux)

First, make sure you have Rust installed, then compile and bootstrap the patch manager (`hil`):

```bash
# Clone the repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# Build and install the patch manager
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil

# Setup the pinned Firefox checkout and apply patches
./bin/hil setup
./bin/hil apply

# Compile and run (on Linux, use scripts/build-linux.sh instead)
scripts/build-macos.sh
(cd engine && ./mach run)
```

### Quick Start (Windows)

Ensure you have Rust, Visual Studio, and MozillaBuild installed, then run in Git Bash or PowerShell:

```powershell
# Clone the repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# Build and install the patch manager
cargo build --release --manifest-path hil/Cargo.toml
if (-not (Test-Path bin)) { New-Item -ItemType Directory -Path bin }
Copy-Item hil\target\release\hil.exe -Destination bin\hil.exe

# Setup the pinned Firefox checkout and apply patches
.\bin\hil.exe setup
.\bin\hil.exe apply

# Compile and run (PowerShell convenience script)
.\scripts\build-windows.ps1 -Run
```

---

## Workspace Layout

| Path | Purpose |
| --- | --- |
| `changes/` | Patches (`*.patch`) and overlays mirroring the Firefox source tree. |
| `manifest.toml` | Patch and overlay order used by `bin/hil`. |
| `upstream.lock` | Pinned upstream Firefox commit and tarball checksums. |
| `bin/hil` | Rust patch manager used for setup, apply, refresh, status, validate, and verify. |
| `scripts/` | Build, packaging, release, and localization helpers. |
| `docs/` | Workflow, build, release, update, and localization notes. |
| `engine/` | Gitignored Firefox checkout created by `./bin/hil setup`. |

---

## Core Operations

| Goal | Command |
| --- | --- |
| Setup the pinned Firefox checkout | `./bin/hil setup` |
| Apply all patches and overlays | `./bin/hil apply` |
| Reset and force-apply patches | `./bin/hil apply --force` |
| Regenerate patches from `engine/` edits | `./bin/hil refresh` |
| Show workspace status | `./bin/hil status` |
| Validate repository metadata | `./bin/hil validate` |
| Verify upstream checksum | `./bin/hil verify` |
| Build on macOS | `scripts/build-macos.sh` |
| Build on Linux | `scripts/build-linux.sh` |
| Build on Windows | `.\scripts\build-windows.ps1` |

---

## Layering Mechanics

### Patches & Overlays (`changes/`)
All customization files are unified under the `changes/` directory. 
- **Patches**: Diff files ending in `.patch` representing source-code edits. Applied to the code tree via `git apply`.
- **Overlays**: Asset directories (like `changes/browser/branding/hilal`) or config files that are synced directly to the matching path in the source tree.

### Build Manifest (`manifest.toml`)
The application order is strictly governed by `manifest.toml`. The `[patches]` block defines the exact order in which patch diffs are applied and overlays are copied. The Rust `hil` tool commits each step sequentially in the local `engine/` Git history. This allows `./bin/hil refresh` to automatically map edits back to individual patch files while cleanly preserving any description headers.

---

## Development Model

The Firefox checkout under `engine/` is generated state and is not committed in this repo. Edit Firefox source in `engine/`, build and test there, then run `./bin/hil refresh` to regenerate the patch files declared in `manifest.toml`.

Branding, preferences, locales, and other overlay files can be edited directly under `changes/`; `./bin/hil apply` copies them into `engine/`.

---

## Documentation

- `docs/WORKFLOW.md` — full developer workflow, conflict resolution, when to patch vs overlay
- `docs/BUILD-MACOS.md` — macOS-specific build notes
- `docs/BUILD-WINDOWS.md` — Windows-specific build notes
- `docs/BUILD-FLATPAK.md` — Flatpak and Flathub packaging notes
- `docs/BUILD-ANDROID.md` — Android build and packaging notes
- `docs/LOCALIZATION.md` — bundled langpacks and Hilal locale overlays
- `docs/TRANSLATING.md` — translate instructions and locale guidelines
- `docs/UPSTREAM-SYNC.md` — how to roll forward to a newer Firefox
- `docs/UPDATES.md` — application update channel, MAR creation, and release signing checklist
- `docs/STABLE-READINESS.md` — repo guardrails, browser smoke, and human release checks
- `docs/PRIVACY_LEVELS.md` — privacy levels design document
- `docs/TAHOE_SAFARI_UI_PLAN.md` — Tahoe Safari-inspired UI design document
- `docs/TAHOE_SAFARI_UI_PROGRESS.md` — Tahoe Safari-inspired UI progress logs
- `docs/FIREFOX-UI-FIX.md` — details on the custom browser UI overrides and styling patches

---

## Star History

<a href="https://www.star-history.com/?repos=VastSea0%2Fhilal-browser&type=timeline&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&legend=top-left" />
 </picture>
</a>

---

## License

The Hilal branding assets in `changes/browser/branding/hilal/` are © Hilal Browser contributors. The build glue, scripts, and patches in this repository are released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) to match Firefox.
