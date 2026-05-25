# Hilal Application Updates

Hilal uses Firefox's built-in application updater for desktop builds. The
client-side plumbing is intentionally small:

- `mozconfigs/base` enables `MOZ_UPDATER` for desktop builds.
- `patches/0014-hilal-update-policy.patch` packages
  `distribution/policies.json` with an `AppUpdateURL` pointing at Hilal update
  infrastructure.
- `scripts/make-full-update.sh` creates a complete MAR from a packaged build.
- `scripts/generate-update-manifest.mjs` records MAR URL, sha512, size,
  channel, build ID, and version metadata for GitHub Releases.

Android keeps the updater disabled because it is distributed through platform
package mechanisms rather than Firefox's desktop MAR updater.

## Build-Time Channel

Desktop builds default to:

```bash
MOZ_UPDATE_CHANNEL=hilal-release
MAR_CHANNEL_ID=hilal-release
ACCEPTED_MAR_CHANNEL_IDS=hilal-release
```

Override those environment variables before building if you need a different
release lane, for example `hilal-beta`.

## Create a Complete MAR

First build and package the browser:

```bash
scripts/build-macos.sh package
# or
scripts/build-linux.sh package
```

Then create a complete MAR:

```bash
scripts/make-full-update.sh 0.2.0-alpha.4
```

The output defaults to:

```text
dist/hilal-<version>.complete.mar
```

For production releases, sign the MAR during creation by pointing the script at
an NSS database containing the private key whose public certificate is embedded
in the shipped updater:

```bash
HILAL_SIGNMAR_NSS_DIR=/secure/path/to/nss-db \
HILAL_SIGNMAR_CERT=mar_sig \
scripts/make-full-update.sh 0.2.0-alpha.4
```

If signing variables are not provided, the script still creates a MAR but warns
that it is not safe for production updates.

## Publish Update XML

The bundled policy requests:

```text
https://updates.hilal.gkdevstudio.org/update/6/%PRODUCT%/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%SYSTEM_CAPABILITIES%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/update.xml
```

The update server must return Firefox update XML with a complete MAR patch for
the requesting platform, locale, channel, and version. A foreground check adds
`?force=1`.

The `www` app implements this route through the Vercel rewrite in
`www/vercel.json`:

```text
/update/6/.../update.xml -> /api/update?path=...
```

When no signed MAR metadata is configured, it returns an empty `<updates>`
document so clients do not attempt a broken update. There are two supported
metadata sources.

### Preferred: GitHub Release Manifest

Upload the complete MAR files to the GitHub Release, then generate and upload a
manifest asset named `hilal-update-manifest.json`:

```bash
scripts/generate-update-manifest.mjs \
  --version v0.2.0-alpha.4 \
  --build-id 20260525000000 \
  --mar macos-arm64=dist/hilal-macos-arm64.complete.mar \
  --mar-url macos-arm64=https://github.com/VastSea0/hilal-browser/releases/download/v0.2.0-alpha.4/hilal-macos-arm64.complete.mar \
  --mar linux-x86_64=dist/hilal-linux-x86_64.complete.mar \
  --mar-url linux-x86_64=https://github.com/VastSea0/hilal-browser/releases/download/v0.2.0-alpha.4/hilal-linux-x86_64.complete.mar

gh release upload v0.2.0-alpha.4 \
  dist/hilal-macos-arm64.complete.mar \
  dist/hilal-linux-x86_64.complete.mar \
  dist/hilal-update-manifest.json
```

The update endpoint fetches the latest GitHub Release, reads the manifest asset,
selects the correct MAR for the request's `BUILD_TARGET`, verifies channel and
metadata fields, and then returns Firefox-compatible update XML.

Required manifest fields for every platform:

- `platform`: `macos-arm64`, `macos-x86_64`, `linux-x86_64`,
  `linux-arm64`, `windows-x86_64`, or `windows-arm64`
- `url`: HTTPS URL for the complete MAR, normally the GitHub Release asset URL
- `hashFunction`: `sha512`
- `hashValue`: sha512 of the final signed MAR
- `size`: byte size of the final signed MAR

### Fallback: Environment Variables

For emergency or staged rollout cases, configure these environment variables for
each platform you publish:

```bash
HILAL_UPDATE_MACOS_MAR_URL=https://updates.example/hilal-macos.complete.mar
HILAL_UPDATE_MACOS_MAR_HASH=<sha512>
HILAL_UPDATE_MACOS_MAR_SIZE=<bytes>

HILAL_UPDATE_WINDOWS_MAR_URL=https://updates.example/hilal-windows.complete.mar
HILAL_UPDATE_WINDOWS_MAR_HASH=<sha512>
HILAL_UPDATE_WINDOWS_MAR_SIZE=<bytes>

HILAL_UPDATE_LINUX_MAR_URL=https://updates.example/hilal-linux.complete.mar
HILAL_UPDATE_LINUX_MAR_HASH=<sha512>
HILAL_UPDATE_LINUX_MAR_SIZE=<bytes>
```

Optional:

```bash
HILAL_UPDATE_BUILD_ID=20260524000000
HILAL_UPDATE_DETAILS_URL=https://hilal.gkdevstudio.org/#surumler
HILAL_UPDATE_MACOS_MAR_HASH_FUNCTION=sha512
HILAL_UPDATE_REPO=VastSea0/hilal-browser
HILAL_UPDATE_MANIFEST_ASSET=hilal-update-manifest.json
```

The website also exposes release metadata for the downloads UI:

```text
https://hilal.gkdevstudio.org/releases.json
```

The public release page renders a live release-notes timeline from that feed,
including publish date, tag, release notes, and the build artifact types present
in each GitHub Release.

## Production Signing Requirement

Do not ship production updates with unsigned MARs or with
`--enable-unverified-updates`. The updater must only accept MARs signed by the
release key embedded in the browser, and release artifacts should also be
platform-signed and notarized where applicable.

Before public release, finish these items:

- Replace the default non-Mozilla update signing certificates with Hilal-owned
  release certificates.
- Store signing keys outside the repo, ideally in CI/HSM-backed release
  infrastructure.
- Sign and publish complete MARs, platform installers, checksums, SBOM, and
  provenance attestations together.
- Add CI smoke tests that install an old packaged build, serve a test MAR, and
  verify that the browser reaches "Restart to Update".
