# Android Live Updates

Some changes to Hilal on Android do not need a new APK. Live updates deliver
them in a small signed file that installed apps download from GitHub Releases.
Everything is free: the file is built by GitHub Actions and hosted on the
rolling `android-ota` release.

## What a live update can change

| Source in `android/ota/`  | Effect in the app                                   |
|---------------------------|-----------------------------------------------------|
| `config.json` `flags`     | Feature switches read with `LiveConfig.flag()`      |
| `config.json` `notices`   | Cards on the start page (dismissible)               |
| `config.json` `searchEngines` | Replace or add search engines by name           |
| `config.json` `bangs`     | Replace or add `!bang` shortcuts by trigger         |
| `site-fixes/<id>/`        | CSS and page scripts for named sites                |

The workflow also adds the newest Android APK release, so older apps show a
"new version" card without anyone editing the bundle.

Kotlin code, layouts and GeckoView itself still need an APK release
(`android-v*` tag). The app never downloads or runs app code: Android and
Google Play forbid it, and it would turn the update file into a way to take
over every phone. Site fixes run only inside web pages, like an extension.

## Publishing

1. Edit files under `android/ota/`.
2. Push to `main`.

`.github/workflows/android-ota.yml` validates the sources, signs the bundle and
uploads `ota.json` to the `android-ota` release, usually within a minute. Apps
check at start, when they come back to the foreground if the last check was over
an hour ago, and every six hours while running. Pull requests that touch
`android/ota/` are validated but not published.

Check a change locally before pushing:

```bash
python3 scripts/android-ota/build.py
```

### Flags

```json
"flags": {
  "workspaces": true,
  "someFeature": { "value": false, "minVersionCode": 20100 }
}
```

`workspaces: false` hides the workspace strip for users who have not made a
second workspace yet; it is a kill switch if the feature misbehaves.

### Notices

```json
"notices": [
  {
    "id": "survey-2026-11",
    "title": { "en": "Tell us what you think", "tr": "Fikrinizi söyleyin" },
    "body": { "en": "Two minutes, no account.", "tr": "İki dakika, hesap gerekmez." },
    "url": "https://github.com/VastSea0/hilal-browser/discussions",
    "maxVersionCode": 20099
  }
]
```

A dismissed notice stays dismissed, so give a changed notice a new `id`.

### Site fixes

A folder per fix, named by its id:

```
android/ota/site-fixes/example-com-banner/
  fix.json     {"matches": ["https://*.example.com/*"], "runAt": "document_idle"}
  style.css    optional
  script.js    optional
```

The built-in Hilal Live extension
(`android/app/src/main/assets/extensions/hilal-live/`) registers each fix as a
content script and replaces them as soon as a new bundle arrives. `<all_urls>`
is rejected on purpose: a fix names the sites it fixes.

### Version ranges

Flags (object form), notices and site fixes accept `minVersionCode` and
`maxVersionCode`. Version codes are `MAJOR * 10000 + MINOR * 100 + PATCH`.

## Security

The bundle is `{"payload": base64(json), "signature": base64(ECDSA P-256)}`.
The app accepts it only if the signature matches the public key compiled into
`LiveUpdates.kt` and its `serial` (build time) is newer than the bundle it
already has, so neither GitHub nor anyone in between can change or roll back
what apps apply. Users can turn live updates off in Settings > Privacy; that
also drops the downloaded bundle.

### Keys

- Public key: `android/ota/public-key.pem`, and the same DER as
  `LiveUpdates.PUBLIC_KEY`. The build script refuses to sign if they differ.
- Private key: the `ANDROID_OTA_SIGNING_KEY` repository secret, with a backup
  in `~/Development/hilal-keystore-backup/android-ota/`.

To set the secret:

```bash
gh secret set ANDROID_OTA_SIGNING_KEY < ~/Development/hilal-keystore-backup/android-ota/ota-signing-key.pem
```

If the private key is lost or leaks, make a new pair, put the new public key in
both places and ship an APK; apps on older APKs keep the last bundle they
verified.

```bash
openssl ecparam -name prime256v1 -genkey -noout -out ota-signing-key.pem
openssl ec -in ota-signing-key.pem -pubout -out android/ota/public-key.pem
openssl ec -in ota-signing-key.pem -pubout -outform DER | base64
```
