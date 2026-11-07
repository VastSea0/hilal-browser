# Installing Hilal on macOS

Hilal has no Apple Developer account, so its macOS app is ad-hoc signed
instead of signed and notarized by Apple. macOS puts a quarantine flag on
everything downloaded from the internet, and for an app without Apple's
notarization that flag makes macOS refuse to open it, often saying the app
"is damaged and can't be opened". The app is not damaged.

1. Download `Hilal-Browser-<version>-macOS.dmg` from the
   [releases page](https://github.com/VastSea0/hilal-browser/releases/latest).
   It is for Apple Silicon Macs (M1 and later).
2. Open the DMG and drag **Hilal Browser** into **Applications**.
3. Open **Terminal** and run once:

   ```bash
   xattr -dr com.apple.quarantine "/Applications/Hilal Browser.app"
   ```

4. Open Hilal from Applications or Launchpad.

You only need to do this once. Updates installed by Hilal itself keep working
without it.

If you prefer not to use Terminal: try to open Hilal once, then go to
**System Settings > Privacy & Security**, scroll down and click **Open Anyway**
next to the message about Hilal Browser.

To check the download first, compare its checksum with `SHA256SUMS` from the
same release:

```bash
shasum -a 256 ~/Downloads/Hilal-Browser-*-macOS.dmg
```
