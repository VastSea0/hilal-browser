#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";

const args = process.argv.slice(2);

const options = {
  channel: "hilal-release",
  output: "dist/hilal-update-manifest.json",
  detailsURL: "https://hilal.gkdevstudio.org/#surumler",
  mar: new Map(),
  marUrl: new Map(),
};

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  const next = args[i + 1];
  if (arg === "-h" || arg === "--help") {
    usage(0);
  } else if (arg === "--version") {
    options.version = requireValue(arg, next);
    i += 1;
  } else if (arg === "--display-version") {
    options.displayVersion = requireValue(arg, next);
    i += 1;
  } else if (arg === "--app-version") {
    options.appVersion = requireValue(arg, next);
    i += 1;
  } else if (arg === "--platform-version") {
    options.platformVersion = requireValue(arg, next);
    i += 1;
  } else if (arg === "--build-id") {
    options.buildID = requireValue(arg, next);
    i += 1;
  } else if (arg === "--channel") {
    options.channel = requireValue(arg, next);
    i += 1;
  } else if (arg === "--details-url") {
    options.detailsURL = requireValue(arg, next);
    i += 1;
  } else if (arg === "--output") {
    options.output = requireValue(arg, next);
    i += 1;
  } else if (arg === "--mar") {
    const [platform, file] = splitPair(requireValue(arg, next), arg);
    options.mar.set(platform, file);
    i += 1;
  } else if (arg === "--mar-url") {
    const [platform, url] = splitPair(requireValue(arg, next), arg);
    options.marUrl.set(platform, url);
    i += 1;
  } else {
    console.error(`Unknown argument: ${arg}`);
    usage(1);
  }
}

if (!options.version) {
  console.error("Missing --version");
  usage(1);
}

if (!options.appVersion) {
  options.appVersion = readFirefoxVersion();
}

if (!options.appVersion) {
  console.error(
    "Missing --app-version. This must be the Firefox/Gecko version from browser/config/version.txt, not the Hilal release version."
  );
  usage(1);
}

options.appVersion = stripTagPrefix(options.appVersion);
if (!isFirefoxAppVersion(options.appVersion)) {
  console.error(
    `Invalid --app-version '${options.appVersion}'. Expected a modern Firefox version such as 153.0a1, 152.0, or 140.0.1esr.`
  );
  process.exit(1);
}

if (!options.buildID) {
  options.buildID = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
}

if (options.mar.size === 0) {
  console.error("At least one --mar platform=path entry is required");
  usage(1);
}

const updates = [];

for (const [platform, file] of options.mar.entries()) {
  const absolute = resolve(file);
  const size = statSync(absolute).size;
  const hashValue = await sha512(absolute);
  const url =
    options.marUrl.get(platform) ||
    joinUrl(process.env.HILAL_MAR_BASE_URL || "", basename(file));

  if (!url || !url.startsWith("https://")) {
    console.error(
      `Missing HTTPS URL for ${platform}. Pass --mar-url ${platform}=https://... or set HILAL_MAR_BASE_URL.`
    );
    process.exit(1);
  }

  updates.push({
    platform,
    url,
    hashFunction: "sha512",
    hashValue,
    size,
    type: "minor",
  });
}

const manifest = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  version: stripTagPrefix(options.version),
  displayVersion: stripTagPrefix(options.displayVersion || options.version),
  firefoxVersion: options.appVersion,
  appVersion: options.appVersion,
  platformVersion: stripTagPrefix(options.platformVersion || options.appVersion),
  buildID: options.buildID,
  channel: options.channel,
  detailsURL: options.detailsURL,
  actions: "showURL",
  updates,
};

writeFileSync(options.output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Update manifest written: ${options.output}`);
for (const update of updates) {
  console.log(
    `${update.platform}: ${update.size} bytes sha512=${update.hashValue}`
  );
}

function requireValue(arg, value) {
  if (!value || value.startsWith("--")) {
    console.error(`Missing value for ${arg}`);
    usage(1);
  }
  return value;
}

function splitPair(value, arg) {
  const index = value.indexOf("=");
  if (index <= 0 || index === value.length - 1) {
    console.error(`${arg} expects platform=value`);
    usage(1);
  }
  return [value.slice(0, index), value.slice(index + 1)];
}

function joinUrl(base, file) {
  if (!base) {
    return "";
  }
  return `${base.replace(/\/+$/, "")}/${encodeURIComponent(file)}`;
}

function stripTagPrefix(version) {
  return String(version).replace(/^v/i, "");
}

function readFirefoxVersion() {
  const sourceRoot = process.env.HILAL_FIREFOX_SRC || "engine";
  const file = resolve(sourceRoot, "browser/config/version.txt");
  if (!existsSync(file)) {
    return "";
  }
  return readFileSync(file, "utf8").trim();
}

function isFirefoxAppVersion(version) {
  const major = Number(String(version || "").match(/^(\d+)/)?.[1] || 0);
  return major >= 100 && /^\d+(?:\.\d+)*(?:(?:a|b)\d+|esr)?$/i.test(version);
}

function sha512(file) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha512");
    const stream = createReadStream(file);
    stream.on("data", chunk => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}

function usage(code) {
  console.error(`Usage:
  scripts/generate-update-manifest.mjs --version <hilal-version> --app-version <firefox-version> --build-id <YYYYMMDDHHMMSS> \\
    --mar <platform>=<path/to/file.mar> --mar-url <platform>=<https://github.com/.../file.mar> \\
    [--mar <platform>=<path/to/another.mar> --mar-url <platform>=<https://...>] \\
    [--channel hilal-release] [--output dist/hilal-update-manifest.json]

Platforms:
  macos-x86_64, macos-arm64, linux-x86_64, linux-arm64, windows-x86_64, windows-arm64

The generated JSON must be uploaded to the same GitHub release as the MAR files.
  --app-version must be the Firefox/Gecko version shipped in the build, for example 153.0a1.
The website update endpoint serves an update only when platform, channel, URL,
sha512 hash, and size are all present.`);
  process.exit(code);
}
