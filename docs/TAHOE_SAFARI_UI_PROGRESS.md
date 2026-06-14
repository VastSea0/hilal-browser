# Tahoe Safari Shell V1 Progress

## 2026-06-14

- Status: implementation and build validation complete.
- Decisions locked:
  - V1 ships as a Tahoe visual shell, not a full Safari layout clone.
  - `hilal.tahoe.enabled` defaults to `true`.
  - Hilal workspace rail remains in place.
  - Top horizontal Safari tab strip is deferred to V2.
- Completed tasks:
  - Add repo-visible plan and progress documents.
  - Add a pref-gated Tahoe CSS layer.
  - Add Hilal settings wiring for the Tahoe shell toggle.
  - Refresh patches from `engine/` after implementation.

## Validation Log

- Passed: `./bin/hil validate`.
- Passed: `scripts/build-macos.sh faster`.
- Skipped (disabled in build config): `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)`.
