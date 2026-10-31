# Hilal Browser

<p align="center">
  <img src="changes/browser/branding/hilal/default128.png" alt="Hilal Browser logo" width="128" height="128" />
</p>

<p align="center">
  <a href="https://github.com/VastSea0/hilal-browser/releases"><img src="https://img.shields.io/github/v/release/VastSea0/hilal-browser?style=flat-square&label=release" alt="Latest release" /></a>
  <a href="https://github.com/VastSea0/hilal-browser/actions/workflows/verify-patches.yml"><img src="https://img.shields.io/github/actions/workflow/status/VastSea0/hilal-browser/verify-patches.yml?branch=main&style=flat-square&label=patches" alt="Patch verification" /></a>
  <a href="https://discord.gg/JZJ4tmPHFw"><img src="https://img.shields.io/badge/Discord-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/VastSea0/hilal-browser?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <img src="changes/browser/base/content/hilal/black-white.png" alt="Hilal Browser interface" width="800" />
</p>

Hilal is an experimental desktop browser built on Firefox ESR. It combines isolated workspaces, a Material 3 Expressive interface, and configurable privacy profiles while retaining Gecko and Firefox extension compatibility.

The project is in alpha and was previously developed as Huma Browser.

## Features

### Interface

- Material 3 Expressive shell with its own top bar, address bar, and sidebar
- Vertical sidebar tabs or a horizontal tab strip, switchable at any time
- Light, dark, and system themes with per-workspace or global accent colors
- Material 3 new tab page and settings page

### Workspaces

- Separate container context for each workspace
- Optional shared pinned tabs and tab groups
- Workspace creation, switching, and visibility controls
- First-run setup for theme, tab layout, workspaces, privacy level, search engine, and pinned sites

### Browser controls

- Custom and built-in search bangs in the address bar
- Editable keyboard shortcuts for Hilal actions and Firefox commands
- Balanced, Strict, and Maximum local privacy profiles
- uBlock Origin included by default
- Telemetry disabled by default
- In-browser language selection and Turkish localization

Privacy profiles are hardening presets, not anonymity modes; they do not hide your public IP address.

## Android

Hilal for Android is a separate app built on GeckoView with a Material 3
Expressive interface, gesture-driven address bar, and uBlock Origin. Its code
lives in [`android/`](android/); see [docs/MOBILE.md](docs/MOBILE.md).

Unlike the desktop browser, the Android app sends an anonymous daily usage
ping, which can be turned off in its settings. The
[privacy policy](https://hilal-browser.vercel.app/privacy.html) lists exactly
what it contains.

## Download

Desktop and Android downloads are available from the
[releases page](https://github.com/VastSea0/hilal-browser/releases) and the
[website](https://hilal-browser.vercel.app).

## Build from source

Install the [Firefox build prerequisites](https://firefox-source-docs.mozilla.org/setup/index.html) for your platform first. Rust is also required to compile the `hil` patch manager.

```bash
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil

./bin/hil setup
./bin/hil apply
```

Then run the build script for your platform:

```bash
scripts/build-macos.sh
scripts/build-linux.sh
```

On Windows, use `.\scripts\build-windows.ps1`. See [docs/BUILD-WINDOWS.md](docs/BUILD-WINDOWS.md) for the required environment and setup steps.

## Development

This repository contains the Hilal-specific patches, overlays, and build tooling. The Firefox source checkout is created in the gitignored `engine/` directory.

```text
changes/        patches and overlay files
manifest.toml   patch and overlay order
upstream.lock   pinned Firefox revision
engine/         local Firefox checkout
```

Source changes are made in `engine/`. Run `./bin/hil refresh` afterward to regenerate the files under `changes/`, then review and commit those files in this repository.

The complete patch workflow, including conflict resolution, is documented in [docs/WORKFLOW.md](docs/WORKFLOW.md). Other build, release, localization, and upstream sync notes live in [`docs/`](docs/).

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md), and
report security issues as described in [SECURITY.md](SECURITY.md). Questions
and discussion happen on [Discord](https://discord.gg/JZJ4tmPHFw).

## Star History

<a href="https://www.star-history.com/?repos=VastSea0%2Fhilal-browser&type=timeline&legend=top-left">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&theme=dark&legend=top-left" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&legend=top-left" />
    <img alt="Hilal Browser star history" src="https://api.star-history.com/chart?repos=VastSea0/hilal-browser&type=timeline&legend=top-left" />
  </picture>
</a>

## License

Hilal's patches, scripts, and other source files are available under the [Mozilla Public License 2.0](LICENSE). Branding assets are copyright Hilal Browser contributors.
