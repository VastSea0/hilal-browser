# Building Hilal Browser on Android

This is a comprehensive guide to building Hilal Browser for Android (based on GeckoView and Fenix). 

Before starting, ensure you have set up the base repository checkout and run `scripts/setup-firefox.sh`.

---

## One-Time Development Setup (Bootstrapping)

Building for Android requires the Android SDK, NDK, and Java Development Kit (JDK). Firefox's built-in bootstrapper installs and configures all of these automatically in standard paths under `~/.mozbuild/`.

To bootstrap your environment for Android:

1. Inside the `firefox/` directory, run:
   ```bash
   ./mach bootstrap
   ```
2. When prompted to select the application to build, select **Firefox for Android** (usually option `4`).
3. Follow the prompts to let the bootstrapper download the Android NDK, Android SDK, and standard toolchains.

---

## Architecture Targets

Android targets require specific CPU architectures. We provide four pre-configured options under the `mozconfigs/` directory:

| Mapped Configuration | Target Architecture | Typical Use Case |
| --- | --- | --- |
| `android-arm64` | `aarch64-linux-android` | Modern Android phones & tablets (Default) |
| `android-x86_64` | `x86_64-linux-android` | Android Studio Emulator running on macOS/Linux |
| `android-arm` | `arm-linux-androideabi` | Legacy 32-bit ARM physical devices |
| `android-x86` | `i686-linux-android` | Legacy 32-bit x86 emulators |

---

## Building and Installing

A dedicated wrapper script `scripts/build-android.sh` is provided in the repository root to automate applying patches, copying configs, and running `./mach` commands.

### 1. GeckoView backend build
The engine (GeckoView) must be compiled first:
```bash
# Builds for 64-bit ARM (default)
scripts/build-android.sh arm64 build

# Builds for the Emulator (64-bit x86)
scripts/build-android.sh x86_64 build
```

### 2. Gradle compilation & APK Packaging
To compile the Android app (Fenix) and produce the installable APKs:
```bash
# Build debug APK for arm64
scripts/build-android.sh arm64 gradle fenix:assembleDebug

# Build release APK for arm64
scripts/build-android.sh arm64 gradle fenix:assembleRelease
```
The compiled APK files will be located under:
`firefox/mobile/android/fenix/app/build/outputs/apk/`

### 3. Deploying to Emulator or Connected Device
To build GeckoView and directly push/install the Fenix debug application onto an active emulator or connected USB device running ADB:
```bash
# For connected ARM64 device
scripts/build-android.sh arm64 install

# For active x86_64 emulator
scripts/build-android.sh x86_64 install
```

---

## Front-End Note for Desktop Developers

> [!WARNING]
> Firefox for Android uses a native Android/Kotlin front-end called **Fenix** wrapping the **GeckoView** engine.
> Desktop front-end modifications under the `browser/` folder (such as Desktop Workspaces, titlebar transparency overlays, or desktop preference pages) do not apply to or compile into the Android app. 
> Core engine modifications, WebRTC overrides, and standard network/security prefs will compile and take effect.

---

## Cleaning the Build

To wipe build caches and run a clean compilation:
```bash
# Clobber build state for arm64
scripts/build-android.sh arm64 clean
```
