# Workflow

This document walks through day-to-day work on Hilal Browser.

## Mental Model

There are exactly two trees:

1. **`hilal-browser/`** (this repo) — small, text-only, version-controlled. Holds the declarative configurations, patches, assets, scripts, and docs.
2. **`hilal-browser/engine/`** — the full Firefox source checkout. Gitignored from this repo. It has its own git history pointing at `mozilla-firefox/firefox`.

The Hilal changes live in `hilal-browser/` as the source of truth.
Whenever you want to build, you "stamp" them onto `engine/` with `./bin/hil apply`. Whenever you change source code in `engine/`, you commit your changes in `engine/` and then bring them back with `./bin/hil refresh`.

```
                    ./bin/hil apply
hilal-browser/  ─────────────►  engine/         (build & run from here)
   ▲                              │
   │           ./bin/hil refresh  │
   └──────────────────────────────┘
```

## First-time Setup

```bash
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser
./bin/hil setup            # Clones Firefox into ./engine and checks out the pinned commit
./bin/hil apply            # Stamps Hilal changes onto ./engine
scripts/build-macos.sh      # Delegates to ./mach build
```

`upstream.lock` pins the checkout to the exact commit hash. Run `./bin/hil setup` again whenever that file changes. `./bin/hil apply` also checks the pin before applying patches.

## Editing Source Code

Edit files inside `engine/` directly. Use `./mach build`, `./mach run`, `./mach test --auto`, etc.

When a change is ready to be synchronized back to the repository:

1. Stage and commit (or amend) your change in the `engine/` Git history corresponding to the target patch sequence.
2. From the root directory, run:
```bash
./bin/hil refresh
```

This compares the commit stack in the `engine/` tree against `upstream-base`, maps the changes back to the entries defined in `manifest.toml`, and regenerates the individual patch files (e.g. `changes/browser/transparent-macos-chrome.patch`) while cleanly preserving any description headers.

## Branding, Prefs & Locale Changes

Branding, preference configurations, and locales are **overlays**, not patches:

- Edit them in `changes/` directly (e.g., real PNGs/ICOs/Fluent files), and run `./bin/hil apply` to push them to the `engine/` tree.
- Or edit them inside `engine/` and run `./bin/hil refresh` to sync the changes back.

Same model for preferences and locales: a file at `changes/browser/app/profile/firefox.js` is copied directly to `engine/browser/app/profile/firefox.js` on apply. Custom Turkish translations under `changes/browser/locales/tr/` are merged into the target locale files.

## When a Patch Fails to Apply

If a patch fails to apply, `./bin/hil apply` will halt and print which step failed. First, reset and make sure you are on the pristine base:

```bash
./bin/hil apply --force
```

If it still fails, the options are:

1. **Manual Git Conflict Resolution**:
   Run `git apply --3way ../changes/<failing-patch>.patch` inside the `engine/` directory to get conflict markers, resolve them by hand, commit/amend the commit in the `engine/` Git history, and run `./bin/hil refresh` from the root directory.
2. **Drop the patch**:
   If upstream Firefox has incorporated the change, remove the patch file from `changes/` and delete its entry from `manifest.toml`.

## Conventions

- Patch files use plain unified diff format without noisy `index` lines.
- The sequencing of all patches and overlays is declared in `manifest.toml`.
- Commit one logical change per commit in this repository (never commit the `engine/` directory).
