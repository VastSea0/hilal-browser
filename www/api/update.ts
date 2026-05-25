import type { IncomingMessage, ServerResponse } from "node:http";
import {
  fetchJsonAsset,
  fetchLatestRelease,
  findUpdateManifestAsset,
  type ReleaseSummary,
  type UpdateManifest,
  type UpdateManifestEntry,
} from "../server/github.ts";

interface UpdateRequest {
  product: string;
  version: string;
  buildID: string;
  buildTarget: string;
  locale: string;
  channel: string;
}

const EMPTY_UPDATES = `<?xml version="1.0"?>
<updates>
</updates>
`;

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  res.setHeader("Content-Type", "text/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const updateRequest = parseUpdateRequest(req);
    if (!updateRequest) {
      return sendEmpty(res);
    }

    const expectedChannel = process.env.HILAL_UPDATE_CHANNEL || "hilal-release";
    if (updateRequest.channel !== expectedChannel) {
      return sendEmpty(res);
    }

    const release = await fetchLatestRelease();
    if (!release) {
      return sendEmpty(res);
    }

    const entry = await resolveUpdateEntry(release, updateRequest);
    if (!entry || !isValidEntry(entry)) {
      return sendEmpty(res);
    }

    if (!shouldOfferUpdate(updateRequest, release, entry)) {
      return sendEmpty(res);
    }

    res.statusCode = 200;
    res.end(buildUpdateXml(release, entry));
  } catch (error) {
    sendEmpty(res);
  }
}

function parseUpdateRequest(req: IncomingMessage): UpdateRequest | null {
  const url = new URL(req.url || "", "https://updates.hilal.local");
  const rawPath = url.searchParams.get("path") || "";
  const segments = rawPath.split("/").filter(Boolean);

  if (segments.length < 11 || segments[0] !== "6") {
    return null;
  }

  return {
    product: decodeURIComponent(segments[1] || ""),
    version: decodeURIComponent(segments[2] || ""),
    buildID: decodeURIComponent(segments[3] || ""),
    buildTarget: decodeURIComponent(segments[4] || ""),
    locale: decodeURIComponent(segments[5] || ""),
    channel: decodeURIComponent(segments[6] || ""),
  };
}

async function resolveUpdateEntry(
  release: ReleaseSummary,
  request: UpdateRequest
): Promise<UpdateManifestEntry | null> {
  const platform = detectPlatform(request.buildTarget);
  const envEntry = resolveEnvEntry(platform, release);
  if (envEntry) {
    return envEntry;
  }

  const manifestAsset = findUpdateManifestAsset(release);
  if (!manifestAsset) {
    return null;
  }

  const manifest = await fetchJsonAsset<UpdateManifest>(manifestAsset);
  if (manifest.channel && manifest.channel !== request.channel) {
    return null;
  }

  const entries = manifestToEntries(manifest);
  const matching = entries.find(entry =>
    entryMatchesRequest(entry, platform, request.buildTarget)
  );
  if (!matching) {
    return null;
  }

  return {
    ...matching,
    type: matching.type || "minor",
    displayVersion:
      matching.displayVersion ||
      manifest.displayVersion ||
      manifest.version ||
      stripTagPrefix(release.tag_name),
    appVersion:
      matching.appVersion ||
      manifest.appVersion ||
      manifest.version ||
      stripTagPrefix(release.tag_name),
    platformVersion:
      matching.platformVersion ||
      manifest.platformVersion ||
      matching.appVersion ||
      manifest.appVersion ||
      manifest.version ||
      stripTagPrefix(release.tag_name),
    buildID: matching.buildID || manifest.buildID || releaseBuildID(release),
    detailsURL:
      matching.detailsURL ||
      manifest.detailsURL ||
      process.env.HILAL_UPDATE_DETAILS_URL ||
      release.html_url,
    actions: matching.actions || manifest.actions || "showURL",
  };
}

function manifestToEntries(manifest: UpdateManifest): UpdateManifestEntry[] {
  const entries = Array.isArray(manifest.updates) ? [...manifest.updates] : [];

  if (manifest.platforms) {
    for (const [platform, value] of Object.entries(manifest.platforms)) {
      entries.push({ platform, ...value });
    }
  }

  return entries;
}

function resolveEnvEntry(
  platform: string,
  release: ReleaseSummary
): UpdateManifestEntry | null {
  const families = platformEnvPrefixes(platform);
  for (const prefix of families) {
    const url = process.env[`HILAL_UPDATE_${prefix}_MAR_URL`];
    const hashValue = process.env[`HILAL_UPDATE_${prefix}_MAR_HASH`];
    const size = process.env[`HILAL_UPDATE_${prefix}_MAR_SIZE`];
    if (!url || !hashValue || !size) {
      continue;
    }
    return {
      platform,
      url,
      hashFunction:
        process.env[`HILAL_UPDATE_${prefix}_MAR_HASH_FUNCTION`] || "sha512",
      hashValue,
      size: Number(size),
      type: "minor",
      displayVersion:
        process.env.HILAL_UPDATE_DISPLAY_VERSION ||
        stripTagPrefix(release.tag_name),
      appVersion:
        process.env.HILAL_UPDATE_APP_VERSION || stripTagPrefix(release.tag_name),
      platformVersion:
        process.env.HILAL_UPDATE_PLATFORM_VERSION ||
        process.env.HILAL_UPDATE_APP_VERSION ||
        stripTagPrefix(release.tag_name),
      buildID: process.env.HILAL_UPDATE_BUILD_ID || releaseBuildID(release),
      detailsURL: process.env.HILAL_UPDATE_DETAILS_URL || release.html_url,
      actions: "showURL",
    };
  }
  return null;
}

function platformEnvPrefixes(platform: string): string[] {
  const normalized = platform.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  const family = normalized.split("_")[0];
  return normalized === family ? [normalized] : [normalized, family];
}

function entryMatchesRequest(
  entry: UpdateManifestEntry,
  platform: string,
  buildTarget: string
): boolean {
  const entryPlatform = normalizePlatformName(entry.platform);
  const entryFamily = entryPlatform.split("-")[0];
  const requestFamily = platform.split("-")[0];
  if (
    entryPlatform !== platform &&
    entryFamily !== platform &&
    entryFamily !== requestFamily
  ) {
    return false;
  }

  if (!entry.target) {
    return true;
  }

  const targets = Array.isArray(entry.target) ? entry.target : [entry.target];
  const lowerTarget = buildTarget.toLowerCase();
  return targets.some(target => lowerTarget.includes(target.toLowerCase()));
}

function detectPlatform(buildTarget: string): string {
  const target = buildTarget.toLowerCase();
  const arch = target.includes("aarch64") || target.includes("arm64")
    ? "arm64"
    : "x86_64";

  if (target.includes("winnt") || target.includes("windows")) {
    return `windows-${arch}`;
  }
  if (target.includes("darwin") || target.includes("macos")) {
    return `macos-${arch}`;
  }
  if (target.includes("linux")) {
    return `linux-${arch}`;
  }
  return "unknown";
}

function normalizePlatformName(platform: string): string {
  const lower = platform.toLowerCase().replace(/_/g, "-");
  if (lower === "mac" || lower === "darwin") {
    return "macos-x86_64";
  }
  if (lower === "win" || lower === "windows") {
    return "windows-x86_64";
  }
  if (lower === "linux") {
    return "linux-x86_64";
  }
  return lower;
}

function isValidEntry(entry: UpdateManifestEntry): boolean {
  if (!entry.url || !entry.url.startsWith("https://")) {
    return false;
  }
  if (!entry.hashValue || !/^[a-f0-9]{64,128}$/i.test(entry.hashValue)) {
    return false;
  }
  if ((entry.hashFunction || "sha512").toLowerCase() !== "sha512") {
    return false;
  }
  return Number.isFinite(entry.size) && entry.size > 0;
}

function shouldOfferUpdate(
  request: UpdateRequest,
  release: ReleaseSummary,
  entry: UpdateManifestEntry
): boolean {
  const displayVersion = entry.displayVersion || stripTagPrefix(release.tag_name);
  const requestedVersion = stripTagPrefix(request.version);
  if (displayVersion !== requestedVersion) {
    return true;
  }

  const candidateBuild = entry.buildID || releaseBuildID(release);
  if (!candidateBuild || !request.buildID) {
    return false;
  }
  return candidateBuild > request.buildID;
}

function buildUpdateXml(
  release: ReleaseSummary,
  entry: UpdateManifestEntry
): string {
  const displayVersion = entry.displayVersion || stripTagPrefix(release.tag_name);
  const appVersion = entry.appVersion || displayVersion;
  const platformVersion = entry.platformVersion || appVersion;
  const buildID = entry.buildID || releaseBuildID(release);
  const detailsURL = entry.detailsURL || release.html_url;

  return `<?xml version="1.0"?>
<updates>
  <update type="${xmlEscape(entry.type || "minor")}" displayVersion="${xmlEscape(displayVersion)}" appVersion="${xmlEscape(appVersion)}" platformVersion="${xmlEscape(platformVersion)}" buildID="${xmlEscape(buildID)}" detailsURL="${xmlEscape(detailsURL)}" actions="${xmlEscape(entry.actions || "showURL")}">
    <patch type="complete" URL="${xmlEscape(entry.url)}" hashFunction="${xmlEscape(entry.hashFunction || "sha512")}" hashValue="${xmlEscape(entry.hashValue)}" size="${entry.size}"/>
  </update>
</updates>
`;
}

function releaseBuildID(release: ReleaseSummary): string {
  const published = new Date(release.published_at);
  if (Number.isNaN(published.getTime())) {
    return "";
  }
  return published.toISOString().replace(/\D/g, "").slice(0, 14);
}

function stripTagPrefix(version: string): string {
  return version.replace(/^v/i, "");
}

function xmlEscape(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sendEmpty(res: ServerResponse) {
  res.statusCode = 200;
  res.end(EMPTY_UPDATES);
}
