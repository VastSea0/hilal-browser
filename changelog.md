# Changelog

---

## [0.3.0-alpha.4] - 2026-06-16

### Added
- **Tahoe Safari-Inspired Shell**: Introduced Safari-style vertical and horizontal sidebar layout options, custom page-bleed parameters, and synchronized underlap offsets.
- **Dynamic Scroll Reflection**: Added content scroll reflection backgrounds for Tahoe mode using WindowActor signaling and canvas snapshotting.
- **Hilal Boosts (Site Customizer & Element Zapper)**: Integrated interactive tools for custom website style customizers and dynamic element removal.
- **Workspace Reordering**: Added drag-and-drop workspace sorting, tab-to-workspace drop support, and workspace context-menus.
- **Custom Keyboard Shortcuts Table**: Replaced static JSON override files with preference-based shortcut storage and built a settings UI panel.
- **Onboarding Personalization**: Rewrote onboarding welcome stages, persistent container configuration, and welcome layout presets.

### Changed
- **V2 Classic Slide-Up Toolbar**: Switched compact toolbar hide behaviors to slide-up layout animations with centered browser chrome controls.
- **macOS Window Integration**: Constrained native traffic lights layout positioning in compact sidebar/toolbar modes to prevent control overlaps.

### Fixed
- **Compact Layout Transitions**: Fixed URL bar ghosting, layout heights, and icon flickering during transitions.
- **Onboarding Duplicate Pins**: Prevented duplicate pinned site creation when finalizing the onboarding flow.

---

## [0.2.0-alpha.5] - 2026-05-29

### Added
- **Compact Mode with Auto-Hide Sidebar**: Added a hover-triggered compact sidebar, floating overlay mode, auto-hide controls, and workspace preference bindings.
- **Firefox-UI-Fix Integration**: Added Firefox-UI-Fix CSS, sync scripts, Hilal overrides, and preference toggles.
- **Sidebar Layout Redesign**: Changed tab sizing, pinned-tab grid layout, sidebar theme rules, and slotted tabstrip integration.
- **Language Selection Support**: Added `0020-hilal-language-selection.patch` for browser language preferences and Turkish language pack integration.
- **Update Signature Checks**: Added update signature verification and channel handling for unsigned MARs in development builds.
- **Custom About Dialog Links**: Updated the About dialog with Hilal project resource links and custom Help/Feedback dialog link integration.
- **Sidebar Footer & Custom Shortcuts**: Added sidebar footer and custom shortcut preferences with favicon support from Firefox's page-icon cache.
- **Production Signing Scripts**: Added macOS code signing, notarization scripts with NSS setup, key rotation, and CI secret integration.
- **Flatpak Build Support**: Added Flatpak build scripts, manifest, and desktop integration files.

### Changed
- **Compact Mode Workspace Handling**: Changed initial page handling, sidebar item state, and session state logic for compact mode.
- **Privacy & Workspace Handling**: Added container site-data cleanup on deletion, workspace tab group collapsing, and state synchronization changes.
- **Patch System Refinements**: Refactored workspace context isolation, bang customization, and localization patches.

### Fixed
- **Compact Mode Toolbar Transitions**: Enforced CSS visibility and transform properties for compact mode toolbar transitions.
- **Sidebar Button Behavior**: Resolved compact mode button opening history panel instead of sidebar toggle.
- **First-run Crashes & Layout**: Fixed startup sessionstore crashes and incorrect welcome screen rendering.

---

## [0.2.0-alpha.4] - 2026-05-26

### Added
- **Workspace-Specific Bookmark Folders**: Each workspace now has a dedicated bookmark folder for context-isolated bookmarking, with URL filtering tied to the active workspace.
- **Bang Customization UI**: Added a Bangs settings panel in Hilal Preferences for default bangs and custom trigger, search URL, and home URL entries.
- **Bang Fallback**: Routed unknown bangs to DuckDuckGo's bang handler (`https://duckduckgo.com/?q=!bang+query`).
- **Dynamic Sidebar Shortcut Favicons**: Custom sidebar shortcuts now display favicons fetched from Firefox's `page-icon:` cache instead of performing a live web request, preserving privacy.
- **Full Localization of Preferences and Welcome Screen**: All hardcoded label strings in the preferences panel and welcome screen have been replaced with Fluent `data-l10n-id` bindings and new FTL definitions.

### Changed
- **Firefox Upstream Sync**: Updated the Firefox base to version `153.0a1` (upstream commit `f596fa5fe90d`).
- **Patch Apply Checksum Validation**: `scripts/apply.sh` now computes a content hash of the entire patch series and skips re-applying patches if nothing has changed, speeding up incremental builds.
- **Hilal Preferences UI Reorganization**: Sidebar, workspace, privacy, and UI fix preference modules have been refactored into separate, focused blocks within `hilal.inc.xhtml`.

### Fixed
- **Workspace Tab Operations in Customization Mode**: Prevented workspace tab move/retarget operations from running while the browser is in sidebar customization mode, which could corrupt tab state.
- **Patch Apply Conflicts**: Fixed a line-offset conflict in `0016-hilal-bang-customization.patch` caused by duplicate Fluent string definitions already introduced by `0005-hilal-l10n.patch`.
- **Website TypeScript Compilation**: Fixed a `Cannot find namespace 'React'` TypeScript compiler error in `www/src/App.tsx` by adding the React namespace import.
- **macOS Window Margins**: Adjusted macOS window margins and eliminated stacked paddings that were causing visual misalignment.

---

## [0.2.0-alpha.3] - 2026-05-24

### Added
- **Dynamic Firefox-UI-Fix Preferences Integration**: Integrated the Firefox-UI-Fix suite with dynamic options in the Settings UI (preferences page).
- **Desktop Application Update Plumbing**: Enabled Firefox's desktop updater for Hilal builds, bundled a Hilal `AppUpdateURL` policy, and added a helper for creating complete MAR updates.
- **Website Release Surface**: Added platform-aware latest release cards, visible changelog notes, release metadata JSON, and a Firefox updater XML route.
- **Onboarding Welcome Screen**: Added a first-run welcome overlay.
- **Bangs Search Fallback Control**: Prevented unknown bangs from redirecting to DuckDuckGo.
- **uBlock Origin Pinning & Verification**: Hardened uBlock Origin default installation by pinning to `1.57.2` with SHA-256 checksum verification during environment setup.
- **Container Site-Data Deletion**: Purged container site data when a workspace is deleted.
- **Browser Test Profile & Audit Report**: Added a developer test profile, preference test tooling, and a workspace audit report.

### Changed
- **Website/www Security Update**: Upgraded the website to Next.js `16.2.6`, next-intl `4.12.0`, React `19.2.6`, and TypeScript `6.0.3`; migrated middleware to `proxy.ts` and fixed React hydration warnings.
- **Refactored Workspace Patches**: Modularized the workspaces codebase and refactored core workspace preference structures.

### Fixed
- **Privileged Scheme Protection**: Fixed container retargeting issues by preventing navigation to privileged browser schemes (e.g. `about:config`, `chrome://...`).
- **uBlock Startup Load**: Fixed an issue where the pre-installed uBlock Origin extension would not load or scan immediately upon browser startup.
- **CSS Preference Discarding**: Resolved a styling discard bug in UI fixes by switching to native media query preference syntax.
- **Workspace Tab Group Collapsing**: Collapsed empty tab groups in workspace view.
- **First-run Crashes & Assets**: Fixed startup sessionstore crashes and incorrect welcome screen layout rendering, SVG icon paths, and branding logo display.

---

## [0.2.0-alpha.2] - 2026-05-19

### Added
- **Browser-wide Bangs! Support**: Direct search redirection (e.g., `!g` for Google, `!yt` for YouTube, `!w` for Wikipedia, `!gh` for GitHub) typed directly in the address bar, with automatic fallback to DuckDuckGo for any unknown bangs.
- **Default uBlock Origin Bundling**: Pre-installed the uBlock Origin adblocker extension by default on all profiles. The extension XPI is fetched automatically during the environment apply phase.
- **Preferences for Pinned Tabs & Tab Groups**: Settings in the Preferences page to configure whether pinned tabs and tab groups are visible across all workspaces (public) or specific to the active workspace.

### Changed
- **Sidebar Labels**: Hid workspace names in the sidebar and kept square workspace buttons.
- **Display Version Update**: Set the user-facing browser version identifier to `0.2.0-alpha.2` in `version_display.txt`.

---

## [0.2.0-alpha.1] - 2026-05-19

### Added
- **Next.js Project Integration**: Initialized website project structure with Next.js, Tailwind CSS, and internationalization (i18n) support.
- **Unified Logo Component**: Extracted the browser logo into a reusable website component.

### Changed
- **Workspace UI Refinement**: Restricted the workspace selection bar to a single horizontal row with a fading scrollable layout to prevent line wrapping.
- **Emoji Picker Support**: Switched to an emoji picker for workspace configuration and hid labels for inactive workspaces.
- **Badge Removal**: Removed the tab count badge indicator from the active workspace.

### Fixed
- **Container Retargeting issue**: Fixed an issue where new blank tabs redirected to `about:blank` instead of `about:newtab` during container retargeting.
- **Workspace Core Refactoring**: Added structured schema validation and changed container integration code paths.

---

## [0.1.0] - 2026-05-12

### Added
- **Transparent macOS Chrome**: Implemented native macOS glass vibrancy and transparent chrome surfaces (`VibrancyManager` integration).
- **Hilal Workspace System**: Initial implementation of containerized workspaces with emoji representation.
- **Sidebar & Vertical Tabs**: Turned on vertical tabs and the compact sidebar by default.
- **Privacy Hardening**: Changed default privacy preferences and telemetry blocks.
- **Windows Build Support**: Added Windows PowerShell build scripts (`build-windows.ps1`), cross-platform CI/CD mozconfigs, and detailed Windows build documentation.
- **Rebranding**: Complete branding overhaul of the browser to Hilal/Hüma Browser.

---
