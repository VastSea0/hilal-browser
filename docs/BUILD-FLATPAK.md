# Build Hilal for Flatpak

Hilal's Flatpak package is defined by `org.gkdevstudio.Hilal.yml`. It builds
Firefox from the pinned upstream commit in `upstream.lock`, applies the Hilal
patch and overlay layer, installs the browser under `/app/lib/firefox`, and
exports the `hilal` command.

The Flatpak app id is:

```text
org.gkdevstudio.Hilal
```

## Current Flathub Status

The packaging is intentionally present before the first stable Flathub
submission. The current browser version is `0.2.0-alpha.4`, so stable Flathub
submission is blocked until a stable tag is cut and the manifest source tag is
updated.

Run the readiness check before opening a Flathub PR:

```bash
scripts/build-flatpak.sh check-ready
```

It must fail while the manifest or displayed browser version contains alpha,
beta, nightly, or dev release markers.

## Prerequisites

Install Flatpak, Flatpak Builder, and the Flathub remote. On Linux:

```bash
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub org.flatpak.Builder
flatpak install flathub org.mozilla.firefox.BaseApp//25.08
flatpak install flathub org.freedesktop.Sdk//25.08
flatpak install flathub org.freedesktop.Sdk.Extension.llvm21//25.08
flatpak install flathub org.freedesktop.Sdk.Extension.node24//25.08
flatpak install flathub org.freedesktop.Sdk.Extension.rust-stable//25.08
```

## Local Build

For local development, use the helper script. It rewrites the Hilal source block
in the manifest to use the current working tree, while keeping the pinned
Firefox and uBlock sources intact.

```bash
scripts/build-flatpak.sh build
```

Install into the user Flatpak installation:

```bash
scripts/build-flatpak.sh install
```

Run the installed build:

```bash
scripts/build-flatpak.sh run about:blank
```

Export a local OSTree repo:

```bash
scripts/build-flatpak.sh repo
flatpak --user --no-gpg-verify remote-add hilal-local repo
flatpak --user install hilal-local org.gkdevstudio.Hilal
```

## Linting

Run the available manifest, desktop, AppStream, and repo checks:

```bash
scripts/build-flatpak.sh lint
```

If the standalone tools are not installed, the script tries the
`org.flatpak.Builder` Flatpak for `flatpak-builder-lint` and skips tools that
are missing.

## Flathub Submission Checklist

Before opening a human-authored Flathub PR:

- Cut a stable Hilal release tag.
- Update `org.gkdevstudio.Hilal.yml` to point at the stable Hilal tag and commit.
- Update `flatpak/org.gkdevstudio.Hilal.metainfo.xml` release data and screenshot URLs.
- Run `scripts/build-flatpak.sh check-ready`.
- Run `scripts/build-flatpak.sh lint`.
- Build and smoke-test both `x86_64` and `aarch64`.
- Publish the Flathub verification token under `https://gkdevstudio.org/.well-known/org.flathub.VerifiedApps.txt` when Flathub requests it.

Do not automate the Flathub pull request from this repo. The submission should
be opened and reviewed by a human maintainer.

## Update Policy

Flatpak builds disable Firefox's built-in application updater with
`mozconfigs/flatpak` and a Flatpak-specific enterprise policy. Updates for this
package are delivered by Flathub.

The bundled uBlock Origin XPI is checksum-pinned in the manifest. Its source
repository is also included in the manifest and its GPL license is installed
into `/app/share/licenses/org.gkdevstudio.Hilal/uBlock-Origin/`.
