# Workflow

Day-to-day work on Hilal Browser.

## Mental Model

There are exactly two trees:

1. **`hilal-browser/`** (this repo) — small, text-only, version-controlled. Holds the declarative configurations, patches, assets, scripts, and docs.
2. **`hilal-browser/engine/`** — the full Firefox source checkout. Gitignored from this repo. It has its own git history pointing at `mozilla-firefox/firefox`.

The Hilal changes live in `hilal-browser/`. Apply them to `engine/` with
`./bin/hil apply`. After source edits in `engine/`, commit there and run
`./bin/hil refresh` from this repo.

```
                    ./bin/hil apply
hilal-browser/  ─────────────►  engine/         (build & run from here)
   ▲                              │
   │           ./bin/hil refresh  │
   └──────────────────────────────┘
```

## First-time Setup

Because the `hil` patch manager is a custom Rust helper tool, it is not distributed as pre-compiled binaries and must be compiled from source first:

```bash
# 1. Clone repository
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser

# 2. Build the hil manager tool (requires Rust compiler)
cargo build --release --manifest-path hil/Cargo.toml
mkdir -p bin
cp hil/target/release/hil bin/hil  # on Windows: copy hil\target\release\hil.exe bin\hil.exe

# 3. Setup workspace and apply patches
./bin/hil setup            # Clones Firefox into ./engine and checks out the pinned commit
./bin/hil apply            # Stamps Hilal changes onto ./engine

# 4. Compile the browser
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

This compares the `engine/` commit stack against `upstream-base`, maps changes
to `manifest.toml`, and regenerates patch files such as
`changes/browser/transparent-macos-chrome.patch`.

## Branding, Prefs & Locale Changes

Branding, preference configurations, and locales are **overlays**, not patches:

- Edit them in `changes/` directly (e.g., real PNGs/ICOs/Fluent files), and run `./bin/hil apply` to push them to the `engine/` tree.
- Or edit them inside `engine/` and run `./bin/hil refresh` to sync the changes back.

Preferences and locales use the same copy model. A file at
`changes/browser/app/profile/firefox.js` is copied to
`engine/browser/app/profile/firefox.js` on apply. Turkish strings under
`changes/browser/locales/tr/` are merged into the target locale files.

## When a Patch Fails to Apply

If a patch fails to apply, `./bin/hil apply` halts and prints the failed step.
Reset to the pinned base:

```bash
./bin/hil apply --force
```

If it still fails:

1. **Manual Git Conflict Resolution**:
   Run `git apply --3way ../changes/<failing-patch>.patch` inside the `engine/` directory to get conflict markers, resolve them by hand, commit/amend the commit in the `engine/` Git history, and run `./bin/hil refresh` from the root directory.
2. **Drop the patch**:
   If upstream Firefox has incorporated the change, remove the patch file from `changes/` and delete its entry from `manifest.toml`.

## Conventions

- Patch files use plain unified diff format without noisy `index` lines.
- The sequencing of all patches and overlays is declared in `manifest.toml`.
- Commit one logical change per commit in this repository (never commit the `engine/` directory).
