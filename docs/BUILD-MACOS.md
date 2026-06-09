# Building Hilal Browser on macOS

This is a short addendum to Mozilla's official guide:
<https://firefox-source-docs.mozilla.org/setup/macos_build.html>

Bootstrap your machine once:

```bash
curl -L https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py -O
python3 bootstrap.py
```

That installs Xcode CLT, the build sysroot, `mozbuild`/`mach` dependencies,
`cargo`, and `cbindgen`.

## Building Hilal

From the repo root, first compile and bootstrap the `hil` patch manager:

```bash
# 1. Compile the hil patch manager tool
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil

# 2. Fetch Firefox into ./engine (one-time)
./bin/hil setup

# 3. Apply patches + branding overlays
./bin/hil apply

# 4. Full build (10-40 minutes on first run)
scripts/build-macos.sh

# 5. Run
(cd engine && ./mach run)
```

## Faster iteration

| Change kind | Command |
| --- | --- |
| Front-end only (JS, HTML, CSS, XHTML, FTL, .ini) | `scripts/build-macos.sh faster` |
| C++ / Rust only | `scripts/build-macos.sh binaries` |
| Mixed | `scripts/build-macos.sh` (full) |

These map directly to `./mach build faster` / `./mach build binaries`
and are documented at <https://firefox-source-docs.mozilla.org/build/buildsystem/buildfaster.html>.

## Where does the built app live?

After a successful build, the macOS app bundle is at:

```
engine/obj-aarch64-apple-darwin*/dist/Hilal Browser.app
```

The bundle name comes from `changes/browser/branding/hilal/configure.sh`, which sets
`MOZ_APP_DISPLAYNAME` to `Hilal Browser`. The CFBundleIdentifier reflects
our distribution id (`org.hilal`) thanks to the patch in
`changes/browser/branding-defaults.patch`.

## Code signing and notarization

Local development builds are unsigned. macOS Gatekeeper may complain
the first time you launch from Finder; right-click → Open works around
it, or run via `./mach run`.

Do not upload unsigned local DMGs as public release assets. Downloaded macOS
apps are subject to Gatekeeper quarantine, and a normal double-click launch for
users requires a Developer ID signed and notarized app. The Apple Developer
Program is required for public macOS releases. Without it, distribute unsigned
development builds with manual Gatekeeper workaround instructions.

For distribution builds, use `scripts/sign-macos.sh` after packaging.

### Prerequisites

1. Enroll in the Apple Developer Program.
2. Create a **Developer ID Application** certificate in Apple Developer
   Portal and install it in your local Keychain.
3. Generate an **app-specific password** for notarization.
4. Note your **Apple Team ID**.

### Sign only (local testing)

```bash
export CODESIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)"
scripts/build-macos.sh package
scripts/sign-macos.sh
```

### Sign + notarize + staple (release)

```bash
export CODESIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)"
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="TEAMID"

scripts/build-macos.sh package
scripts/sign-macos.sh --notarize
```

### Verify a signed bundle

```bash
scripts/sign-macos.sh --verify-only
```

Or manually:

```bash
codesign --verify --deep --strict "engine/obj-*/dist/Hilal Browser.app"
spctl -a -t exec -vv "engine/obj-*/dist/Hilal Browser.app"
```

### CI secrets

Do not commit certificates or passwords. In GitHub Actions, add these
as repository secrets:

| Secret | Description |
| --- | --- |
| `CODESIGN_IDENTITY` | Developer ID Application identity string |
| `APPLE_ID` | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Apple Team ID |
| `MACOS_CERTIFICATE` | Base64-encoded `.p12` certificate (optional, for CI keychain import) |
| `MACOS_CERTIFICATE_PASSWORD` | Password for the `.p12` (optional) |

See `.github/workflows/release.yml` for the optional CI signing job.

## Common issues

**`mozconfig` not found / weird defaults.** `./mach` doesn't require a
`mozconfig`. If you want one, drop it inside `engine/` (gitignored by
its own tree). Don't add it here.

**Object directory mismatch.** Different macOS arches use different
`obj-*` paths. `./mach` picks correctly; if you've swapped Macs, run
`./mach clobber` inside `engine/`.

**Bootstrap re-runs.** If `./mach build` complains about a missing
`bootstrap`ed tool, rerun `./mach bootstrap` (this is the in-tree
helper, distinct from the one-time `bootstrap.py` above).

**Big rebuilds after `./bin/hil apply --force`.** Force-apply resets
the tree and often invalidates the build cache.
