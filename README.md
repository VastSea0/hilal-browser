Hilal Browser is a patch-and-overlay layer on top of upstream Firefox, not a fork.

### Quick Start (macOS / Linux)

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

# Compile and run
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

## Documentation

Architecture and patch workflow details live in `docs/WORKFLOW.md`.

Released changes are tracked in `changelog.md`.

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

## Development Model

The Firefox checkout under `engine/` is generated state and is not committed in
this repo. Edit Firefox source in `engine/`, build and test there, then run
`./bin/hil refresh` to regenerate the patch files declared in `manifest.toml`.

Branding, preferences, locales, and other overlay files can be edited directly
under `changes/`; `./bin/hil apply` copies them into `engine/`.

## License

The Hilal branding assets in `changes/browser/branding/hilal/` are © Hilal Browser contributors. The build glue, scripts, and patches in this repository are released under the [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) to match Firefox.
