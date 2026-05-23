# Changelog

All notable changes to the Hilal Browser project will be documented in this file.

---

## [0.2.0-alpha.3] - 2026-05-24

### Added
- **Dynamic Firefox-UI-Fix Preferences Integration**: Integrated the Firefox-UI-Fix suite with dynamic options in the Settings UI (preferences page).
- **Desktop Application Update Plumbing**: Enabled Firefox's desktop updater for Hilal builds, bundled a Hilal `AppUpdateURL` policy, and added a helper for creating complete MAR updates.
- **Website Release Surface**: Added platform-aware latest release cards, visible changelog notes, release metadata JSON, and a Firefox updater XML route.
- **Premium Onboarding Welcome Screen**: Implemented a beautiful premium onboarding/welcome overlay displayed on the first run of the browser.
- **Bangs Search Fallback Control**: Prevented unknown bangs from automatically redirecting to DuckDuckGo, giving more predictable address bar search behavior.
- **uBlock Origin Pinning & Verification**: Hardened uBlock Origin default installation by pinning to `1.57.2` with SHA-256 checksum verification during environment setup.
- **Secure Container Deletion**: Enhanced privacy and security by explicitly purging container site data upon workspace deletion.
- **Browser Test Profile & Audit Report**: Initialized a developer test profile and added tools/scaffolding for testing preference configurations, along with a comprehensive workspace audit report.

### Changed
- **Website/www Security Update**: Upgraded the website to Next.js `16.2.6`, next-intl `4.12.0`, React `19.2.6`, and TypeScript `6.0.3`; migrated middleware to `proxy.ts` and fixed React hydration warnings.
- **Refactored Workspace Patches**: Modularized the workspaces codebase and refactored core workspace preference structures.

### Fixed
- **Privileged Scheme Protection**: Fixed container retargeting issues by preventing navigation to privileged browser schemes (e.g. `about:config`, `chrome://...`).
- **uBlock Startup Load**: Fixed an issue where the pre-installed uBlock Origin extension would not load or scan immediately upon browser startup.
- **CSS Preference Discarding**: Resolved a styling discard bug in UI fixes by switching to native media query preference syntax.
- **Workspace Tab Group Collapsing**: Collapsed empty tab groups in workspace view for a cleaner sidebar aesthetics.
- **First-run Crashes & Assets**: Fixed startup sessionstore crashes and incorrect welcome screen layout rendering, SVG icon paths, and branding logo display.

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
