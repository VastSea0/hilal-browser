# Hilal Browser — Agent Instructions

This repository is a **patch and overlay layer** on top of upstream Firefox, not a fork. We stay as close to upstream as possible.

## Project Structure

There are two distinct trees:

1. **`hilal-browser/`** (this repo) — the source of truth. Small, text-only, version-controlled. Holds the declarative configs, patches, scripts, and docs.
2. **`hilal-browser/engine/`** — the full Firefox source checkout. **Gitignored** from this repo. It has its own git history pointing at `mozilla-firefox/firefox`.

```
hilal-browser/
├── changes/          # Unified patches (*.patch) and overlays mirroring the Firefox source layout
├── manifest.toml     # Centralized, declarative build manifest mapping all patches and overlays
├── upstream.lock     # Pinned upstream Firefox commit hash and metadata
├── scripts/          # Workflow wrappers and platform build scripts
├── bin/hil           # Compiled Rust patch manager utility
└── engine/           # (gitignored) full Firefox checkout
```

## Editing Source Code

**Always edit inside `engine/`**, then bring changes back into this repo.

```bash
# 1. Edit files inside engine/ directly
# 2. Build and test inside engine/
# 3. When ready, regenerate patches:
./bin/hil refresh
# 4. Review and commit the resulting changes in changes/
```

## The Core Operations

| Goal | Command |
|------|---------|
| Setup workspace (clone/checkout) | `./bin/hil setup` |
| Apply all patches + overlays | `./bin/hil apply` |
| Reset & force-apply patches | `./bin/hil apply --force` |
| Regenerate patches from edits | `./bin/hil refresh` |
| Show current workspace status | `./bin/hil status` |
| Verify upstream checksum | `./bin/hil verify` |
| Build on macOS | `scripts/build-macos.sh` |

## Patch Workflow

- Patches and overlays are declared in `manifest.toml` and applied in the exact sequence specified.
- Patches are located under `changes/` relative to their target path (e.g. `changes/browser/base/workspaces.patch`).
- Commit messages and headers at the top of patch files are automatically preserved when running `./bin/hil refresh`.

## Branding & Prefs Workflow

Branding and preferences are **overlays**, not patches:

- Edit files in `changes/` directly, OR
- Edit them inside `engine/` and run `./bin/hil refresh` to pull changes back.
- `./bin/hil apply` syncs overlays into the `engine/` tree.

## Build & Test

- CI build of one target: `scripts/ci/build.sh linux|macos|windows`
- Build: `scripts/build-macos.sh`
- Front-end only (faster): `scripts/build-macos.sh faster`
- C++/Rust only: `scripts/build-macos.sh binaries`
- Run: `(cd engine && ./mach run)`
- Tests: `(cd engine && ./mach test --auto)`
- Format modified files: `(cd engine && ./mach format)`

## Zero-Cost Rule

Hilal is built, tested, signed and shipped without spending money. The
maintainer has no Apple Developer account, no paid certificates and no
servers. Every proposal must keep it that way:

- Builds and tests run on free GitHub-hosted runners (the repo is public).
  macOS and Windows are cross-compiled on Linux, as Mozilla and Zen do.
- Downloads are hosted on GitHub Releases; the update endpoint runs on the
  Vercel free tier (`www/api/update.ts`).
- Updates are signed with self-made keys (`docs/UPDATES.md`).
- macOS builds are ad-hoc signed. Windows signing may only come from a free
  program such as SignPath Foundation.
- Do not add a dependency on a paid service, a self-hosted server or a
  machine the maintainer has to keep running.

Priority is Linux first (the open source community), then macOS and Windows,
but a change is only done when it works on all three.

## Testing Without a Local Machine

The maintainer cannot build or test on their own machines, so CI is the test
lab. `.github/workflows/ci.yml` builds every push to main for all three
platforms, launches each package on its own OS (Linux under X11 and Wayland)
and checks the chrome with `scripts/ci/ui-smoke.py`, which also saves
screenshots as artifacts. When you change browser chrome:

- Add or extend a check in `scripts/ci/ui-smoke.py` for what you changed.
- Look at the screenshots of the CI run (`gh run download <id> -n ui-smoke-<os>`)
  before saying a change works on an OS.
- To rerun only the tests against an earlier build, dispatch ci.yml with
  `reuse_build_run=<run id>`.
- Packages that pass are published as the `nightly` pre-release for human
  testers. Releases (`v*` tags) go through the same pipeline.

## Code Style

- **No emoji** in code, commits, or documentation.
- Comment only non-obvious logic; do not narrate code.
- Follow upstream Mozilla conventions for the language you're working in.

## Commit Rules

- Commit in **this repo**, not in `engine/`. The `engine/` directory is gitignored.
- Commit one logical change per commit with a short, descriptive subject line.
- Never commit the `engine/` directory or build artifacts.
- Review regenerated patches with `git diff` before committing.
- Do **not** append "Generated with Devin" or automated "Co-Authored-By" trailers to commits.

## If a Patch Fails to Apply

1. Run `./bin/hil apply --force` to reset and retry.
2. Or run `git apply --3way changes/<path>.patch` inside the `engine/` folder to resolve conflict markers, fix by hand, commit/amend the commit in `engine/`, and then run `./bin/hil refresh`.

## Searching the Firefox Tree

The `engine/` directory is a massive repository. Use `searchfox-cli` for efficient cross-reference searches instead of blind `rg` or `grep`:

```bash
searchfox-cli --define 'SomeClass::SomeMethod'
searchfox-cli --id SomeClass -l 100 --cpp
searchfox-cli --path browser -q 'some string'
```

Only use local `rg`/`grep` for searching files that have definitely changed locally.

## Important Notes

- Never submit patches to Phabricator or push to upstream without explicit user approval.
- Do not run slow commands like `./mach test` piped through `tail`/`grep`/`head`. Redirect to a temp file and read selectively.
