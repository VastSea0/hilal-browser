# Firefox-UI-Fix (vendored)

Hilal Browser ships a subset of [Firefox-UI-Fix](https://github.com/black7375/Firefox-UI-Fix)
(Lepton) inside browser chrome. The compiled stylesheet lives at
`prefs/browser/themes/shared/firefox-ui-fix.css`. Hilal-specific rules are in
`prefs/browser/themes/shared/hilal-ui-overrides.css`.

## License

Mozilla Public License 2.0. See `LICENSE` in this directory.

## Updating

From the repo root:

```bash
scripts/sync-firefox-ui-fix.sh
```

Review the diff, update `SOURCE`, run `scripts/apply.sh --force`, and test UI.
