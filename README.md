# Hilal Browser

Hilal Browser is a Firefox-based browser. This repository is **not** a
fork of the Firefox source code — it is a small **patch and overlay
layer** on top of upstream
[mozilla-firefox/firefox](https://github.com/mozilla-firefox/firefox).

## Project history

Hilal Browser is the continuation of the project previously developed as
**Huma Browser**. The project has now been officially restarted and
reintroduced under the **Hilal Browser** name, with the current
repository, branding, defaults, and documentation reflecting that new
identity.

Everything Hilal-specific lives here:

| Folder | Purpose |
| --- | --- |
| `patches/` | Numbered, focused `.patch` files (unified diffs) applied to Firefox in `series` order. |
| `branding/` | Branding overlays. Each subdirectory is copied to `browser/branding/<name>/` in the Firefox tree. |
| `prefs/` | Optional preference / configuration overlays (path inside `prefs/` mirrors path inside Firefox). |
| `scripts/` | Helper scripts: setup, apply, refresh, upstream sync, build. |
| `docs/` | Workflow documentation. |

We deliberately do **not** vendor Firefox here, do not invent a custom
build system, and do not bulk-rename `Firefox` / `Mozilla` strings. The
goal is to stay as close to upstream as possible so we can keep
rebasing forward forever.

---

## Quick start (macOS)

```bash
# 0. Make sure you've completed Mozilla's one-time macOS setup:
#    https://firefox-source-docs.mozilla.org/setup/macos_build.html

# 1. Clone this repo
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 2. Clone Firefox into ./firefox (gitignored)
scripts/setup-firefox.sh

# 3. Apply all Hilal patches and overlays
scripts/apply.sh

# 4. Build (delegates to ./mach build inside ./firefox)
scripts/build-macos.sh

# 5. Run the browser
(cd firefox && ./mach run)
```

That's it. The Firefox source tree under `./firefox/` is **gitignored**
inside this repo, so you can't accidentally commit it.

---

## The five operations

| Goal | Command |
| --- | --- |
| Get a Firefox checkout next to this repo | `scripts/setup-firefox.sh` |
| Apply every Hilal patch + overlay onto Firefox | `scripts/apply.sh` |
| Regenerate patches from changes you made in `./firefox` | `scripts/refresh.sh` |
| Pull upstream Firefox and rebase Hilal on top | `scripts/sync-upstream.sh` |
| Build on macOS | `scripts/build-macos.sh` |

All scripts accept `-h` for usage. See `docs/WORKFLOW.md` for the full
flow including conflict resolution.

---

## How the layering works

### Patches
`patches/series` lists `.patch` files in the order they should be
applied. Each file is a plain unified diff (compatible with `git apply`
and `patch -p1`). `scripts/apply.sh` walks the series, skipping any
patch that's already in the tree.

Keep patches **small, focused, and one-purpose**. One feature per
patch, one bugfix per patch — same conventions that make a clean
Phabricator review.

### Branding & prefs overlays
Binary assets (icons, splash screens, etc.) make terrible patches.
Instead, anything under `branding/<name>/` is `rsync`'d directly into
`browser/branding/<name>/`. Anything under `prefs/` is copied to the
matching path in the Firefox tree. This keeps `patches/` text-only and
reviewable.

### Source tree layout
```
hilal-browser/              <- this repo
├── branding/hilal/         <- assets, mirrored into firefox/browser/branding/hilal/
├── patches/series         <- order of patch application
├── patches/*.patch        <- focused source-code patches
├── prefs/                 <- optional pref / config overlays
├── scripts/               <- workflow helpers
├── docs/                  <- detailed docs
└── firefox/               <- (gitignored) full Firefox checkout
```

---

## Documentation

- `docs/WORKFLOW.md` — full developer workflow, conflict resolution, when to patch vs overlay
- `docs/BUILD-MACOS.md` — macOS-specific build notes
- `docs/UPSTREAM-SYNC.md` — how to roll forward to a newer Firefox

---

## License

The Hilal branding assets in `branding/hilal/` are © Hilal Browser
contributors. The build glue, scripts, and patches in this repository
are released under the
[Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/2.0/) to
match Firefox.
