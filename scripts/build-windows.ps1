#!/usr/bin/env pwsh
# scripts/build-windows.ps1
#
# Convenience wrapper around .\mach build for the Hilal workflow on Windows.
# Delegates entirely to mach; this script only handles Hilal-specific prep
# (apply patches, set mozconfig) and finds the right tools.
#
# Prerequisites:
#   - Visual Studio 2022 with Desktop development with C++
#   - Python 3.11+, Git for Windows (with Git Bash)
#   - Mozilla bootstrap.py already run once
#
# Usage:
#   .\scripts\build-windows.ps1                 # full build
#   .\scripts\build-windows.ps1 -Faster          # front-end only (JS/HTML/CSS)
#   .\scripts\build-windows.ps1 -Binaries        # C++/Rust only
#   .\scripts\build-windows.ps1 -Run             # build then run
#   .\scripts\build-windows.ps1 -Package          # build then package
#   .\scripts\build-windows.ps1 -Apply            # force-apply before build
#   .\scripts\build-windows.ps1 -SkipApply        # skip apply step

[CmdletBinding()]
param(
    [switch]$Faster,
    [switch]$Binaries,
    [switch]$Run,
    [switch]$Package,
    [switch]$Apply,
    [switch]$SkipApply
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Cyan
}

function Write-Warn($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Yellow
}

function Write-Err($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Red
}

# --- 1. Resolve repo root and Firefox src -----------------------------------

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$firefoxSrc = Join-Path $repoRoot "firefox"

Write-Step "Repo root : $repoRoot"
Write-Step "Firefox src: $firefoxSrc"

# --- 2. Find Git Bash -------------------------------------------------------

$gitBashCandidates = @(
    "${env:ProgramFiles}\Git\bin\bash.exe",
    "${env:LOCALAPPDATA}\Programs\Git\bin\bash.exe",
    "${env:ProgramFiles(x86)}\Git\bin\bash.exe",
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files (x86)\Git\bin\bash.exe"
)

$gitBash = $null
foreach ($c in $gitBashCandidates) {
    if (Test-Path $c) {
        $gitBash = $c
        break
    }
}
if (-not $gitBash) {
    try {
        $gitBash = (Get-Command bash -ErrorAction Stop).Source
    } catch {
        $gitBash = $null
    }
}

if (-not $gitBash) {
    Write-Err "Git Bash not found. Install Git for Windows first:"
    Write-Err "  winget install Git.Git"
    exit 1
}
Write-Step "Git Bash : $gitBash"

# --- 3. Verify Firefox source tree ------------------------------------------

if (-not (Test-Path $firefoxSrc)) {
    Write-Warn "Firefox source tree not found at: $firefoxSrc"
    Write-Host ""
    Write-Host "  Clone it now with:"
    Write-Host "    bash scripts/setup-firefox.sh"
    Write-Host ""
    exit 1
}

if (-not (Test-Path (Join-Path $firefoxSrc ".git"))) {
    Write-Err "$firefoxSrc is not a git checkout."
    exit 1
}

if (-not (Test-Path (Join-Path $firefoxSrc "mach"))) {
    Write-Err "$firefoxSrc does not look like a Firefox source tree (no .\mach)."
    exit 1
}

# --- 4. Apply Hilal patches and branding ------------------------------------

if (-not $SkipApply) {
    $applyArgs = ""
    if ($Apply) {
        $applyArgs = "--force"
    }

    Write-Step "Applying Hilal patches ..."
    $applyCmd = "cd `"$repoRoot`" && bash scripts/apply.sh $applyArgs"
    & $gitBash -c $applyCmd
    if ($LASTEXITCODE -ne 0) {
        Write-Err "scripts/apply.sh failed. Try: bash scripts/apply.sh --force"
        exit 1
    }
} else {
    Write-Step "Skipping apply step (--SkipApply)."
}

# --- 5. Copy mozconfig ------------------------------------------------------

$mozconfigSrc = Join-Path $repoRoot "mozconfigs" "windows"
$mozconfigDst = Join-Path $firefoxSrc "mozconfig"

if (Test-Path $mozconfigSrc) {
    Copy-Item -Path $mozconfigSrc -Destination $mozconfigDst -Force
    Write-Step "Copied mozconfigs/windows -> firefox/mozconfig"
} else {
    Write-Warn "mozconfigs/windows not found; using default Firefox build config."
}

# --- 6. Build ---------------------------------------------------------------

$mach = Join-Path $firefoxSrc "mach"
$cmdArgs = @("build")

if ($Faster) {
    $cmdArgs = @("build", "faster")
    Write-Step "Building front-end only (faster) ..."
} elseif ($Binaries) {
    $cmdArgs = @("build", "binaries")
    Write-Step "Building C++/Rust only (binaries) ..."
} else {
    Write-Step "Building full Hilal Browser (1-3 hours on first run) ..."
}

Push-Location $firefoxSrc
try {
    & python $cmdArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Err "mach build failed with exit code $LASTEXITCODE."
        exit 1
    }
} finally {
    Pop-Location
}

Write-Step "Build finished."

# --- 7. Run -----------------------------------------------------------------

if ($Run) {
    Write-Step "Launching Hilal Browser ..."
    Push-Location $firefoxSrc
    try {
        & python @("run")
    } finally {
        Pop-Location
    }
    exit 0
}

# --- 8. Package -------------------------------------------------------------

if ($Package) {
    Write-Step "Packaging Hilal Browser ..."
    Push-Location $firefoxSrc
    try {
        & python @("package")
        if ($LASTEXITCODE -ne 0) {
            Write-Err "mach package failed with exit code $LASTEXITCODE."
            exit 1
        }
    } finally {
        Pop-Location
    }

    Write-Step "Package created. Look in:"
    Write-Host "  $firefoxSrc\obj-*-pc-windows-msvc\dist\"
    Write-Host ""
    exit 0
}

# --- Done -------------------------------------------------------------------

Write-Host ""
Write-Step "Next steps:"
Write-Host "  Run:     .\scripts\build-windows.ps1 -Run"
Write-Host "  Package: .\scripts\build-windows.ps1 -Package"
Write-Host ""
