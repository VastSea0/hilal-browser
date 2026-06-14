# Tahoe Safari Shell V1 Plan

## Summary

Hilal Browser will gain a macOS Tahoe Safari-inspired shell: Liquid Glass-style toolbar and sidebar materials, a rounded Safari-like URL pill, calmer spacing, and a rounded content frame. V1 prioritizes Safari parity for the visible toolbar and sidebar, while keeping the underlying Hilal workspace/tab architecture intact.

WhiteSur Firefox Theme is only a selector and feasibility reference. Do not import or copy WhiteSur code unless a later change explicitly reviews attribution and licensing.

## Implementation Decisions

- Add `hilal.tahoe.enabled`, defaulting to `true`.
- Gate Tahoe-specific CSS with `@media -moz-pref("hilal.tahoe.enabled")`.
- Package a new `browser/themes/shared/hilal-tahoe.css` skin file and import it late from `browser-shared.css`.
- Keep the current toolbar visible by default. Existing compact mode and compact toolbar auto-hide preferences remain available.
- Hide the visible Hilal workspace rail in Tahoe mode so the sidebar reads as one Safari-like panel.
- Style the navigation toolbar and tab strip as separate Safari-like bands where the Firefox chrome structure allows it.
- Preserve simultaneous vertical sidebar tabs and the horizontal top tab strip in Tahoe mode.
- Do not add mock Safari-only sidebar rows or buttons. Tahoe mode must preserve real Hilal/Firefox sidebar controls and their existing behavior.

## Key UI Changes

- Toolbar: Safari-like separated navigation and tab bands, centered low-contrast URL pill, softer toolbar button hover and active states.
- Sidebar: single translucent Safari-like glass panel, hidden workspace rail in Tahoe mode, real existing controls only, softer hover/selected states, preserved traffic-light padding, Safari-like outer radius and inset spacing.
- Content: rounded browser content frame with subtle border and shadow while avoiding fullscreen and customize-mode regressions.
- Settings: add a Hilal settings checkbox that toggles `hilal.tahoe.enabled`.

## Test Plan

- Run `./bin/hil validate`.
- Run `scripts/build-macos.sh faster`.
- Run `(cd engine && ./mach test browser/base/content/test/hilal/browser_compact_mode.js)`.
- Manually smoke-test light/dark mode, Tahoe pref on/off, compact mode on/off, auto-hide toolbar on/off, sidebar left/right, vertical tabs on/off, URL bar open/focused, extension icons, overflow menu, downloads panel, fullscreen, private window, and customize mode.

## Acceptance Criteria

- Tahoe pref on gives a recognizable rounded Liquid Glass Safari-like shell.
- Tahoe pref off restores the previous Hilal shell without requiring restart beyond normal chrome CSS reload behavior.
- Toolbar controls remain clickable, URL autocomplete is not clipped, and macOS traffic lights are not covered.
- Sidebar text and controls do not overlap in compact or expanded states.
- Fullscreen and customize mode remain usable.
