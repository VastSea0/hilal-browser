# Building Hüma Browser on macOS

This is a short addendum to Mozilla's official guide:
<https://firefox-source-docs.mozilla.org/setup/macos_build.html>

If you haven't done it yet, bootstrap your machine **once**:

```bash
curl -L https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py -O
python3 bootstrap.py
```

That installs Xcode CLT, the build sysroot, `mozbuild`/`mach`
dependencies, `cargo`, and `cbindgen`. It only needs to run once per
machine.

## Building Hüma

From the repo root:

```bash
# One-time: fetch Firefox into ./firefox
scripts/setup-firefox.sh

# Apply patches + branding overlays
scripts/apply.sh

# Full build (10-40 minutes on first run)
scripts/build-macos.sh

# Run
(cd firefox && ./mach run)
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
firefox/obj-aarch64-apple-darwin*/dist/Nightly.app
```

The bundle name is `Nightly.app` because we keep the upstream
`MOZ_APP_DISPLAYNAME`. The CFBundleIdentifier reflects our
distribution id (`org.huma`) thanks to the patch in
`patches/0001-huma-branding-defaults.patch`.

## Code signing

Local development builds are unsigned. macOS Gatekeeper may complain
the first time you launch from Finder; right-click → Open works around
it, or run via `./mach run`. Production signing/notarization is out of
scope for this repo.

## Common issues

**`mozconfig` not found / weird defaults.** `./mach` doesn't require a
`mozconfig`. If you want one, drop it inside `firefox/` (gitignored by
its own tree). Don't add it here.

**Object directory mismatch.** Different macOS arches use different
`obj-*` paths. `./mach` picks correctly; if you've swapped Macs, run
`./mach clobber` inside `firefox/`.

**Bootstrap re-runs.** If `./mach build` complains about a missing
`bootstrap`ed tool, rerun `./mach bootstrap` (this is the in-tree
helper, distinct from the one-time `bootstrap.py` above).

**Big rebuilds after `scripts/apply.sh --force`.** Force-apply resets
the tree, which usually invalidates the build cache. Expect a slow next
build.
