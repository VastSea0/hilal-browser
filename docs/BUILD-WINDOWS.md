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

That installs `mozbuild`, `mach` dependencies, `cargo`, `cbindgen`, and checks
the Visual Studio installation.

## Building Hilal

### 1. Compile the Patch Manager (`hil`)

Since the custom Rust patch manager `hil` is not distributed as pre-compiled binaries, you must compile it from source first.

In **PowerShell** or **Git Bash**:

```powershell
# Build the patch manager tool using Cargo
cargo build --release --manifest-path hil/Cargo.toml

# Create the bin/ folder and copy the compiled binary
if (-not (Test-Path bin)) { New-Item -ItemType Directory -Path bin }
Copy-Item hil\target\release\hil.exe -Destination bin\hil.exe
```

### 2. Diagnose Environment Readiness

Before compiling the browser, you should run the built-in diagnostic tool to ensure your Windows environment is correctly configured (checking for long path registries, spaces in repository path, disk space, Python version, VC++ workload components, Git settings, and Rust targets):

```bash
# Run build diagnostics
./bin/hil doctor
```

### 3. Fetch Firefox and Build

You can now fetch, patch, and build the browser automatically using the unified entry points in `hil`:

```bash
# 1. Fetch Firefox into ./engine (one-time setup)
./bin/hil setup

# 2. Build the browser (this automatically copies the correct mozconfig, applies patches/overlays, and starts compiling)
./bin/hil build

# 3. Build and package the browser (generate zip/installer)
./bin/hil build --package

# 4. Build and launch the browser
./bin/hil build --run
```

Alternatively, you can run the building steps via our convenience PowerShell wrapper:

```powershell
# Setup, apply, and build automatically:
.\scripts\build-windows.ps1 -Package -Run
```

## Faster iteration

| Change kind | Command |
| --- | --- |
| Front-end only (JS, HTML, CSS, XHTML, FTL, .ini) | `cd engine && ./mach build faster` |
| C++ / Rust only | `cd engine && ./mach build binaries` |
| Mixed | `cd engine && ./mach build` (full) |

These map directly to `./mach build faster` / `./mach build binaries`
and are documented at <https://firefox-source-docs.mozilla.org/build/buildsystem/buildfaster.html>.

## Where does the built app live?

After a successful build, the Windows package is at:

```
engine/obj-x86_64-pc-windows-msvc/dist/Hilal Browser/
```

The executable name comes from `branding/hilal/configure.sh`, which sets
`MOZ_APP_DISPLAYNAME` to `Hilal Browser`.

## Packaging

To produce a redistributable `.zip`:

```bash
cd engine && ./mach package
```

The output lands in:

```
engine/obj-x86_64-pc-windows-msvc/dist/hilal-*.win64.zip
```

## Common issues

**`mach` not found.** Make sure you're inside `engine/` when running `./mach`.
On Windows, use Git Bash or MozillaBuild shell; PowerShell works for `./mach` but
Hilal's native tool (`.\bin\hil.exe` or `.\bin\hil`) should be used for patching.

**Visual Studio not detected.** Run `./mach bootstrap` from inside `engine/`.
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
run `cd engine && ./mach clobber` to clear the object directory.

**Bootstrap re-runs.** If `./mach build` complains about a missing
`bootstrap`ed tool, rerun `./mach bootstrap` (this is the in-tree
helper, distinct from the one-time `bootstrap.py` above).

**Big rebuilds after `./bin/hil apply --force`.** Force-apply resets
the tree and often invalidates the build cache.

**Anti-virus interference.** Windows Defender or other AV can slow Rust/C++
compilation significantly. Add an exclusion for your `engine/` directory if
builds are unreasonably slow.
