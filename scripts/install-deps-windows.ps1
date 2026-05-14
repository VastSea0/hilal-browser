#!/usr/bin/env pwsh
# scripts/install-deps-windows.ps1
#
# One-time dependency setup for building Hilal Browser on Windows.
# Run this from an elevated PowerShell (Administrator) so winget can install
# missing packages.
#
# Usage:
#   .\scripts\install-deps-windows.ps1
#   .\scripts\install-deps-windows.ps1 -SkipBootstrap   # skip Mozilla bootstrap.py

[CmdletBinding()]
param(
    [switch]$SkipBootstrap
)

$ErrorActionPreference = "Stop"

function Test-Admin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Write-Step($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Cyan
}

function Write-Warn($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Yellow
}

function Write-Err($msg) {
    Write-Host "[hilal] $msg" -ForegroundColor Red
}

# --- 1. Admin check ---------------------------------------------------------

if (-not (Test-Admin)) {
    Write-Warn "Not running as Administrator. Some installs may fail."
    Write-Warn "Re-run as Admin if winget prompts are denied."
}

# --- 2. Visual Studio 2022 ---------------------------------------------------

Write-Step "Checking for Visual Studio 2022 ..."

$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$hasVS = $false
if (Test-Path $vsWhere) {
    $installs = & $vsWhere -version "[17.0,18.0)" -products * -format json | ConvertFrom-Json
    if ($installs) {
        $hasVS = $true
        foreach ($i in $installs) {
            Write-Host "  Found: $($i.displayName) at $($i.installationPath)"
        }
    }
}

if (-not $hasVS) {
    Write-Warn "Visual Studio 2022 not found."
    Write-Host ""
    Write-Host "  Install manually from: https://visualstudio.microsoft.com/downloads/"
    Write-Host "  Required workload:   Desktop development with C++"
    Write-Host ""
    Write-Host "  Or run (as Admin):"
    Write-Host "    winget install Microsoft.VisualStudio.2022.BuildTools"
    Write-Host ""
    Write-Host "  After installing, re-run this script."
    exit 1
}

# --- 3. Python --------------------------------------------------------------

Write-Step "Checking for Python 3.11+ ..."

try {
    $pyVer = (& python --version 2>&1).ToString().Split()[1]
    $verParts = $pyVer.Split('.')
    $major = [int]$verParts[0]
    $minor = [int]$verParts[1]
    if ($major -eq 3 -and $minor -ge 11) {
        Write-Host "  OK: Python $pyVer"
    } else {
        throw "too old"
    }
} catch {
    Write-Warn "Python 3.11+ not found."
    Write-Host ""
    Write-Host "  Install via:"
    Write-Host "    winget install Python.Python.3.11"
    Write-Host ""
    Write-Host "  Make sure 'Add Python to PATH' is checked."
    exit 1
}

# --- 4. Git for Windows -----------------------------------------------------

Write-Step "Checking for Git ..."

try {
    $gitVer = (& git --version 2>&1).ToString()
    Write-Host "  OK: $gitVer"
} catch {
    Write-Warn "Git not found."
    Write-Host ""
    Write-Host "  Install via:"
    Write-Host "    winget install Git.Git"
    Write-Host ""
    Write-Host "  This also installs Git Bash, required by Hilal scripts."
    exit 1
}

# --- 5. Git Bash --------------------------------------------------------------

Write-Step "Checking for Git Bash ..."

$gitBash = "${env:ProgramFiles}\Git\bin\bash.exe"
if (-not (Test-Path $gitBash)) {
    $gitBash = "${env:LOCALAPPDATA}\Programs\Git\bin\bash.exe"
}
if (-not (Test-Path $gitBash)) {
    $gitBash = (Get-Command bash -ErrorAction SilentlyContinue).Source
}
if (-not (Test-Path $gitBash)) {
    Write-Warn "Git Bash not found. Make sure Git for Windows is fully installed."
    exit 1
}
Write-Host "  OK: $gitBash"

# --- 6. Mozilla bootstrap.py --------------------------------------------------

if ($SkipBootstrap) {
    Write-Step "Skipping Mozilla bootstrap (--SkipBootstrap passed)."
} else {
    Write-Step "Running Mozilla bootstrap.py (one-time per machine) ..."

    $bootstrapUrl = "https://raw.githubusercontent.com/mozilla-firefox/firefox/refs/heads/main/python/mozboot/bin/bootstrap.py"
    $bootstrapFile = "$env:TEMP\mozilla-bootstrap.py"

    try {
        Invoke-WebRequest -Uri $bootstrapUrl -OutFile $bootstrapFile -UseBasicParsing
    } catch {
        Write-Warn "Failed to download bootstrap.py. Check your internet connection."
        exit 1
    }

    Write-Host "  Downloaded bootstrap.py"
    & python $bootstrapFile
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "bootstrap.py exited with code $LASTEXITCODE."
        Write-Warn "You may need to run it manually or use the MozillaBuild shell."
    }

    Remove-Item $bootstrapFile -ErrorAction SilentlyContinue
}

# --- 7. Long paths ----------------------------------------------------------

Write-Step "Checking Windows long-path support ..."

$longPaths = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
if ($longPaths.LongPathsEnabled -ne 1) {
    Write-Warn "Long paths are NOT enabled."
    Write-Host ""
    Write-Host "  Run (as Administrator):"
    Write-Host '    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force'
    Write-Host ""
    Write-Host "  And enable Git long paths:"
    Write-Host "    git config --global core.longpaths true"
} else {
    Write-Host "  OK: Long paths enabled"
}

# --- Done -------------------------------------------------------------------

Write-Host ""
Write-Step "Dependency checks complete."
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Clone Firefox:  bash scripts/setup-firefox.sh"
Write-Host "  2. Apply patches:  bash scripts/apply.sh"
Write-Host "  3. Build:          .\scripts\build-windows.ps1"
Write-Host ""
