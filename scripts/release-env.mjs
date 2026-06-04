#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const options = parseArgs(process.argv.slice(2));
const repoRoot = process.cwd();
const tag = options.tag || process.env.GITHUB_REF_NAME || "";
const version = stripTagPrefix(tag);

if (!tag || !/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag)) {
  fail(`Release tag must look like v0.3.0 or v0.3.0-alpha.1, got '${tag || "<missing>"}'.`);
}

const channel = options.channel || "hilal-release";
const firefoxAppVersion = readFirefoxVersion(options.firefoxSrc);
const values = {
  tag,
  version,
  display_version: version,
  channel,
  prerelease: String(isPrerelease(version)),
  firefox_app_version: firefoxAppVersion,
  macos_arm64_dmg: `Hilal-Browser-${tag}-macOS.dmg`,
  macos_arm64_mar: `hilal-${tag}-macos-arm64.complete.mar`,
  update_manifest: "hilal-update-manifest.json",
  checksums: "SHA256SUMS",
  sbom: "hilal-browser-sbom.spdx.json",
};

if (options.requireFirefoxVersion && !firefoxAppVersion) {
  fail("Could not read Firefox app version. Pass --firefox-src or set HILAL_FIREFOX_SRC.");
}

if (firefoxAppVersion && !isFirefoxAppVersion(firefoxAppVersion)) {
  fail(`Firefox app version must be a modern Firefox/Gecko version, got ${firefoxAppVersion}.`);
}

if (options.githubOutput) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  await import("node:fs").then(({ appendFileSync }) => {
    appendFileSync(options.githubOutput, `${lines.join("\n")}\n`);
  });
} else if (options.json) {
  console.log(JSON.stringify(values, null, 2));
} else {
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}=${shellEscape(value)}`);
  }
}

function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "-h" || arg === "--help") {
      usage(0);
    } else if (arg === "--tag") {
      parsed.tag = requireValue(arg, next);
      i += 1;
    } else if (arg === "--channel") {
      parsed.channel = requireValue(arg, next);
      i += 1;
    } else if (arg === "--firefox-src") {
      parsed.firefoxSrc = requireValue(arg, next);
      i += 1;
    } else if (arg === "--require-firefox-version") {
      parsed.requireFirefoxVersion = true;
    } else if (arg === "--github-output") {
      parsed.githubOutput = requireValue(arg, next);
      i += 1;
    } else if (arg === "--json") {
      parsed.json = true;
    } else {
      fail(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

function usage(code) {
  console.error(`Usage:
  scripts/release-env.mjs --tag v0.3.0
  scripts/release-env.mjs --tag v0.3.0 --firefox-src engine --require-firefox-version --github-output "$GITHUB_OUTPUT"

Derives canonical release environment values: version, tag, prerelease flag,
channel, Firefox app version, and standard artifact filenames.`);
  process.exit(code);
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    fail(`Missing value for ${arg}`);
  }
  return value;
}

function readFirefoxVersion(firefoxSrc) {
  const sourceRoot = firefoxSrc || process.env.HILAL_FIREFOX_SRC || "engine";
  const file = resolve(repoRoot, sourceRoot, "browser/config/version.txt");
  if (!existsSync(file)) {
    return "";
  }
  return readFileSync(file, "utf8").trim();
}

function stripTagPrefix(value) {
  return String(value || "").replace(/^v/i, "");
}

function isPrerelease(value) {
  return /(?:^|[.-])(?:alpha|beta|rc|nightly|dev)(?:[.-]|\d|$)/i.test(value);
}

function isFirefoxAppVersion(value) {
  const version = String(value || "");
  const major = Number(version.match(/^(\d+)/)?.[1] || 0);
  return major >= 100 && /^\d+(?:\.\d+)*(?:(?:a|b)\d+|esr)?$/i.test(version);
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
