# Hilal Application Updates

Hilal uses Firefox's built-in application updater for desktop builds. The
client-side plumbing is intentionally small:

- `mozconfigs/base` enables `MOZ_UPDATER` for desktop builds.
- `patches/0014-hilal-update-policy.patch` packages
  `distribution/policies.json` with an `AppUpdateURL` pointing at Hilal update
  infrastructure.
- `scripts/make-full-update.sh` creates a complete MAR from a packaged build.

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

## Publish Update XML

The bundled policy requests:

```text
https://updates.hilal.gkdevstudio.org/update/6/%PRODUCT%/%VERSION%/%BUILD_ID%/%BUILD_TARGET%/%LOCALE%/%CHANNEL%/%OS_VERSION%/%SYSTEM_CAPABILITIES%/%DISTRIBUTION%/%DISTRIBUTION_VERSION%/update.xml
```

The update server must return Firefox update XML with a complete MAR patch for
the requesting platform, locale, channel, and version. A foreground check adds
`?force=1`.

The `www` app now implements this route directly:

```text
www/app/update/6/[...segments]/route.ts
```

When no MAR is configured, it returns an empty `<updates>` document so clients
do not attempt a broken update. To serve a real complete MAR, configure these
environment variables for each platform you publish:

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
HILAL_UPDATE_DETAILS_URL=https://hilal.gkdevstudio.org/en#releases
HILAL_UPDATE_MACOS_MAR_HASH_FUNCTION=sha512
```

The website also exposes release metadata for the downloads UI:

```text
https://hilal.gkdevstudio.org/releases.json
```

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
