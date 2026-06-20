#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const repoRoot = process.cwd();
const options = parseArgs(process.argv.slice(2));
const errors = [];
const warnings = [];
const notes = [];
const shouldCheckDistMetadata = Boolean(
  options.releaseVersion ||
    options.checkDist ||
    options.requireUpdateManifest ||
    options.requiredPlatforms.length
);

const paths = {
  manifest: "manifest.toml",
  cargo: "hil/Cargo.toml",
  hilMain: "hil/src/main.rs",
  updateGenerator: "scripts/generate-update-manifest.mjs",
  displayPatch: "changes/browser/config/version.patch",
  flatpakManifest: "org.gkdevstudio.Hilal.yml",
  flatpakMetainfo: "flatpak/org.gkdevstudio.Hilal.metainfo.xml",
  updateManifest: "dist/hilal-update-manifest.json",
  releaseWorkflow: ".github/workflows/release.yml",
  verifyWorkflow: ".github/workflows/verify-patches.yml",
  linuxMozconfig: "mozconfigs/linux",
  windowsMozconfig: "mozconfigs/windows",
};

const metadata = {
  manifestVersion: readTomlSectionValue(paths.manifest, "browser", "version"),
  cargoVersion: readTomlSectionValue(paths.cargo, "package", "version"),
  displayVersion: readDisplayVersion(paths.displayPatch),
  flatpakSourceTag: readFlatpakSourceTag(paths.flatpakManifest),
  flatpakRelease: readFlatpakRelease(paths.flatpakMetainfo),
  distUpdateManifest: shouldCheckDistMetadata
    ? readJsonIfExists(paths.updateManifest)
    : null,
};

checkTomlParses(paths.manifest);
checkTomlParses(paths.cargo);
requireValue("manifest.toml [browser].version", metadata.manifestVersion);
requireValue("hil/Cargo.toml [package].version", metadata.cargoVersion);
requireValue("browser display version patch", metadata.displayVersion);
requireValue("Flatpak source tag", metadata.flatpakSourceTag);
requireValue("Flatpak metainfo latest release", metadata.flatpakRelease?.version);

checkManifestPaths();
checkHilCliVersionSource();
checkHilCliVersionOutput();
checkUpdateGeneratorSourcePath();
checkStaleFirefoxFallbacks();
checkFlatpakScreenshotTags();
checkCiBuildConfiguration();

if (metadata.displayVersion && metadata.flatpakRelease?.version) {
  compareOrWarn(
    "browser display version",
    metadata.displayVersion,
    "Flatpak metainfo release version",
    metadata.flatpakRelease.version
  );
}

if (metadata.manifestVersion && metadata.displayVersion) {
  compareManifestAndDisplayVersions();
}

if (metadata.distUpdateManifest) {
  compareOrWarn(
    "dist update manifest version",
    metadata.distUpdateManifest.version,
    "browser display version",
    metadata.displayVersion
  );
  compareOrWarn(
    "dist update manifest displayVersion",
    metadata.distUpdateManifest.displayVersion,
    "browser display version",
    metadata.displayVersion
  );
  if (!isFirefoxAppVersion(metadata.distUpdateManifest.appVersion)) {
    warnings.push(
      `dist update manifest appVersion should be a modern Firefox/Gecko version, got ${metadata.distUpdateManifest.appVersion}.`
    );
  }
}

if (options.releaseVersion) {
  checkStrictRelease(options.releaseVersion, options.releaseTag);
}

printSummary();

if (errors.length > 0) {
  console.error("\nRelease metadata check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

if (warnings.length > 0) {
  console.log("\nWarnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}

if (notes.length > 0) {
  console.log("\nNotes:");
  for (const note of notes) {
    console.log(`- ${note}`);
  }
}

console.log("\nRelease metadata check passed.");

function parseArgs(args) {
  const parsed = {
    checkDist: false,
    requireUpdateManifest: false,
    requiredPlatforms: [],
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "-h" || arg === "--help") {
      usage(0);
    } else if (arg === "--release-version") {
      parsed.releaseVersion = stripTagPrefix(requireArg(arg, next));
      i += 1;
    } else if (arg === "--release-tag") {
      parsed.releaseTag = requireArg(arg, next);
      i += 1;
    } else if (arg === "--check-dist") {
      parsed.checkDist = true;
    } else if (arg === "--require-update-manifest") {
      parsed.requireUpdateManifest = true;
    } else if (arg === "--hil-bin") {
      parsed.hilBin = requireArg(arg, next);
      i += 1;
    } else if (arg === "--require-platform") {
      parsed.requiredPlatforms.push(requireArg(arg, next));
      i += 1;
    } else {
      console.error(`Unknown argument: ${arg}`);
      usage(1);
    }
  }

  return parsed;
}

function requireArg(arg, value) {
  if (!value || value.startsWith("--")) {
    console.error(`Missing value for ${arg}`);
    usage(1);
  }
  return value;
}

function usage(code) {
  console.error(`Usage:
  scripts/check-release-metadata.mjs
  scripts/check-release-metadata.mjs --hil-bin ./bin/hil
  scripts/check-release-metadata.mjs --release-version 0.3.0 --release-tag v0.3.0 --check-dist --require-update-manifest --require-platform macos-arm64

Default mode validates fast repo guardrails and allows normal next-version
development drift. Release mode additionally requires manifest, browser display
version, Flatpak metadata, update manifest, and optional dist artifact names to
agree with one release version.`);
  process.exit(code);
}

function abs(file) {
  return resolve(repoRoot, file);
}

function readText(file) {
  return readFileSync(abs(file), "utf8");
}

function checkTomlParses(file) {
  if (!existsSync(abs(file))) {
    return;
  }

  const result = spawnSync(
    "python3",
    [
      "-c",
      "import sys\ntry:\n import tomllib\nexcept ModuleNotFoundError:\n sys.exit(2)\ntomllib.load(open(sys.argv[1], 'rb'))",
      abs(file),
    ],
    { encoding: "utf8" }
  );

  if (result.error) {
    notes.push(`Skipped TOML parser check for ${file}: python3 is not available.`);
  } else if (result.status === 2) {
    notes.push(`Skipped TOML parser check for ${file}: python3 tomllib is not available.`);
  } else if (result.status !== 0) {
    errors.push(`${file} is not valid TOML: ${result.stderr.trim()}`);
  }
}

function readTomlSectionValue(file, section, key) {
  if (!existsSync(abs(file))) {
    return "";
  }

  let currentSection = "";
  for (const rawLine of readText(file).split(/\r?\n/)) {
    const line = rawLine.trim();
    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      continue;
    }
    if (currentSection !== section) {
      continue;
    }
    const valueMatch = line.match(new RegExp(`^${key}\\s*=\\s*"([^"]+)"`));
    if (valueMatch) {
      return valueMatch[1];
    }
  }
  return "";
}

function readDisplayVersion(file) {
  if (!existsSync(abs(file))) {
    return "";
  }

  for (const line of readText(file).split(/\r?\n/)) {
    if (line.startsWith("+++") || !line.startsWith("+")) {
      continue;
    }
    const value = line.slice(1).trim();
    if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value)) {
      return value;
    }
  }
  return "";
}

function readFlatpakSourceTag(file) {
  if (!existsSync(abs(file))) {
    return "";
  }

  const text = readText(file);
  const yamlMatch = text.match(/^\s*tag:\s*["']?([^"'\s#]+)["']?/m);
  if (yamlMatch) {
    return yamlMatch[1];
  }

  const jsonMatch = text.match(/"tag"\s*:\s*"([^"]+)"/);
  return jsonMatch?.[1] || "";
}

function readFlatpakRelease(file) {
  if (!existsSync(abs(file))) {
    return null;
  }

  const releaseMatch = readText(file).match(/<release\s+([^>]+)>/);
  if (!releaseMatch) {
    return null;
  }

  const attrs = {};
  for (const attr of releaseMatch[1].matchAll(/([A-Za-z_:-]+)="([^"]*)"/g)) {
    attrs[attr[1]] = attr[2];
  }
  return attrs;
}

function readJsonIfExists(file) {
  if (!existsSync(abs(file))) {
    return null;
  }
  return JSON.parse(readText(file));
}

function requireValue(label, value) {
  if (!value) {
    errors.push(`Missing ${label}.`);
  }
}

function checkManifestPaths() {
  if (!existsSync(abs(paths.manifest))) {
    return;
  }

  const text = readText(paths.manifest);
  for (const match of text.matchAll(/^\s*path\s*=\s*"([^"]+)"/gm)) {
    const patchPath = match[1];
    if (!existsSync(abs(join("changes", patchPath)))) {
      errors.push(`manifest.toml declares missing path: changes/${patchPath}`);
    }
  }
}

function checkHilCliVersionSource() {
  if (!existsSync(abs(paths.hilMain))) {
    return;
  }

  const text = readText(paths.hilMain);
  if (/#\[command\([^\]]*version\s*=\s*"[^"]+"/s.test(text)) {
    errors.push("hil CLI version is hardcoded; use Cargo package metadata.");
  }
}

function checkHilCliVersionOutput() {
  if (!options.hilBin) {
    return;
  }

  const hilBin = resolve(repoRoot, options.hilBin);
  if (!existsSync(hilBin)) {
    errors.push(`hil binary not found for --hil-bin: ${options.hilBin}`);
    return;
  }

  const result = spawnSync(hilBin, ["--version"], { encoding: "utf8" });
  if (result.error) {
    errors.push(`Failed to run ${options.hilBin} --version: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    errors.push(
      `${options.hilBin} --version failed: ${(result.stderr || result.stdout).trim()}`
    );
    return;
  }

  const version = result.stdout.trim().match(/\b(\d+\.\d+\.\d+(?:-[^\s]+)?)$/)?.[1];
  if (!version) {
    errors.push(`${options.hilBin} --version did not print a parseable version.`);
    return;
  }
  requireEqual("hil --version", version, metadata.cargoVersion);
}

function checkUpdateGeneratorSourcePath() {
  if (!existsSync(abs(paths.updateGenerator))) {
    return;
  }

  const text = readText(paths.updateGenerator);
  if (text.includes('resolve("firefox/browser/config/version.txt")')) {
    errors.push(
      "update manifest generator still reads firefox/browser/config/version.txt; use HILAL_FIREFOX_SRC or engine/."
    );
  }
}

function checkStaleFirefoxFallbacks() {
  const tracked = spawnSync("git", ["ls-files", "scripts", "hil"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (tracked.status !== 0) {
    warnings.push("Could not scan tracked scripts for stale firefox/ fallbacks.");
    return;
  }

  const patterns = [
    [/repo_root\.join\("firefox"\)/, "legacy firefox/ setup fallback"],
    [/\bfirefox\/mozconfig\b/, "legacy firefox/mozconfig path"],
    [/\bfirefox\/<objdir>\b/, "legacy firefox/<objdir> path"],
    [/\bfirefox\/browser\/locales\/tr\b/, "legacy firefox/browser locale path"],
  ];

  for (const file of tracked.stdout.split(/\r?\n/).filter(Boolean)) {
    if (file === paths.updateGenerator || file === "scripts/check-release-metadata.mjs") {
      continue;
    }
    const text = readText(file);
    const lines = text.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.includes("mozilla-firefox/firefox") || line.includes("firefox-ui-fix")) {
        continue;
      }
      for (const [pattern, label] of patterns) {
        if (pattern.test(line)) {
          errors.push(`${file}:${index + 1} contains ${label}; use engine/ or HILAL_FIREFOX_SRC.`);
        }
      }
    }
  }
}

function checkFlatpakScreenshotTags() {
  if (!existsSync(abs(paths.flatpakMetainfo)) || !metadata.flatpakRelease?.version) {
    return;
  }

  const expectedTag = `v${metadata.flatpakRelease.version}`;
  for (const match of readText(paths.flatpakMetainfo).matchAll(
    /raw\.githubusercontent\.com\/VastSea0\/hilal-browser\/(v[^/]+)\//g
  )) {
    if (match[1] !== expectedTag) {
      errors.push(
        `Flatpak screenshot URL uses ${match[1]}, expected ${expectedTag}.`
      );
    }
  }
}

function checkCiBuildConfiguration() {
  const requiredPatterns = [
    [
      paths.linuxMozconfig,
      /MOZ_MAKE_FLAGS="-j2"/,
      "Linux CI build must remain capped at two parallel jobs.",
    ],
    [
      paths.linuxMozconfig,
      /ac_add_options --disable-debug-symbols/,
      "Linux CI build must disable unpublished debug symbols.",
    ],
    [
      paths.windowsMozconfig,
      /MOZ_MAKE_FLAGS="-j1"/,
      "Windows CI build must remain single-threaded to avoid rustc/clang OOM failures.",
    ],
    [
      paths.windowsMozconfig,
      /ac_add_options --disable-debug-symbols/,
      "Windows CI build must disable unpublished debug symbols.",
    ],
    [
      paths.releaseWorkflow,
      /name: Configure build swap/,
      "Linux release workflow must configure swap before the Firefox build.",
    ],
  ];

  for (const [file, pattern, message] of requiredPatterns) {
    if (!existsSync(abs(file)) || !pattern.test(readText(file))) {
      errors.push(message);
    }
  }

  const obsoleteActions = [
    "actions/checkout@v4",
    "actions/cache@v4",
    "actions/upload-artifact@v4",
    "actions/download-artifact@v4",
    "softprops/action-gh-release@v2",
    "mozilla-actions/sccache-action@v0.0.8",
  ];

  for (const file of [paths.releaseWorkflow, paths.verifyWorkflow]) {
    if (!existsSync(abs(file))) {
      continue;
    }
    const workflow = readText(file);
    for (const action of obsoleteActions) {
      if (workflow.includes(action)) {
        errors.push(`${file} still uses the Node 20 action ${action}.`);
      }
    }
  }
}

function compareOrWarn(leftLabel, left, rightLabel, right) {
  if (left !== right) {
    warnings.push(`${leftLabel} (${left}) differs from ${rightLabel} (${right}).`);
  }
}

function compareManifestAndDisplayVersions() {
  if (metadata.manifestVersion === metadata.displayVersion) {
    return;
  }

  if (
    !options.releaseVersion &&
    isVersionAhead(metadata.manifestVersion, metadata.displayVersion)
  ) {
    notes.push(
      `manifest.toml browser.version (${metadata.manifestVersion}) is ahead of the current browser display version (${metadata.displayVersion}) for active development. Strict release checks still require them to match.`
    );
    return;
  }

  compareOrWarn(
    "manifest.toml browser.version",
    metadata.manifestVersion,
    "browser display version",
    metadata.displayVersion
  );
}

function checkStrictRelease(version, releaseTag) {
  const expectedTag = releaseTag || `v${version}`;

  requireEqual("manifest.toml [browser].version", metadata.manifestVersion, version);
  requireEqual("browser display version", metadata.displayVersion, version);
  requireEqual("Flatpak source tag", metadata.flatpakSourceTag, expectedTag);
  requireEqual("Flatpak metainfo release version", metadata.flatpakRelease?.version, version);

  if (isPrerelease(version)) {
    requireEqual("Flatpak metainfo release type", metadata.flatpakRelease?.type, "development");
  } else if (metadata.flatpakRelease?.type === "development") {
    errors.push("Stable release metadata must not be marked type=\"development\".");
  }

  if (metadata.distUpdateManifest) {
    checkUpdateManifest(metadata.distUpdateManifest, version, expectedTag);
  } else if (options.requireUpdateManifest) {
    errors.push("Missing dist/hilal-update-manifest.json.");
  }

  if (options.checkDist) {
    checkDistArtifactNames(version);
  }
}

function requireEqual(label, actual, expected) {
  if (actual !== expected) {
    errors.push(`${label} is ${actual || "<missing>"}, expected ${expected}.`);
  }
}

function checkDistArtifactNames(version) {
  const expectedTag = options.releaseTag || `v${version}`;
  const distDir = abs("dist");
  if (!existsSync(distDir)) {
    errors.push("dist/ does not exist.");
    return;
  }

  for (const name of readdirSync(distDir)) {
    if (!/(hilal|Hilal-Browser)/.test(name) || !/\d+\.\d+\.\d+/.test(name)) {
      continue;
    }
    if (!name.includes(version) && !name.includes(`v${version}`)) {
      errors.push(`dist artifact ${name} does not include release version ${version}.`);
    }
  }

  for (const platform of options.requiredPlatforms || []) {
    for (const artifact of expectedDistArtifacts(expectedTag, platform)) {
      if (!existsSync(resolve(distDir, artifact))) {
        errors.push(`Missing required dist artifact for ${platform}: ${artifact}`);
      }
    }
  }
}

function checkUpdateManifest(manifest, version, expectedTag) {
  requireEqual("dist update manifest version", manifest.version, version);
  requireEqual("dist update manifest displayVersion", manifest.displayVersion, version);
  if (!isFirefoxAppVersion(manifest.appVersion)) {
    errors.push(
      `dist update manifest appVersion must be a modern Firefox/Gecko version, got ${manifest.appVersion}.`
    );
  }
  if (manifest.firefoxVersion && !isFirefoxAppVersion(manifest.firefoxVersion)) {
    errors.push(
      `dist update manifest firefoxVersion must be a modern Firefox/Gecko version, got ${manifest.firefoxVersion}.`
    );
  }
  if (manifest.platformVersion && !isFirefoxAppVersion(manifest.platformVersion)) {
    errors.push(
      `dist update manifest platformVersion must be a modern Firefox/Gecko version, got ${manifest.platformVersion}.`
    );
  }
  if (!/^\d{14}$/.test(String(manifest.buildID || ""))) {
    errors.push(`dist update manifest buildID must be YYYYMMDDHHMMSS, got ${manifest.buildID || "<missing>"}.`);
  }
  if (!manifest.channel) {
    errors.push("dist update manifest is missing channel.");
  }

  const entries = Array.isArray(manifest.updates) ? manifest.updates : [];
  if (entries.length === 0) {
    errors.push("dist update manifest has no updates entries.");
  }

  for (const entry of entries) {
    checkUpdateManifestEntry(entry, manifest, expectedTag);
  }

  for (const platform of options.requiredPlatforms || []) {
    if (!entries.some(entry => entry.platform === platform)) {
      errors.push(`dist update manifest is missing required platform ${platform}.`);
    }
  }
}

function checkUpdateManifestEntry(entry, manifest, expectedTag) {
  if (!entry.platform) {
    errors.push("dist update manifest entry is missing platform.");
  }
  if (!entry.url || !entry.url.startsWith("https://")) {
    errors.push(`dist update manifest entry ${entry.platform || "<unknown>"} has invalid HTTPS URL.`);
  } else if (!entry.url.includes(`/download/${expectedTag}/`)) {
    errors.push(`dist update manifest entry ${entry.platform} URL does not point at release ${expectedTag}.`);
  }
  if ((entry.hashFunction || "sha512").toLowerCase() !== "sha512") {
    errors.push(`dist update manifest entry ${entry.platform} must use sha512.`);
  }
  if (!/^[a-f0-9]{128}$/i.test(String(entry.hashValue || ""))) {
    errors.push(`dist update manifest entry ${entry.platform} has invalid sha512 hash.`);
  }
  if (!Number.isFinite(Number(entry.size)) || Number(entry.size) <= 0) {
    errors.push(`dist update manifest entry ${entry.platform} has invalid size.`);
  }
  const appVersion = entry.appVersion || entry.firefoxVersion || manifest.appVersion;
  if (!isFirefoxAppVersion(appVersion)) {
    errors.push(`dist update manifest entry ${entry.platform} has invalid appVersion ${appVersion || "<missing>"}.`);
  }
  const buildID = entry.buildID || manifest.buildID;
  if (!/^\d{14}$/.test(String(buildID || ""))) {
    errors.push(`dist update manifest entry ${entry.platform} has invalid buildID ${buildID || "<missing>"}.`);
  }

  if (options.checkDist && entry.url) {
    const localMar = resolve(repoRoot, "dist", basename(new URL(entry.url).pathname));
    if (existsSync(localMar)) {
      const localSize = statSync(localMar).size;
      if (Number(entry.size) !== localSize) {
        errors.push(`dist update manifest entry ${entry.platform} size does not match ${basename(localMar)}.`);
      }
      const localHash = sha512(localMar);
      if (String(entry.hashValue || "").toLowerCase() !== localHash) {
        errors.push(`dist update manifest entry ${entry.platform} hash does not match ${basename(localMar)}.`);
      }
    } else {
      errors.push(`dist update manifest entry ${entry.platform} references missing local MAR ${basename(localMar)}.`);
    }
  }
}

function expectedDistArtifacts(releaseTag, platform) {
  if (platform === "macos-arm64") {
    return [
      `Hilal-Browser-${releaseTag}-macOS.dmg`,
      `hilal-${releaseTag}-macos-arm64.complete.mar`,
      "hilal-update-manifest.json",
    ];
  }
  return [`hilal-${releaseTag}-${platform}.complete.mar`];
}

function sha512(file) {
  return createHash("sha512").update(readFileSync(file)).digest("hex");
}

function stripTagPrefix(version) {
  return String(version).replace(/^v/i, "");
}

function isPrerelease(version) {
  return /(?:alpha|beta|rc|nightly|dev)/i.test(version);
}

function isVersionAhead(candidate, current) {
  const candidateParts = parseReleaseVersion(candidate);
  const currentParts = parseReleaseVersion(current);
  if (!candidateParts || !currentParts) {
    return false;
  }
  for (let index = 0; index < candidateParts.length; index += 1) {
    if (candidateParts[index] > currentParts[index]) {
      return true;
    }
    if (candidateParts[index] < currentParts[index]) {
      return false;
    }
  }
  return false;
}

function parseReleaseVersion(version) {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return null;
  }
  return match.slice(1).map(Number);
}

function isFirefoxAppVersion(version) {
  const value = String(version || "");
  const major = Number(value.match(/^(\d+)/)?.[1] || 0);
  return major >= 100 && /^\d+(?:\.\d+)*(?:(?:a|b)\d+|esr)?$/i.test(value);
}

function printSummary() {
  const rows = [
    ["manifest.toml browser.version", metadata.manifestVersion],
    ["hil/Cargo.toml package.version", metadata.cargoVersion],
    ["browser display version", metadata.displayVersion],
    ["Flatpak source tag", metadata.flatpakSourceTag],
    [
      "Flatpak metainfo release",
      metadata.flatpakRelease
        ? `${metadata.flatpakRelease.version} (${metadata.flatpakRelease.type || "no type"})`
        : "",
    ],
    [
      "dist update manifest",
      !shouldCheckDistMetadata
        ? "not checked in default guardrail mode"
        : metadata.distUpdateManifest
        ? `${metadata.distUpdateManifest.version} display=${metadata.distUpdateManifest.displayVersion} app=${metadata.distUpdateManifest.appVersion}`
        : "not present",
    ],
  ];

  console.log("Release metadata summary:");
  for (const [label, value] of rows) {
    console.log(`- ${label}: ${value || "<missing>"}`);
  }

  if (options.releaseVersion) {
    console.log(`- strict release version: ${options.releaseVersion}`);
    console.log(`- strict release tag: ${options.releaseTag || `v${options.releaseVersion}`}`);
  }
}
