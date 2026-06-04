#!/usr/bin/env node
import { readFileSync } from "node:fs";

const options = parseArgs(process.argv.slice(2));
const errors = [];
const tag = options.tag || "";
const version = stripTagPrefix(tag);

if (!tag) {
  errors.push("Missing --tag.");
}

const release = options.releaseJson ? readReleaseJson(options.releaseJson) : null;
if (!options.releaseJson) {
  errors.push("Missing --release-json.");
} else {
  if (!release) {
    finish();
  }

  const names = assetNames(release);
  const expectedPrerelease = isPrerelease(version);
  if (Boolean(release.isPrerelease ?? release.prerelease) !== expectedPrerelease) {
    errors.push(
      `GitHub release prerelease flag is ${Boolean(release.isPrerelease ?? release.prerelease)}, expected ${expectedPrerelease}.`
    );
  }

  requireAsset(names, "hilal-update-manifest.json");
  requireAsset(names, "SHA256SUMS");
  requireAsset(names, "hilal-browser-sbom.spdx.json");

  for (const platform of options.platforms) {
    for (const name of expectedPlatformAssets(tag, platform)) {
      requireAsset(names, name);
    }
  }
}

if (errors.length > 0) {
  finish();
}

console.log("Release asset check passed.");

function finish() {
  console.error("Release asset check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

function parseArgs(args) {
  const parsed = {
    platforms: [],
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "-h" || arg === "--help") {
      usage(0);
    } else if (arg === "--release-json") {
      parsed.releaseJson = requireValue(arg, next);
      i += 1;
    } else if (arg === "--tag") {
      parsed.tag = requireValue(arg, next);
      i += 1;
    } else if (arg === "--platform") {
      parsed.platforms.push(requireValue(arg, next));
      i += 1;
    } else {
      console.error(`Unknown argument: ${arg}`);
      usage(1);
    }
  }
  if (parsed.platforms.length === 0) {
    parsed.platforms.push("macos-arm64");
  }
  return parsed;
}

function usage(code) {
  console.error(`Usage:
  scripts/check-release-assets.mjs --release-json release.json --tag v0.3.0 --platform macos-arm64

Validates the GitHub Release prerelease flag and required release assets before
the draft is published.`);
  process.exit(code);
}

function readReleaseJson(file) {
  if (!file) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Could not read release JSON ${file}: ${error.message}`);
    return null;
  }
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    console.error(`Missing value for ${arg}`);
    usage(1);
  }
  return value;
}

function assetNames(release) {
  const assets = Array.isArray(release.assets) ? release.assets : [];
  return new Set(assets.map(asset => String(asset.name || "")));
}

function requireAsset(names, name) {
  if (!names.has(name)) {
    errors.push(`Missing release asset: ${name}`);
  }
}

function expectedPlatformAssets(releaseTag, platform) {
  if (platform === "macos-arm64") {
    return [
      `Hilal-Browser-${releaseTag}-macOS.dmg`,
      `hilal-${releaseTag}-macos-arm64.complete.mar`,
    ];
  }
  return [`hilal-${releaseTag}-${platform}.complete.mar`];
}

function stripTagPrefix(value) {
  return String(value || "").replace(/^v/i, "");
}

function isPrerelease(value) {
  return /(?:^|[.-])(?:alpha|beta|rc|nightly|dev)(?:[.-]|\d|$)/i.test(value);
}
