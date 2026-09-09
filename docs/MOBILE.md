# Hilal Android — Architecture and Developer Guide

Hilal Android is an open-source mobile web browser built on Mozilla GeckoView and Jetpack Compose with Material 3 Expressive design tokens.

Package Name: `com.vastsea.hilal`  
Target SDK: 35 (Android 15)  
Minimum SDK: 26 (Android 8.0 Oreo)  
Language: Kotlin 2.x  
UI Framework: Jetpack Compose (Material 3 Expressive 1.4.0-alpha10)  
Browser Engine: Mozilla GeckoView (`org.mozilla.geckoview:geckoview-omni:135.0.20250130195129`)

---

## 1. Project Structure

The Android source resides in the `android/` directory:

```
android/
├── app/
│   ├── build.gradle.kts          # Dependencies, NDK filters, Compose compiler
│   └── src/main/
│       ├── AndroidManifest.xml   # Permissions: INTERNET, ACCESS_NETWORK_STATE
│       ├── java/com/vastsea/hilal/
│       │   ├── MainActivity.kt   # Root Activity, state hoisting, GeckoSession lifecycle
│       │   ├── model/
│       │   │   ├── BrowserTab.kt # Tab state (id, url, title, icon, geckoSession)
│       │   │   ├── Workspace.kt  # Workspaces data model (id, name, emoji, tabs)
│       │   │   ├── BookmarkItem.kt
│       │   │   ├── HistoryItem.kt
│       │   │   └── Bang.kt       # Bang shortcut definitions
│       │   ├── search/
│       │   │   └── HilalBangsEngine.kt # Bang parser (!g, !yt, !w) & URL resolver
│       │   ├── ui/
│       │   │   ├── components/
│       │   │   │   ├── Omnibox.kt            # Address bar, URL typing, bang chips
│       │   │   │   ├── TabsTray.kt           # Tab switcher, grid, workspace filter
│       │   │   │   ├── OptionsBottomSheet.kt # Ergonomic bottom action sheet
│       │   │   │   ├── NewTabPage.kt         # Default home with shortcuts
│       │   │   │   └── LoadingIndicatorView.kt
│       │   │   ├── screens/
│       │   │   │   ├── SettingsScreen.kt     # Theme, styles, clear data
│       │   │   │   ├── BangsScreen.kt        # Bang manager (custom/builtin)
│       │   │   │   ├── BookmarksScreen.kt
│       │   │   │   └── HistoryScreen.kt
│       │   │   └── theme/
│       │   │       ├── Color.kt
│       │   │       ├── Theme.kt              # Material 3 dynamic color scheme
│       │   │       └── Type.kt
│       └── res/
└── keystore/                     # Upload signing keystore
```

---

## 2. Technical Architecture

### GeckoView Integration
Hilal wraps Mozilla's standalone `GeckoView` view inside an AndroidView in Jetpack Compose:
- `GeckoRuntime`: Initialized once as a singleton during application startup.
- `GeckoSession`: Bound to each `BrowserTab`. Each tab maintains its own navigation history, progress delegate, and navigation delegate.
- Hardware acceleration is enabled via `android:hardwareAccelerated="true"` in the manifest.

### Workspaces Model
Similar to Hilal's desktop concept, tabs are organized into distinct `Workspace` instances:
- Each workspace holds an isolated list of `BrowserTab` objects.
- Switching workspaces switches the active tab collection without reloading tabs already in memory.
- Standard tabs and Private tabs are separated into distinct collections.

### Hilal Bangs Engine
The Bangs engine in `HilalBangsEngine.kt` processes input entered into the omnibox:
1. It detects leading prefixes matching `!<identifier>` (e.g., `!g`, `!yt`, `!w`, `!ddg`).
2. If matched, the remaining string is extracted and encoded into the target search URL.
3. Users can define custom bangs stored locally on the device.

---

## 3. Building from Source

### Prerequisites
- JDK 21
- Android SDK (API 35 platform, build-tools 35.0.0)
- Android NDK (r26 or higher, arm64-v8a filter)

### Commands

```bash
cd android

# 1. Build debug APK
./gradlew assembleDebug

# Output APK path:
# android/app/build/outputs/apk/debug/app-debug.apk

# 2. Build release Android App Bundle (AAB) for Google Play
./gradlew bundleRelease

# Output AAB path:
# android/app/build/outputs/bundle/release/app-release.aab

# 3. Install directly to a connected device or running emulator
./gradlew installDebug
```

---

## 4. Privacy and Telemetry Architecture

Hilal Android is fully open source. All network traffic and data storage can be inspected directly in the code:
- **No Browsing Telemetry:** The app does not track, record, or transmit URLs visited, search queries, or page content.
- **Anonymous Usage Statistics:** In release builds, the only telemetry collected consists of strictly anonymous aggregate counts:
  - Active device count / ping
  - Operating system version and device model
  - Purpose: identifying platform-specific rendering bugs and measuring aggregate user adoption.
- **No Personal Identifiers:** No advertising IDs, email addresses, phone numbers, or hardware identifiers (IMEI/MAC) are read or stored.
- **Funding:** The project is funded exclusively through sponsors and donations. It contains no third-party ad SDKs or data brokers.
