# Changelog

All notable changes to the Hilal Browser project will be documented in this file.

---

## [0.2.0-alpha.2] - 2026-05-19

### Added
- **Browser-wide Bangs! Support**: Direct search redirection (e.g., `!g` for Google, `!yt` for YouTube, `!w` for Wikipedia, `!gh` for GitHub) typed directly in the address bar, with automatic fallback to DuckDuckGo for any unknown bangs.
- **Default uBlock Origin Bundling**: Pre-installed the uBlock Origin adblocker extension by default on all profiles. The extension XPI is fetched automatically during the environment apply phase.
- **Preferences for Pinned Tabs & Tab Groups**: Settings in the Preferences page to configure whether pinned tabs and tab groups are visible across all workspaces (public) or specific to the active workspace.

### Changed
- **Sidebar Aesthetic Refinement**: Hid workspace names in the sidebar entirely under all conditions to maintain a clean, compact, and uniform UI/UX with square buttons.
- **Display Version Update**: Set the user-facing browser version identifier to `0.2.0-alpha.2` in `version_display.txt`.

---

## [0.2.0-alpha.1] - 2026-05-19

### Added
- **Next.js Project Integration**: Initialized website project structure with Next.js, Tailwind CSS, and internationalization (i18n) support.
- **Unified Logo Component**: Extracted browser logo into a reusable component with premium visual styling.

### Changed
- **Workspace UI Refinement**: Restricted the workspace selection bar to a single horizontal row with a fading scrollable layout to prevent line wrapping.
- **Emoji Picker Support**: Switched to an emoji picker for workspace configuration and hid labels for inactive workspaces.
- **Badge Removal**: Removed the tab count badge indicator from the active workspace.

### Fixed
- **Container Retargeting issue**: Fixed an issue where new blank tabs redirected to `about:blank` instead of `about:newtab` during container retargeting.
- **Workspace Core Refactoring**: Improved workspace data management with structured schema validation and cleaner container integration.

---

## [0.1.0] - 2026-05-12

### Added
- **Transparent macOS Chrome**: Implemented native macOS glass vibrancy and transparent chrome surfaces (`VibrancyManager` integration).
- **Hilal Workspace System**: Initial implementation of containerized workspaces with emoji representation.
- **Sidebar & Vertical Tabs**: Turned on vertical tabs and the compact sidebar by default.
- **Privacy Hardening**: Enhanced default privacy preferences and telemetry blocks.
- **Windows Build Support**: Added Windows PowerShell build scripts (`build-windows.ps1`), cross-platform CI/CD mozconfigs, and detailed Windows build documentation.
- **Rebranding**: Complete branding overhaul of the browser to Hilal/Hüma Browser.

---
