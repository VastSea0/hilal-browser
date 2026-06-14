# Tahoe Safari Shell V1 Plan

## Summary

Hilal Browser will gain a macOS Tahoe Safari-inspired shell: Liquid Glass-style toolbar and sidebar materials, a rounded Safari-like URL pill, calmer spacing, and a rounded content frame. V1 keeps Hilal's existing workspace rail and vertical-tabs architecture; it does not add Safari's horizontal tab strip.

WhiteSur Firefox Theme is only a selector and feasibility reference. Do not import or copy WhiteSur code unless a later change explicitly reviews attribution and licensing.

## Implementation Decisions

- Add `hilal.tahoe.enabled`, defaulting to `true`.
- Gate Tahoe-specific CSS with `@media -moz-pref("hilal.tahoe.enabled")`.
- Package a new `browser/themes/shared/hilal-tahoe.css` skin file and import it late from `browser-shared.css`.
- Keep the current toolbar visible by default. Existing compact mode and compact toolbar auto-hide preferences remain available.
- Preserve the Hilal workspace rail as the primary sidebar identity.
- Defer a true top horizontal Safari tab bar to a later V2.

## Key UI Changes

- Toolbar: translucent Liquid Glass material, rounded toolbar surface, centered low-contrast URL pill, softer toolbar button hover and active states.
- Sidebar: refreshed glass material, calmer rail and panel spacing, softer hover/selected states, preserved traffic-light padding.
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
