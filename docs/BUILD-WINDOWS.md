# Building Hilal Browser on Windows

This is a short addendum to Mozilla's official guide:
<https://firefox-source-docs.mozilla.org/setup/windows_build.html>

## Prerequisites

### 1. Install dependencies

- **Visual Studio 2022** (Community edition is fine) with the following workloads:
  - Desktop development with C++
  - Universal Windows Platform development (optional but recommended)
- **Python 3.11+** (add to PATH)
- **Git for Windows** (Git Bash is used by Hilal scripts)
- **MozillaBuild** (<https://wiki.mozilla.org/MozillaBuild>)

### 2. One-time bootstrap

From a standard Command Prompt or PowerShell (not MozillaBuild shell):

```powershell
curl -L https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py -O
python bootstrap.py
```

That installs `mozbuild`, `mach` dependencies, `cargo`, `cbindgen`, and verifies your Visual Studio installation. It only needs to run once per machine.

## Building Hilal

From the repo root in **Git Bash** (or any bash shell):

```bash
# One-time: fetch Firefox into ./firefox
bash scripts/setup-firefox.sh

# Apply patches + branding overlays
bash scripts/apply.sh

# Configure mozconfig for Windows
cp mozconfigs/windows firefox/mozconfig

# Full build (1-3 hours on first run)
cd firefox && ./mach build

# Run
./mach run
```

## Faster iteration

| Change kind | Command |
| --- | --- |
| Front-end only (JS, HTML, CSS, XHTML, FTL, .ini) | `cd firefox && ./mach build faster` |
| C++ / Rust only | `cd firefox && ./mach build binaries` |
| Mixed | `cd firefox && ./mach build` (full) |

These map directly to `./mach build faster` / `./mach build binaries`
and are documented at <https://firefox-source-docs.mozilla.org/build/buildsystem/buildfaster.html>.

## Where does the built app live?

After a successful build, the Windows package is at:

```
firefox/obj-x86_64-pc-windows-msvc/dist/Hilal Browser/
```

The executable name comes from `branding/hilal/configure.sh`, which sets
`MOZ_APP_DISPLAYNAME` to `Hilal Browser`.

## Packaging

To produce a redistributable `.zip`:

```bash
cd firefox && ./mach package
```

The output lands in:

```
firefox/obj-x86_64-pc-windows-msvc/dist/hilal-*.win64.zip
```

## Common issues

**`mach` not found.** Make sure you're inside `firefox/` when running `./mach`.
On Windows, use Git Bash or MozillaBuild shell; PowerShell works for `./mach` but
Hilal's helper scripts (`scripts/apply.sh`, etc.) require bash.

**Visual Studio not detected.** Run `./mach bootstrap` from inside `firefox/`.
If it still fails, set `MOZ_CONFIGURE_OPTIONS` or use the MozillaBuild shell
which pre-sets the compiler environment.

**Long paths.** Windows has a 260-character path limit that can break builds.
Enable long paths support:

```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

And enable Git long paths:

```bash
git config --global core.longpaths true
```

**Object directory mismatch.** If you've changed architectures or moved the repo,
run `cd firefox && ./mach clobber` to clear the object directory.

**Bootstrap re-runs.** If `./mach build` complains about a missing
`bootstrap`ed tool, rerun `./mach bootstrap` (this is the in-tree
helper, distinct from the one-time `bootstrap.py` above).

**Big rebuilds after `scripts/apply.sh --force`.** Force-apply resets
the tree, which usually invalidates the build cache. Expect a slow next
build.

**Anti-virus interference.** Windows Defender or other AV can slow Rust/C++
compilation significantly. Add an exclusion for your `firefox/` directory if
builds are unreasonably slow.
