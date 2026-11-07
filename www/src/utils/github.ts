import { GithubRelease, GithubAsset } from "../types";

// Shown when the release list cannot be loaded: no download files, only a
// link to the releases page, so nothing points at a file that does not exist.
export const FALLBACK_RELEASE_TR: GithubRelease = {
  id: 0,
  tag_name: "",
  name: "Hilal Browser",
  published_at: "",
  html_url: "https://github.com/VastSea0/hilal-browser/releases",
  body: "",
  assets: [],
};

export const FALLBACK_RELEASE_EN: GithubRelease = FALLBACK_RELEASE_TR;

/**
 * Loads the release list from the site's own API, which is cached and lists
 * every release. GitHub's public API is only a fallback: it leaves out
 * releases made by the build workflow and allows few requests per visitor.
 */
export async function fetchGithubReleases(): Promise<GithubRelease[]> {
  const feed = await fetchReleaseFeed("/api/releases");
  if (feed.length > 0) {
    return feed;
  }

  const url = "https://api.github.com/repos/VastSea0/hilal-browser/releases";
  const maxRetries = 2;
  let delay = 300;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(normalizeRelease);
        }
      }

      throw new Error(`State error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }

  throw new Error("Transmitting limit reached");
}

async function fetchReleaseFeed(url: string): Promise<GithubRelease[]> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const releases = Array.isArray(data) ? data : data?.releases;
    return Array.isArray(releases) ? releases.map(normalizeRelease) : [];
  } catch {
    return [];
  }
}

function normalizeRelease(item: any): GithubRelease {
  return {
    id: Number(item.id || 0),
    tag_name: String(item.tag_name || ""),
    name: String(item.name || item.tag_name || ""),
    published_at: String(item.published_at || item.created_at || ""),
    body: String(item.body || ""),
    html_url: String(item.html_url || ""),
    draft: Boolean(item.draft),
    prerelease: Boolean(item.prerelease),
    assets: Array.isArray(item.assets)
      ? item.assets.map((asset: any) => ({
          id: Number(asset.id || 0),
          name: String(asset.name || ""),
          size: Number(asset.size || 0),
          browser_download_url: String(asset.browser_download_url || ""),
          content_type: asset.content_type ? String(asset.content_type) : undefined,
          digest: asset.digest ? String(asset.digest) : undefined,
        }))
      : [],
  };
}

/**
 * Formats full datetime string into localized date format
 */
export function formatLocalizedDate(dateString: string, lang: 'tr' | 'en'): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return lang === 'tr' ? "Bilinmeyen Tarih" : "Unknown Date";
    }

    if (lang === 'en') {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return lang === 'tr' ? "Bilinmeyen Tarih" : "Unknown Date";
  }
}

/**
 * Convert raw markdown string (specifically listing structures and bold text from Github releases)
 * safely to HTML line tokens.
 */
export function parseChangelogToSimpleLines(body: string): { type: 'header' | 'item' | 'text'; text: string }[] {
  if (!body) return [];

  const lines = body.split("\n");
  const result: { type: 'header' | 'item' | 'text'; text: string }[] = [];

  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("#")) {
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      result.push({ type: "header", text: cleanHeader });
    }
    else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const cleanText = trimmed.replace(/^[-*]\s*/, "");
      result.push({ type: "item", text: cleanText });
    } else if (/^\d+\.\s*/.test(trimmed)) {
      const cleanText = trimmed.replace(/^\d+\.\s*/, "");
      result.push({ type: "item", text: cleanText });
    } else {
      result.push({ type: "text", text: trimmed });
    }
  }

  return result;
}

/**
 * Format bytes into a readable file-size format (KB/MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export type DetectionOS = "windows" | "macos" | "linux" | "android" | "other";

/**
 * Clean and reliable helper to detect the user's Operating System
 */
export function detectOS(): DetectionOS {
  if (typeof window === "undefined" || !window.navigator) {
    return "other";
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  if (userAgent.includes("android")) {
    return "android";
  }
  if (userAgent.includes("win")) {
    return "windows";
  }
  if (userAgent.includes("mac") || userAgent.includes("os x")) {
    return "macos";
  }
  if (userAgent.includes("linux") || userAgent.split(/[()]/)[1]?.includes("linux")) {
    return "linux";
  }
  return "other";
}

// Release files that are not the browser: the hil patch manager, update
// archives and manifests, and build artifacts.
export function isBrowserDownload(asset: GithubAsset): boolean {
  const name = asset.name.toLowerCase();
  return !(
    name === "hil" ||
    name === "hil.exe" ||
    name === "sha256sums" ||
    name.endsWith(".mar") ||
    name.endsWith(".json") ||
    name.endsWith(".sha256") ||
    name.includes("xpt_artifacts")
  );
}

/**
 * Filter and recommend the best install asset for the detected Operating System
 */
export function getRecommendedAsset(assets: GithubAsset[], os: DetectionOS): GithubAsset | null {
  const downloads = (assets || []).filter(isBrowserDownload);
  if (downloads.length === 0) return null;
  const find = (test: (name: string) => boolean) =>
    downloads.find(a => test(a.name.toLowerCase())) || null;

  if (os === "android") {
    return find(name => name.endsWith(".apk"));
  } else if (os === "windows") {
    return (
      find(name => name.endsWith(".exe")) ||
      find(name => name.endsWith(".zip") && name.includes("win"))
    );
  } else if (os === "macos") {
    return find(name => name.endsWith(".dmg"));
  } else if (os === "linux") {
    return (
      find(name => name.endsWith(".deb")) ||
      find(name => name.endsWith(".appimage")) ||
      find(name => name.endsWith(".tar.gz") || name.endsWith(".tar.xz"))
    );
  }
  return null;
}

import { ContributorItem } from "../data/contributorsData";

const KNOWN_NAMES: Record<string, { name: string; role: string }> = {
  vastsea0: { name: "Egehan KAHRAMAN", role: "Lead Developer" },
  greenkod: { name: "GreenKod", role: "Contributor" },
  ataberkcelil: { name: "Ataberk Celil", role: "Contributor" },
  mmapro12: { name: "Muhammed Beshir", role: "Contributor" },
};

export function mergeContributors(
  base: ContributorItem[],
  incoming?: ContributorItem[] | null
): ContributorItem[] {
  const byLower = new Map<string, ContributorItem>();
  for (const item of base) {
    byLower.set(item.username.toLowerCase(), { ...item });
  }
  for (const item of incoming || []) {
    const login = String(item.username || (item as any).login || "");
    if (!login) continue;
    const key = login.toLowerCase();
    const known = KNOWN_NAMES[key];
    const existing = byLower.get(key);
    const contributions = Math.max(
      Number(item.contributions || 0),
      existing?.contributions || 0
    );
    byLower.set(key, {
      username: existing?.username || login,
      name: known?.name || item.name || existing?.name || login,
      avatarUrl: item.avatarUrl || `https://github.com/${login}.png`,
      githubUrl: item.githubUrl || (item as any).html_url || `https://github.com/${login}`,
      contributions,
      role: known?.role || item.role || existing?.role || "Contributor",
    });
  }
  return Array.from(byLower.values()).sort(
    (a, b) => b.contributions - a.contributions
  );
}

/**
 * Fetch live contributors and commit counts from local git API or GitHub API, merging with fallback data.
 */
export async function fetchGithubContributors(
  fallback: ContributorItem[] = []
): Promise<ContributorItem[]> {
  let merged = [...fallback];

  try {
    const localRes = await fetch("/api/contributors", {
      headers: { Accept: "application/json" },
    });
    if (localRes.ok) {
      const localData = await localRes.json();
      if (Array.isArray(localData) && localData.length > 0) {
        merged = mergeContributors(merged, localData);
      }
    }
  } catch {}

  try {
    const res = await fetch(
      "https://api.github.com/repos/VastSea0/hilal-browser/contributors?per_page=100",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        merged = mergeContributors(merged, data);
      }
    }
  } catch {}

  return merged;
}


const hasApk = (release: GithubRelease) =>
  release.assets.some(asset => asset.name.toLowerCase().endsWith(".apk"));

/** Android releases share the repository with desktop ones; tell them apart by tag or APK. */
export function isAndroidRelease(release: GithubRelease): boolean {
  return /^(android|mobile)-/.test(release.tag_name) || hasApk(release);
}

/**
 * The release to offer on this device: the newest stable APK release on Android, the newest
 * desktop release everywhere else.
 */
export function pickReleaseFor(releases: GithubRelease[], os: DetectionOS): GithubRelease | null {
  const published = releases.filter(release => !release.draft);
  if (os === "android") {
    return (
      published.find(release => !release.prerelease && hasApk(release)) ||
      published.find(hasApk) ||
      published[0] ||
      null
    );
  }
  const desktop = published.filter(release => !isAndroidRelease(release));
  // The newest desktop release with a file for this system; builds do not
  // always cover every platform.
  return (
    desktop.find(release => getRecommendedAsset(release.assets, os) !== null) ||
    desktop[0] ||
    published[0] ||
    null
  );
}
