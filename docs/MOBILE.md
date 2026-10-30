# Hilal Android — Architecture and Developer Guide

Hilal Android is a GeckoView browser with a Jetpack Compose interface built on Material 3
Expressive (`androidx.compose.material3` 1.5, `MaterialExpressiveTheme`, `MotionScheme.expressive()`).

- Package: `com.vastsea.hilal`
- Min SDK 26, target and compile SDK 36
- Engine: `org.mozilla.geckoview:geckoview-omni`

## 1. Project structure

```
android/app/src/main/java/com/vastsea/hilal/
├── HilalApplication.kt     # AppContainer: the single GeckoRuntime, database, stores
├── MainActivity.kt         # Splash, intents (VIEW/SEND), immersive mode, permissions bridge
├── gecko/GeckoProvider.kt  # Runtime settings: tracking protection, cookie isolation, GPC
├── browser/
│   ├── Tab.kt              # TabState (UI state) + the GeckoSession it comes from
│   ├── TabStore.kt         # Tabs, selection, Gecko delegates, session persistence, undo close
│   └── PageRequest.kt      # Prompts, permissions and context menus waiting for the user
├── data/                   # Room: history, bookmarks, downloads; SharedPreferences settings
├── search/                 # Search engines, bangs, address resolution, suggestions
├── downloads/              # Streams Gecko responses into MediaStore Downloads
├── addons/                 # WebExtensions: bundled uBlock Origin, install prompts, tab delegate
├── telemetry/              # Opt-out daily ping (see section 4)
└── ui/
    ├── HilalApp.kt         # Theme, haptics, secondary screens with predictive back
    ├── theme/              # Color schemes, Haptics (the only place that vibrates)
    ├── browser/            # Browser screen, address bar and its gestures, tab overview,
    │                       # address editor, start page, menus, find in page, dialogs
    ├── library/            # History, bookmarks, downloads
    └── settings/           # Settings, add-ons
```

## 2. Interaction model

The address bar sits at the bottom and floats over the page. Gecko is told its height through
`GeckoView.setDynamicToolbarMaxHeight()` and how much of it currently covers the page through
`setVerticalClipping()`, so fixed-position page elements stay above it. It hides while
scrolling down and returns on any upward scroll.

The pill in the bar carries all gestures (`ui/browser/BarGestures.kt`). The axis of a drag is
decided once, when the finger leaves the touch slop, so gestures never compete:

| Gesture | Result |
|---|---|
| Tap | Address editor; the field sits at the bottom, suggestions stack upward |
| Swipe left / right | Next / previous tab; the page follows the finger and the neighbour slides in |
| Swipe up | Tab overview; the page shrinks as a preview while dragging |
| Long press | Quick actions: paste and go, copy, share, edit |

Haptics (`ui/theme/Haptics.kt`) fire only when a drag crosses its commit point, on long
press, and on refusals. Taps never vibrate. The user can turn gesture vibration off.

Motion uses the theme's expressive `MotionScheme` springs everywhere; there are no hand-tuned
durations except the short cover that hides the first frames of a newly attached session.

## 3. Building from source

Prerequisites: JDK 17 or newer, Android SDK with platform 36.

```bash
cd android
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
./gradlew bundleRelease     # app/build/outputs/bundle/release/app-release.aab
./gradlew installDebug
```

Release builds are signed with `app/hilal-upload-key.jks` when it exists and
`KEYSTORE_PASSWORD` is set (`KEY_ALIAS` and `KEY_PASSWORD` are optional); otherwise they fall
back to the debug key.

## 4. Releases

`.github/workflows/android-ci.yml` builds a debug APK for every push that touches `android/`;
the APK is kept as a workflow artifact for 14 days.

`.github/workflows/android-release.yml` runs when a tag `android-vMAJOR.MINOR.PATCH` is pushed
(a suffix such as `-beta.1` makes a pre-release). It:

1. derives `versionName` from the tag and `versionCode` as `MAJOR*10000 + MINOR*100 + PATCH`,
2. builds a release APK and AAB signed with the upload key, and refuses to publish if the key
   is missing or the APK ends up debug-signed,
3. publishes a GitHub release with the APK and its SHA-256, using
   `android/release-notes/<version>.md` as the notes when it exists,
4. keeps the AAB as a workflow artifact for uploading to Google Play.

```bash
git tag android-v2.0.0
git push origin android-v2.0.0
```

The website offers the newest stable release that has an APK to Android visitors, and
`/android/latest.apk` always redirects to it. The desktop updater ignores `android-` and
`mobile-` releases.

Required repository secrets:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `base64 -i hilal-upload-key.jks` |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (defaults to `hilal-upload`) |
| `ANDROID_KEY_PASSWORD` | Key password (defaults to the keystore password) |

Use the same key that signed the Google Play and earlier APK builds; Android only installs an
update signed with the same key.

## 5. Privacy and telemetry

- Browsing data (history, bookmarks, tabs, downloads) stays on the device. Private tabs are
  never written to history or to the saved session.
- Search suggestions send what you type to the selected search engine. They can be turned off
  and are never requested from private tabs.
- The only data Hilal itself sends is an opt-out anonymous ping to
  `hilal-browser.vercel.app/api/telemetry`: a `first_run` event, then at most one `daily_ping`
  per day. It contains a random installation ID, app version and build number, Android API
  level, CPU architecture, language, search engine name, theme, whether uBlock Origin is on,
  and a tab count range (1, 2–5, 6–10, 11+). It can be turned off in Settings → Privacy.
