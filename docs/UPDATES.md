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
