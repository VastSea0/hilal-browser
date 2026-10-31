# Contributing to Hilal Browser

Thanks for helping. Hilal is a small community project, so focused pull requests
and clear bug reports go a long way.

## Where things live

| Part | Directory | Docs |
| --- | --- | --- |
| Desktop browser (patches and overlays on Firefox ESR) | `changes/`, `manifest.toml` | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Android app (GeckoView, Jetpack Compose) | `android/` | [docs/MOBILE.md](docs/MOBILE.md) |
| Website | `www/` | [www/README.md](www/README.md) |
| Translations | `changes/browser/locales/`, `android/app/src/main/res/values-*` | [docs/TRANSLATING.md](docs/TRANSLATING.md) |

## Desktop changes

The desktop browser is not a fork. This repository holds patches and files that
are applied on top of a pinned Firefox ESR checkout in the gitignored `engine/`
directory.

1. Build the `hil` tool and set up `engine/` as described in
   [docs/WORKFLOW.md](docs/WORKFLOW.md).
2. Edit files inside `engine/` and build there. For a quicker first build while
   you are trying things out, use `HILAL_DEV_BUILD=1` (see
   [docs/BUILD-MACOS.md](docs/BUILD-MACOS.md)).
3. Run `./bin/hil refresh` to bring your edits back into `changes/`.
4. Check `git diff` so that the patch only contains your change, then commit in
   this repository, never in `engine/`.

Keep as close to upstream Firefox as possible. Prefer a small patch over copying
a whole upstream file, and do not add a feature that duplicates something
Firefox already does well.

## Android changes

```bash
cd android
./gradlew assembleDebug
```

Pull requests that touch `android/` are built on CI, and the debug APK is
attached to the workflow run.

## Pull requests

- One logical change per pull request and per commit, with a short subject line
  that says what the change does.
- Describe how you tested it. For UI changes, add a screenshot.
- If a change affects what data leaves the user's device, update the privacy
  policy (`www/public/privacy.html` and `www/src/components/PrivacyPage.tsx`)
  in the same pull request.
- Follow the upstream Mozilla style for the language you are working in. Run
  `./mach format` inside `engine/` for desktop code.
- No emoji in code, commit messages, or documentation.

If you use AI tools, you are responsible for every line you submit: read it,
test it, and make sure it matches the surrounding code.

## Reporting bugs and security issues

Open an issue with the bug report template. Report security vulnerabilities
privately as described in [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the
[Mozilla Public License 2.0](LICENSE).
