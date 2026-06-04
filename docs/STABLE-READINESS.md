# Stable Readiness

Stable readiness has three separate layers. Do not replace automated metadata
checks with manual launch testing, and do not treat a passing repo check as proof
that a packaged browser can launch.

## 1. Repo Guardrails

These checks run without `engine/` and should stay fast enough for every pull
request:

```bash
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil
./bin/hil validate
node scripts/check-release-metadata.mjs --hil-bin ./bin/hil
```

They validate:

- `manifest.toml`, `upstream.lock`, and `hil/Cargo.toml` parse correctly.
- Every `manifest.toml` path exists under `changes/`.
- `hil --version` matches `hil/Cargo.toml`.
- Release metadata can be compared against a single expected version.
- Update manifest generation uses `HILAL_FIREFOX_SRC` or `engine/` for the
  Firefox app version and rejects Hilal display versions as app versions.
- Active scripts do not fall back to a legacy `firefox/` checkout.

## 2. Release Decision

Every release run derives one machine-readable release environment from the tag:

```bash
scripts/release-env.mjs --tag v0.3.0 --json
```

After `engine/` exists, include the Firefox app version:

```bash
scripts/release-env.mjs \
  --tag v0.3.0 \
  --firefox-src engine \
  --require-firefox-version \
  --json
```

This produces the Hilal version, display version, release tag, prerelease flag,
channel, Firefox/Gecko app version, and standard artifact filenames. For
`v0.3.0` on macOS arm64 the expected files are:

- `Hilal-Browser-v0.3.0-macOS.dmg`
- `hilal-v0.3.0-macos-arm64.complete.mar`
- `hilal-update-manifest.json`
- `SHA256SUMS`
- `hilal-browser-sbom.spdx.json`

For a release candidate, run the strict form:

```bash
node scripts/check-release-metadata.mjs \
  --release-version 0.3.0 \
  --release-tag v0.3.0 \
  --check-dist \
  --require-update-manifest \
  --require-platform macos-arm64
```

Before publishing a GitHub Release draft, validate the uploaded assets:

```bash
gh release view v0.3.0 --json tagName,isDraft,isPrerelease,assets > release.json
scripts/check-release-assets.mjs \
  --release-json release.json \
  --tag v0.3.0 \
  --platform macos-arm64
```

## 3. Browser Smoke

Browser smoke tests run only after patches apply and a build/package exists:

```bash
scripts/smoke-browser.sh --app-bundle "engine/obj-*/dist/Hilal Browser.app"
```

The script checks the packaged browser, not just repository files. It verifies
the Hilal update policy, bundled uBlock Origin, bundled Turkish langpack, overlay
checksums, modern Firefox/Gecko app version separation, and a headless launch
with a disposable profile.

The release workflow runs this smoke gate after packaging the macOS app and
before publishing release assets.

## 4. Human Smoke

Manual testing should stay small and release-focused:

- First launch visual sanity on macOS, Windows, Linux, and Flatpak.
- DMG, installer, signing, notarization, and OS security prompts.
- Basic browsing with media playback, downloads, and extensions.
- Update UX copy and restart behavior.
- Hilal-specific chrome polish, including workspaces and sidebar layout.

Stable release is blocked when any automated guardrail, packaged browser smoke,
artifact name, update manifest, Flatpak metadata, or required human check
disagrees with the release version.
