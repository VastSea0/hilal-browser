# Tahoe Safari Shell V1 Progress

## 2026-06-14

- Status: implementation and build validation complete.
- Decisions locked:
  - V1 ships as a Tahoe visual shell, not a full Safari layout clone.
  - `hilal.tahoe.enabled` defaults to `true`.
  - Hilal workspace/tab architecture remains in place.
  - Tahoe mode may hide the visible workspace rail when Safari parity is the stronger product goal.
- Completed tasks:
  - Add repo-visible plan and progress documents.
  - Add a pref-gated Tahoe CSS layer.
  - Add Hilal settings wiring for the Tahoe shell toggle.
  - Refresh patches from `engine/` after implementation.

## Validation Log

- Passed: `./bin/hil validate`.
- Passed: `scripts/build-macos.sh faster`.
- Skipped (disabled in build config): `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)`.

## 2026-06-14 Safari Match Follow-up

- Status: toolbar/sidebar visual match tightened after screenshot review.
- Updated direction:
  - Tahoe mode now prioritizes Safari parity for toolbar and sidebar over preserving the visible Hilal workspace rail.
  - The workspace rail is hidden in Tahoe mode so the left side reads as a single Safari-like sidebar panel.
  - The toolbar is offset to the right of the sidebar, with macOS traffic lights positioned in the sidebar area.
  - Navigation controls, URL bar, and tab strip are styled as separate Safari-like bands where the Firefox chrome structure allows it.
- Pending: refresh patches and rerun lightweight validation after these follow-up CSS changes.
- Passed: `./bin/hil validate` after Safari match follow-up.
- Passed: `scripts/build-macos.sh faster` after Safari match follow-up.
- Still skipped: `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)` because this build is compiled with `--disable-tests`.

## 2026-06-14 Glass Sidebar Follow-up

- Status: implementation and lightweight validation complete.
- Updated direction:
  - Sidebar material must remain translucent/glass rather than becoming an opaque dark panel.
  - Tahoe mode must keep both the vertical sidebar tab list and the horizontal top tab strip visible at the same time.
  - Sidebar width, top chrome alignment, and panel header position are being tuned toward the Safari reference screenshots.
- Completed:
  - Lowered Tahoe sidebar and chrome material opacity and restored blur/saturation glass treatment.
  - Kept the horizontal tab strip explicitly visible while retaining vertical sidebar tabs.
  - Tuned sidebar width, panel header placement, and section heading scale toward the Safari screenshots.
- Passed: `./bin/hil validate`.
- Passed: `git diff --check`.
- Passed: `scripts/build-macos.sh faster`.
- Still skipped: `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)` because this build is compiled with `--disable-tests`.

## 2026-06-14 Sidebar Layout Revert

- Status: bad layout direction reverted and lightweight validation complete.
- Reverted:
  - Removed the Tahoe-only mock `N Tabs`, `Tab Groups`, and `Saved` render structure.
  - Removed mock Safari sidebar buttons whose semantics did not match the real controls.
  - Removed the aggressive Tahoe-only tabstrip row override from `sidebar.css`.
- Updated direction:
  - Continue from the working glass sidebar base.
  - Do not add mock rows or non-working Safari placeholders.
  - Match Safari next through geometry, inset spacing, material, border radius, and real control placement.
- Completed:
  - Kept the real Hilal sidebar render path and existing controls.
  - Added only a real shell geometry adjustment: inset glass sidebar, four-corner radius, and a content gap.
- Passed: `./bin/hil validate`.
- Passed: `git diff --check`.
- Passed: `scripts/build-macos.sh faster`.
- Still skipped: `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)` because this build is compiled with `--disable-tests`.

## 2026-06-15 Visual Feedback and Scroll Reflection

- Status: Drag-and-drop visuals, layout constraints, and dynamic scroll reflection implemented.
- Completed:
  - **Tab Drag-and-Drop Visuals**: Implemented custom drag-and-drop support for vertical sidebar tabs and horizontal tab strip tabs using a custom liquid glass visual feedback layer (including scaled-down feedback images and highlight transitions matching the glass theme).
  - **Layout Constraints**: Flat webview frames, stretched the glass sidebar to window bounds, dynamically measured content geometry, and aligned the page bleed area with the webview edge.
  - **Scroll Reflection Background**: Developed scroll reflection for the Tahoe Safari shell using `JSWindowActor` (`HilalTahoeChild.sys.mjs` / `HilalTahoeParent.sys.mjs`) to signal content scroll status and draw a canvas snapshot at the top of the browser shell. Refined with blur, saturation, scaling transitions, and right-aligned compact sidebar support. Reverted WebGL liquid glass experiment back to a high-fidelity standard CSS frosted glass for suggestions dropdown for better performance.
- Passed: `./bin/hil validate`.
- Passed: `scripts/build-macos.sh faster`.

## 2026-06-16 Styling Refinements & Page Background Color Boosting

- Status: Accent color boosting, version bumped, and page customizer refactored.
- Completed:
  - **Version Bump**: Bumped version to `0.3.0-alpha.4` in the manifest and other packaging configurations.
  - **URL Bar and Tab lines**: Hidden workspace names in the URL bar by default, enabled colored tab lines globally, and increased suggestions dropdown background opacity.
  - **Dynamic Page Color Boosting**: Connected the page accent color to the Tahoe window chrome underlap background, enabling dynamic page-bleed background boosting (blending the web page color into the browser container/underlap background).
  - **Oklab Color Blending**: Refactored Hilal Page Boosts (`HilalBoosts.js`) to use advanced Oklab color space blending (including linear-sRGB space transforms) for high-fidelity theme integration. Replaced content frame rotation animation with clean scale pulse in the customizer.
- Passed: `./bin/hil validate`.
- Passed: `scripts/build-macos.sh faster`.
- Passed: `./bin/hil refresh`.
