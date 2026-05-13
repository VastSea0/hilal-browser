# Hilal Browser — Agent Instructions

This repository is a **patch and overlay layer** on top of upstream Firefox, not a fork. We stay as close to upstream as possible.

## Project Structure

There are two distinct trees:

1. **`hilal-browser/`** (this repo) — the source of truth. Small, text-only, version-controlled. Holds patches, branding assets, scripts, and docs.
2. **`hilal-browser/firefox/`** — the full Firefox source checkout. **Gitignored** from this repo. It has its own git history pointing at `mozilla-firefox/firefox`.

```
hilal-browser/
├── patches/          # Numbered unified-diff patches applied in series order
├── patches/series     # Order of patch application
├── branding/hilal/    # Branding assets (PNG, ICO, etc.) rsync'd into Firefox
├── prefs/             # Preference/config overlays (mirrored path into Firefox)
├── scripts/           # Workflow helpers (apply, refresh, build, sync)
├── docs/              # Workflow and build documentation
└── firefox/           # (gitignored) full Firefox checkout
```

## Editing Source Code

**Always edit inside `firefox/`**, then bring changes back into this repo.

```bash
# 1. Edit files inside firefox/ directly
# 2. Build and test inside firefox/
# 3. When ready, regenerate patches:
scripts/refresh.sh
# 4. Review and commit the resulting changes in patches/ (and branding/ or prefs/ if changed)
```

## The Five Core Operations

| Goal | Command |
|------|---------|
| Clone Firefox into `./firefox` | `scripts/setup-firefox.sh` |
| Apply all Hilal patches + overlays onto Firefox | `scripts/apply.sh` |
| Regenerate patches from edits in `./firefox` | `scripts/refresh.sh` |
| Pull upstream Firefox and rebase Hilal on top | `scripts/sync-upstream.sh` |
| Build on macOS | `scripts/build-macos.sh` |

All scripts accept `-h` for usage.

## Patch Workflow

- Patches are **small, focused, and one-purpose**. One feature per patch, one bugfix per patch.
- Patch filenames: `<NNNN>-<kebab-case-summary>.patch`
- `patches/series` controls application order. Update it when adding/removing patches.
- Use `scripts/refresh.sh --from-commits <range>` to export one patch per commit when working with multiple commits in the Firefox tree.

## Branding & Prefs Workflow

Branding and prefs are **overlays**, not patches:

- Edit files in `branding/hilal/` or `prefs/` directly, OR
- Edit them inside `firefox/` and run `scripts/refresh.sh` to pull changes back.
- `scripts/apply.sh` syncs overlays into the Firefox tree.

## Build & Test

- Build: `scripts/build-macos.sh`
- Front-end only (faster): `scripts/build-macos.sh faster`
- C++/Rust only: `scripts/build-macos.sh binaries`
- Run: `(cd firefox && ./mach run)`
- Tests: `(cd firefox && ./mach test --auto)`
- Format modified files: `(cd firefox && ./mach format)`

## Code Style

- **No emoji** in code, commits, or documentation.
- Limit comments to a strict minimum. Do not add explanatory comments for obvious code. Only comment non-trivial logic, complex function arguments, or class member purposes.
- Do not remove existing comments unless directly related to your change.
- Follow upstream Mozilla conventions for the language you're working in.

## Commit Rules

- Commit in **this repo**, not in `firefox/`. The `firefox/` directory is gitignored.
- Commit one logical change per commit with a short, descriptive subject line.
- Never commit the `firefox/` directory or build artifacts.
- Review regenerated patches with `git diff` before committing.
- Do **not** append "Generated with Devin" or automated "Co-Authored-By" trailers to commits.

## If a Patch Fails to Apply

Usually means upstream Firefox changed the touched code:

1. `scripts/apply.sh --force` to reset and retry
2. Or `cd firefox && git apply --3way patches/<file>` for conflict markers, fix by hand, then `scripts/refresh.sh`
3. Or drop the patch if upstream incorporated the change

See `docs/WORKFLOW.md` for full conflict resolution guidance.

## Searching the Firefox Tree

The `firefox/` directory is a massive repository. Use `searchfox-cli` for efficient cross-reference searches instead of blind `rg` or `grep`:

```bash
searchfox-cli --define 'SomeClass::SomeMethod'
searchfox-cli --id SomeClass -l 100 --cpp
searchfox-cli --path browser -q 'some string'
```

Only use local `rg`/`grep` for searching files that have definitely changed locally.

## Important Notes

- Never submit patches to Phabricator or push to upstream without explicit user approval.
- Do not run slow commands like `./mach test` piped through `tail`/`grep`/`head`. Redirect to a temp file and read selectively.
- The existing `firefox/AGENTS.md` and `firefox/CLAUDE.md` are for working **inside** the Firefox tree itself. These root-level files govern the Hilal overlay workflow.
