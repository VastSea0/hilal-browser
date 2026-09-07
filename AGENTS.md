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

- Build: `scripts/build-macos.sh`
- Front-end only (faster): `scripts/build-macos.sh faster`
- C++/Rust only: `scripts/build-macos.sh binaries`
- Run: `(cd engine && ./mach run)`
- Tests: `(cd engine && ./mach test --auto)`
- Format modified files: `(cd engine && ./mach format)`

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

## Material 3 Expressive UI — Design System & Implementation Rules

All user interfaces in Hilal Browser—including the website (`www/`), browser chrome (`chrome://`), `about:` pages (`about:welcome`, `about:newtab`, `about:preferences`), modals, and internal tools—MUST strictly follow the **Material 3 Expressive (M3E)** design system.

See [docs/MATERIAL-3-EXPRESSIVE.md](docs/MATERIAL-3-EXPRESSIVE.md) for full token tables, component anatomy, and guidelines.

### Mandatory Rules:
1. **Brand Anchor:** Official seed color is Google / Hilal Blue (`#0b57d0` light, `#a8c7fa` dark). Never alter this primary brand color.
2. **Solid Surfaces Only:** No glassmorphism, no `backdrop-blur` on navbars or menus. Use opaque tonal surfaces (`#ffffff` light, `#1e2025` dark).
3. **Breathing Room & Padding:** Elements must never be squished.
   - Badges/chips must have explicit padding (minimum `px-3.5 py-1 rounded-full text-xs font-semibold`).
   - Buttons must be pill-shaped (`rounded-full`) with comfortable padding (`px-5 py-2.5`) and icons (`gap-2.5`). Sharp 90-degree box buttons are forbidden.
4. **Modal Container Sizing:** Modals and dialogs on desktop must NEVER be squeezed into `max-w-lg` (512px). Use `max-w-2xl` (672px) or `max-w-3xl` (768px) with two-line metadata so filenames/build targets are never abruptly truncated.
5. **Google Material Symbols Only:** Use ONLY Google Material Symbols Outlined with ligature format (`<i>icon_name</i>`). No mixed icon libraries. Ensure local `.woff2` font loading to avoid FOUT.
6. **Beer CSS & Tailwind Isolation:** Prevent Beer CSS `body.dark` class pollution or `box-sizing: content-box` from breaking Tailwind resets.
7. **Visual Screenshot Verification:** Never assume CSS changes work by code inspection alone. Always verify visually with headless Chrome screenshots in both Light and Dark modes before finalizing work.
