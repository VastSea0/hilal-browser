# Workflow

This document walks through day-to-day work on Hilal Browser.

## Mental model

There are exactly two trees:

1. **`hilal-browser/`** (this repo) — small, text-only, version-controlled. Holds patches, branding, scripts, docs.
2. **`hilal-browser/firefox/`** — the Firefox source checkout. Gitignored from this repo. It has its own git history pointing at `mozilla-firefox/firefox`.

The Hilal changes live in `hilal-browser/` as the source of truth.
Whenever you want to build, you "stamp" them onto `firefox/` with
`scripts/apply.sh`. Whenever you change source code in `firefox/`,
you bring the changes back with `scripts/refresh.sh`.

```
                    apply.sh
hilal-browser/  ─────────────►  firefox/         (build & run from here)
   ▲                              │
   │           refresh.sh         │
   └──────────────────────────────┘
```

## First-time setup

```bash
git clone https://github.com/VastSea0/hilal-browser.git
cd hilal-browser
scripts/setup-firefox.sh    # clones Firefox into ./firefox
scripts/apply.sh            # stamps Hilal changes onto ./firefox
scripts/build-macos.sh      # delegates to ./mach build
```

You only need `setup-firefox.sh` once. After that, the `firefox/`
directory is yours — it's a normal Mozilla checkout with its own
`./mach` and its own git history.

## Editing source code

Edit files inside `firefox/` directly. Use `./mach build`, `./mach
run`, `./mach test --auto`, etc. as documented at
<https://firefox-source-docs.mozilla.org>.

When the change is ready to ship in Hilal:

```bash
scripts/refresh.sh
```

This compares the current Firefox tree against `HEAD` (the upstream
revision you started from), excludes overlay-managed paths (branding,
prefs), and writes the resulting diff into
`patches/0001-hilal-local-changes.patch`. Review with `git diff`, then
commit.

### Splitting into multiple focused patches

The single-patch refresh is fine for prototyping, but for review-ready
work prefer **commit-per-feature** in the Firefox tree:

```bash
cd firefox
git checkout -b hilal/main
# ... make change ...
git add -p
git commit -m "Hilal: enable foo by default"
# ... make next change ...
git commit -m "Hilal: change tab strip color"
```

Then export every commit as its own patch:

```bash
cd ..
scripts/refresh.sh --from-commits origin/main..hilal/main
```

This regenerates `patches/*.patch` and `patches/series` so each
commit becomes one numbered patch (`0001-...patch`, `0002-...patch`,
etc.). Commits stay reviewable; series stays ordered.

## Branding & prefs changes

Branding files are NOT patches. Either:

- Edit them in `branding/hilal/` directly (they're real PNGs/ICOs/etc.) and run `scripts/apply.sh` to push to Firefox. Then build.
- Or edit them inside `firefox/browser/branding/hilal/` and run `scripts/refresh.sh` to pull back.

Same model for `prefs/`: a file at `prefs/browser/app/profile/firefox.js`
would be copied to `firefox/browser/app/profile/firefox.js` on apply.

## When a patch fails to apply

This usually means upstream Firefox changed the code the patch was
touching. Options, in order of preference:

1. **Refresh against current upstream**
   ```bash
   cd firefox && git reset --hard origin/main
   # apply remaining patches manually (or use --3way)
   # edit the conflicting file by hand to make the Hilal change work
   cd ..
   scripts/refresh.sh
   ```
2. **3-way apply** — try `git apply --3way patches/<file>` inside `firefox/` to get conflict markers, fix by hand, then `scripts/refresh.sh`.
3. **Drop the patch** if upstream incorporated the change or made it obsolete; delete the entry from `patches/series` and the file.

## Conventions

- Patches use plain unified diff format. We do NOT include `index <hash>..<hash>` lines because they're tied to specific blobs and become noisy across upstream updates.
- Patch filenames: `<NNNN>-<kebab-case-summary>.patch`. NNNN is just for ordering.
- Branding assets are case-sensitive; the directory name `branding/hilal/` must match the value of `MOZ_BRANDING_DIRECTORY` set in patch 0001.
- Commit one logical change per commit, with a short subject line. The same advice from `AGENTS.md` applies: be sparing with comments, follow upstream conventions.

## Common one-liners

```bash
# See current source-tree state vs upstream
(cd firefox && git status && git diff --stat)

# Show what apply.sh will sync (branding only)
diff -r branding/hilal firefox/browser/branding/hilal

# Reset Firefox tree to a clean upstream + Hilal state
scripts/apply.sh --force

# Roll forward to latest upstream
scripts/sync-upstream.sh
```
