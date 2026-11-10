# Roadmap

Hilal's promise is a stable, free and customizable browser. Trust comes before
features, so the order is: stay secure, reach people, then stand out.

## 0.4.0-alpha.3: trust

- [x] Move to Firefox ESR 153.7.0.
- [x] Check every day for a new ESR point release, test the bump in CI and open
      an issue (`.github/workflows/esr-watch.yml`).
- [x] Test in CI that the latest release updates itself to each new build
      through its own updater (`scripts/ci/update-test.py`).
- [x] Extreme privacy turns on fingerprinting resistance, checked in the UI
      smoke (#22).
- [x] Ship with a Google Safe Browsing key.
- [x] Material 3 Expressive across the browser: shell, menu, color panel,
      sidebar, new tab, settings, Firefox's panels, the Library window,
      Add-ons, passwords, error and info pages.
- [x] Colors from websites and automatic boosts.
- [x] Sidebar settings: tab layout, density and sidebar buttons.

## 0.4.0-alpha.4: reach

- [ ] Submit to Flathub as `io.github.VastSea0.Hilal`.
- [ ] AUR package, winget and Scoop manifests, Homebrew cask.
- [ ] Sign Windows builds through SignPath Foundation.

## 0.5: stand out

- [ ] Split view: two tabs side by side.
- [ ] More languages. Firefox's own translations are built in, so only
      Hilal's strings need translating.

## Always

- CI builds stay short. Expensive checks run in parallel with the other tests
  or only on releases, never in front of the build.
- Nothing costs money (see the Zero-Cost Rule in `AGENTS.md`).
