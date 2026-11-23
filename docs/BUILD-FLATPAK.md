# Build Hilal for Flatpak

Hilal's Flatpak package is defined by `io.github.VastSea0.hilal-browser.yml` alongside
`flathub.json`. It repackages the CI-built Linux release tarball (following the
same model as Firefox and Zen on Flathub), installs the browser under
`/app/lib/hilal`, disables the built-in updater, and exports the `hilal`
command.

The Flatpak app id is:

```text
io.github.VastSea0.hilal-browser
```

## Prerequisites

Install Flatpak, Flatpak Builder, and the Flathub remote on Linux:

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user -y flathub org.flatpak.Builder
```

`flatpak-builder --install-deps-from=flathub` pulls `org.freedesktop.Platform//25.08`,
`org.freedesktop.Sdk//25.08`, and `org.mozilla.firefox.BaseApp//25.08` automatically.

## Local Build & Lint

Build directly from the published release manifest and export an OSTree repo:

```bash
flatpak run --user org.flatpak.Builder --user --install-deps-from=flathub --install --force-clean \
  --mirror-screenshots-url=https://dl.flathub.org/media \
  flatpak-build io.github.VastSea0.hilal-browser.yml
```

Run Flathub's official linter against both the manifest and the builddir:

```bash
flatpak run --user --command=flatpak-builder-lint org.flatpak.Builder manifest io.github.VastSea0.hilal-browser.yml
flatpak run --user --command=flatpak-builder-lint org.flatpak.Builder builddir flatpak-build
```

Run the installed build:

```bash
flatpak run --user io.github.VastSea0.hilal-browser about:blank
```

## CI Verification

- `.github/workflows/ci.yml` (`test-flatpak`) builds the Flatpak from the newly
  built Linux tarball, runs `flatpak-builder-lint` on the manifest and exported
  repo, and executes `scripts/ci/ui-smoke.py` inside the sandbox.
- `.github/workflows/packaging-test.yml` (`flathub`) builds directly from the
  published `io.github.VastSea0.hilal-browser.yml`, runs `flatpak-builder-lint`, and
  verifies the installed sandboxed browser starts cleanly with updates disabled.

## Flathub Submission Checklist

Before opening the `flathub/flathub` PR on the `new-pr` branch:

- Copy `io.github.VastSea0.hilal-browser.yml` and `flathub.json` into the PR branch.
- Confirm both `flatpak-builder-lint manifest` and `flatpak-builder-lint repo`
  pass cleanly in CI (`packaging-test.yml` / `test-flatpak`).
- Confirm `x-checker-data` resolves the latest desktop `v*` release (ignoring
  `android-v*` and `nightly` releases).
- Verify ownership of `io.github.VastSea0.hilal-browser` on Flathub via GitHub sign-in
  once the PR is merged.

Do not automate the Flathub pull request from this repo. A maintainer should
open and review it.

## Update Policy

Flatpak builds disable Firefox's built-in application updater by setting
`DisableAppUpdate: true` and removing `AppUpdateURL` in
`/app/lib/hilal/distribution/policies.json`. Updates are delivered by Flathub.
