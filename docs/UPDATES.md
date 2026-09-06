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

Android keeps the updater disabled and uses platform package mechanisms.

Flatpak builds disable Firefox's built-in updater. Updates for
`org.gkdevstudio.Hilal` are delivered by Flatpak/Flathub.

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

Without signing variables, the script creates an unsigned MAR and prints a
production warning.

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
Firefox/Gecko version shipped in the build, for example `153.0a1`. Firefox sends
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
HILAL_UPDATE_FIREFOX_VERSION=153.0a1
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

### NSS Database & Certificate Setup

Create an NSS (Network Security Services) database containing the private
signing key. Overlay the public certificate DER files in the repository so the
browser build compiles them into the updater.

To generate a new primary/secondary update signing keypair locally:

1. **Initialize NSS Database**:
   Create a signing database outside version control:
   ```bash
   mkdir -p /path/to/signing-db
   engine/obj-aarch64-apple-darwin25.4.0/dist/bin/certutil -N -d sql:/path/to/signing-db --empty-password
   ```

2. **Generate Keypair & Certificate**:
   Generate a 4096-bit RSA self-signed update signing certificate:
   ```bash
   dd if=/dev/urandom of=noise.bin bs=2048 count=1
   engine/obj-aarch64-apple-darwin25.4.0/dist/bin/certutil -S -d sql:/path/to/signing-db \
     -n mar_sig \
     -s "CN=Hilal Update Primary" \
     -t "C,," \
     -x -g 4096 -v 120 \
     -z noise.bin
   ```

3. **Export Public Certificate**:
   ```bash
   engine/obj-aarch64-apple-darwin25.4.0/dist/bin/certutil -L -d sql:/path/to/signing-db -n mar_sig -r > release_primary.der
   ```

4. **Embed Certificate into Build**:
   Copy the exported certificate to the overlay directory:
   ```bash
   cp release_primary.der changes/toolkit/mozapps/update/updater/release_primary.der
   ```
   `./bin/hil apply` copies this file into the Firefox source tree. The build
   system compiles the certificate bytes into the updater's `primaryCertData`.

### Key Rotation Procedure

To rotate signing keys without breaking updates for existing users:

1. **Generate a New Keypair**:
   Generate a new certificate/key in a separate or the same NSS database, naming it `mar_sig_secondary`.
2. **Export and Overlay**:
   Export the new certificate as `release_secondary.der` and place it at:
   `changes/toolkit/mozapps/update/updater/release_secondary.der`
3. **Build and Ship Both Certs**:
   Release a browser version that trusts MARs signed by either key.
4. **Transition Signing**:
   After older builds update, sign MAR packages with `mar_sig_secondary`.
5. **Finalize Rotation**:
   In the next release cycle, promote `release_secondary.der` to
   `release_primary.der` and generate a new secondary certificate.

### CI/CD Secret Integration

To sign MAR packages in CI without checking private key database files into git:

1. **Package the NSS Database**:
   Compress the NSS database files (`cert9.db`, `key4.db`, `pkcs11.txt`):
   ```bash
   tar -czf signing-db.tar.gz -C /path/to/signing-db .
   ```

2. **Encode to Base64**:
   ```bash
   base64 -i signing-db.tar.gz -o signing-db.base64
   ```

3. **Configure GitHub Secrets**:
   Save `signing-db.base64` as a repository secret named
   `HILAL_SIGNING_DB_BASE64`.

4. **Restore Database in CI**:
   Add a GitHub Actions step:
   ```yaml
   - name: Restore Signing NSS Database
     run: |
       echo "${{ secrets.HILAL_SIGNING_DB_BASE64 }}" | base64 -d > signing-db.tar.gz
       mkdir -p /tmp/signing-db
       tar -xzf signing-db.tar.gz -C /tmp/signing-db
   ```

5. **Generate and Sign the Update MAR**:
   ```yaml
   - name: Create Signed Update MAR
     env:
       HILAL_SIGNMAR_NSS_DIR: /tmp/signing-db
       HILAL_SIGNMAR_CERT: mar_sig
     run: |
       scripts/make-full-update.sh 0.3.0
   ```
