import type { IncomingMessage, ServerResponse } from "node:http";
import {
  fetchJsonAsset,
  fetchLatestRelease,
  findUpdateManifestAsset,
  type ReleaseSummary,
  type UpdateManifest,
  type UpdateManifestEntry,
} from "../server/github.js";

export interface UpdateRequest {
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
  if (platform === "unknown") {
    return null;
  }

  const envEntry = resolveEnvEntry(platform, release);
  if (envEntry) {
    return envEntry;
  }

  const manifestAsset = findUpdateManifestAsset(release);
  if (!manifestAsset) {
    return null;
  }

  const manifest = await fetchJsonAsset<UpdateManifest>(manifestAsset);
  if (!isValidManifest(manifest, release, request.channel)) {
    return null;
  }

  const entries = manifestToEntries(manifest);
  const matching = entries.find(entry =>
    entryMatchesRequest(entry, platform, request.buildTarget)
  );
  if (!matching) {
    return null;
  }

  const displayVersion = firstNonEmpty(
    matching.displayVersion,
    manifest.displayVersion,
    manifest.version,
    stripTagPrefix(release.tag_name)
  );
  const appVersion = firstFirefoxVersion(
    matching.firefoxVersion,
    manifest.firefoxVersion,
    matching.appVersion,
    manifest.appVersion,
    matching.platformVersion,
    manifest.platformVersion
  );
  const platformVersion =
    firstFirefoxVersion(matching.platformVersion, manifest.platformVersion) ||
    appVersion;

  return {
    ...matching,
    type: matching.type || "minor",
    displayVersion,
    firefoxVersion: appVersion,
    appVersion,
    platformVersion,
    buildID: matching.buildID || manifest.buildID || releaseBuildID(release),
    detailsURL:
      matching.detailsURL ||
      manifest.detailsURL ||
      process.env.HILAL_UPDATE_DETAILS_URL ||
      release.html_url,
    actions: matching.actions || manifest.actions || "showURL",
  };
}

function isValidManifest(
  manifest: UpdateManifest,
  release: ReleaseSummary,
  channel: string
): boolean {
  if (manifest.channel !== channel) {
    return false;
  }
  if (stripTagPrefix(manifest.version || "") !== stripTagPrefix(release.tag_name)) {
    return false;
  }
  if (!manifest.displayVersion) {
    return false;
  }
  if (!manifest.buildID || !/^\d{14}$/.test(manifest.buildID)) {
    return false;
  }
  const appVersion = firstFirefoxVersion(
    manifest.firefoxVersion,
    manifest.appVersion,
    manifest.platformVersion
  );
  return Boolean(appVersion);
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
    const appVersion = firstFirefoxVersion(
      process.env.HILAL_UPDATE_FIREFOX_VERSION,
      process.env.HILAL_UPDATE_APP_VERSION,
      process.env.HILAL_UPDATE_PLATFORM_VERSION
    );
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
      firefoxVersion: appVersion,
      appVersion,
      platformVersion:
        firstFirefoxVersion(process.env.HILAL_UPDATE_PLATFORM_VERSION) ||
        appVersion,
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

export function detectPlatform(buildTarget: string): string {
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

export function isValidEntry(entry: UpdateManifestEntry): boolean {
  if (!entry.platform) {
    return false;
  }
  if (!entry.url || !entry.url.startsWith("https://")) {
    return false;
  }
  if (!entry.hashValue || !/^[a-f0-9]{128}$/i.test(entry.hashValue)) {
    return false;
  }
  if ((entry.hashFunction || "sha512").toLowerCase() !== "sha512") {
    return false;
  }
  if (!entry.appVersion || !isFirefoxAppVersion(entry.appVersion)) {
    return false;
  }
  if (
    entry.platformVersion &&
    !isFirefoxAppVersion(entry.platformVersion)
  ) {
    return false;
  }
  if (!entry.buildID || !/^\d{14}$/.test(entry.buildID)) {
    return false;
  }
  return Number.isFinite(entry.size) && entry.size > 0;
}

export function shouldOfferUpdate(
  request: UpdateRequest,
  release: ReleaseSummary,
  entry: UpdateManifestEntry
): boolean {
  const candidateVersion = stripTagPrefix(
    entry.appVersion || entry.firefoxVersion || entry.platformVersion || ""
  );
  const requestedVersion = stripTagPrefix(request.version);
  if (
    !isFirefoxAppVersion(candidateVersion) ||
    !isFirefoxAppVersion(requestedVersion)
  ) {
    return false;
  }

  const versionComparison = compareFirefoxVersions(
    candidateVersion,
    requestedVersion
  );
  if (versionComparison < 0) {
    return false;
  }
  if (versionComparison > 0) {
    return true;
  }

  const candidateBuild = entry.buildID || releaseBuildID(release);
  if (!candidateBuild || !request.buildID) {
    return false;
  }
  return candidateBuild > request.buildID;
}

export function buildUpdateXml(
  release: ReleaseSummary,
  entry: UpdateManifestEntry
): string {
  const displayVersion = entry.displayVersion || stripTagPrefix(release.tag_name);
  const appVersion = entry.appVersion || entry.firefoxVersion || "";
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

function firstNonEmpty(...values: Array<string | undefined>): string {
  return values.find(value => value && value.trim())?.trim() || "";
}

function firstFirefoxVersion(...values: Array<string | undefined>): string {
  for (const value of values) {
    const candidate = stripTagPrefix(String(value || "").trim());
    if (isFirefoxAppVersion(candidate)) {
      return candidate;
    }
  }
  return "";
}

export function isFirefoxAppVersion(version: string): boolean {
  return parseFirefoxVersion(stripTagPrefix(version)) !== null;
}

export function compareFirefoxVersions(left: string, right: string): number {
  const parsedLeft = parseFirefoxVersion(stripTagPrefix(left));
  const parsedRight = parseFirefoxVersion(stripTagPrefix(right));
  if (!parsedLeft || !parsedRight) {
    return 0;
  }

  const segmentCount = Math.max(
    parsedLeft.segments.length,
    parsedRight.segments.length
  );
  for (let index = 0; index < segmentCount; index += 1) {
    const leftSegment = parsedLeft.segments[index] || 0;
    const rightSegment = parsedRight.segments[index] || 0;
    if (leftSegment !== rightSegment) {
      return leftSegment > rightSegment ? 1 : -1;
    }
  }

  if (parsedLeft.stageRank !== parsedRight.stageRank) {
    return parsedLeft.stageRank > parsedRight.stageRank ? 1 : -1;
  }
  if (parsedLeft.stageNumber !== parsedRight.stageNumber) {
    return parsedLeft.stageNumber > parsedRight.stageNumber ? 1 : -1;
  }
  return 0;
}

function parseFirefoxVersion(version: string):
  | {
      segments: number[];
      stageRank: number;
      stageNumber: number;
    }
  | null {
  const match = version.match(/^(\d+(?:\.\d+)*)(?:(a|b)(\d+)|esr)?$/i);
  if (!match) {
    return null;
  }

  const stage = (match[2] || "").toLowerCase();
  const stageRank = stage === "a" ? 0 : stage === "b" ? 1 : 2;
  return {
    segments: match[1].split(".").map(segment => Number(segment)),
    stageRank,
    stageNumber: Number(match[3] || 0),
  };
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
