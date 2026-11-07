# Hilal Application Updates

Hilal uses Firefox's built-in application updater for desktop builds:

- `mozconfigs/base` enables `MOZ_UPDATER` for desktop builds.
- `changes/browser/app/distribution/update-policy.patch` packages
  `distribution/policies.json` with an `AppUpdateURL` pointing at Hilal update
  infrastructure.
- `scripts/make-full-update.sh` creates a complete MAR from a packaged build.
- `scripts/generate-update-manifest.mjs` records MAR URL, sha512, size,
  channel, build ID, and version metadata for GitHub Releases.

Release gating for update metadata, packaged browser smoke, and manual checks is
tracked separately in `docs/STABLE-READINESS.md`.

Android keeps the updater disabled and uses platform package mechanisms for the
app itself. Data, site fixes and notices reach Android without an APK through
live updates (`docs/ANDROID-LIVE-UPDATES.md`).

Flatpak builds disable Firefox's built-in updater. Updates for
`io.github.VastSea0.Hilal` are delivered by Flatpak/Flathub.

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

For production releases, sign the MAR during creation with the PEM private key
whose certificate is compiled into the updater. Signing uses Mozilla's
build-mar (`pip install mar`), so it works on Linux for macOS and Windows
cross builds too:

```bash
HILAL_MAR_SIGNING_KEY=/secure/path/primary.key.pem \
HILAL_BUILD_MAR="$(command -v mar)" \
scripts/make-full-update.sh 0.5.0
```

The script verifies the signed MAR against
`changes/toolkit/mozapps/update/updater/release_primary.der` and fails if the
key does not match. Unsigned MARs need `--allow-unsigned` and are only for
local testing.

## Publish Update XML

The bundled policy requests:

```text
https://hilal-browser.vercel.app/update/6/%PRODUCT%/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%SYSTEM_CAPABILITIES%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/update.xml
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
document. There are two supported metadata sources.

### Preferred: GitHub Release Manifest

Upload the complete MAR files to the GitHub Release, then generate and upload a
manifest asset named `hilal-update-manifest.json`:

```bash
eval "$(scripts/release-env.mjs --tag v0.3.0 --firefox-src engine --require-firefox-version)"

scripts/generate-update-manifest.mjs \
  --version "$tag" \
  --display-version "$display_version" \
  --app-version "$firefox_app_version" \
  --channel "$channel" \
  --build-id 20260525000000 \
  --mar macos-arm64="dist/$macos_arm64_mar" \
  --mar-url macos-arm64="https://github.com/VastSea0/hilal-browser/releases/download/$tag/$macos_arm64_mar"

gh release upload "$tag" \
  "dist/$macos_arm64_mar" \
  "dist/$update_manifest"
```

The update endpoint fetches the latest GitHub Release, reads the manifest asset,
selects the correct MAR for the request's `BUILD_TARGET`, verifies channel and
metadata fields, and then returns Firefox-compatible update XML.

Alpha, beta, and release-candidate tags are GitHub prereleases. Set
`HILAL_UPDATE_INCLUDE_PRERELEASES=1` only for channels that should receive those
builds.

`--version` is the Hilal release shown to users. `--app-version` must be the
Firefox/Gecko version shipped in the build, for example `153.6.0`. Firefox sends
that app version in update requests, so using the Hilal release value here can
make a build offer an update to itself.

Required manifest fields for every platform:

- `platform`: `macos-arm64`, `macos-x86_64`, `linux-x86_64`,
  `linux-arm64`, `windows-x86_64`, or `windows-arm64`
- `url`: HTTPS URL for the complete MAR, normally the GitHub Release asset URL
- `hashFunction`: `sha512`
- `hashValue`: 128-character sha512 of the final signed MAR
- `size`: byte size of the final signed MAR
- `buildID`: 14-digit Firefox build ID
- `appVersion`: Firefox/Gecko app version, not the Hilal release version

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
HILAL_UPDATE_FIREFOX_VERSION=153.6.0
HILAL_UPDATE_DETAILS_URL=https://hilal-browser.vercel.app/#surumler
HILAL_UPDATE_MACOS_MAR_HASH_FUNCTION=sha512
HILAL_UPDATE_REPO=VastSea0/hilal-browser
HILAL_UPDATE_MANIFEST_ASSET=hilal-update-manifest.json
```

The website also exposes release metadata for the downloads UI:

```text
https://hilal-browser.vercel.app/releases.json
```

The public release page renders a live release-notes timeline from that feed,
including publish date, tag, release notes, and the build artifact types present
in each GitHub Release.

## Production Signing

Do not ship production updates with unsigned MARs or with
`--enable-unverified-updates`. The browser's `updater` binary accepts MARs
signed by a private key whose public certificate is compiled into the browser.

### Keys and Certificates

The current keys were created on 2026-11-04 with OpenSSL (RSA 4096, SHA-384
signatures). The private keys are not in git; the maintainer keeps them in a
backup outside the repository, and the primary key is the GitHub Actions secret
`HILAL_MAR_SIGNING_KEY`. Losing the primary key means installed browsers can
only be updated by a manual reinstall, so keep more than one copy.

To create a new key pair (for example during rotation):

```bash
openssl genrsa -out secondary.key.pem 4096
openssl req -new -x509 -key secondary.key.pem -sha384 -days 3650 \
  -subj "/CN=Hilal Update Secondary" -outform DER -out release_secondary.der
cp release_secondary.der changes/toolkit/mozapps/update/updater/
```

`./bin/hil apply` copies the certificates into the Firefox tree and the build
compiles them into the updater, which accepts a MAR signed by either one.

### Key Rotation Procedure

1. Ship a release whose updater trusts both the current primary and a new
   secondary certificate.
2. Once users are on that release, sign MARs with the secondary key.
3. In a later release, promote the secondary certificate to
   `release_primary.der` and add a new secondary.

### CI Secret

Store the PEM text of the primary private key as the repository secret
`HILAL_MAR_SIGNING_KEY`:

```bash
gh secret set HILAL_MAR_SIGNING_KEY < primary.key.pem
```

The CI workflow writes it to a private temporary file, makes and verifies the
MAR for each platform, and deletes the file. Without the secret, builds still
pass but no signed MAR is made.
