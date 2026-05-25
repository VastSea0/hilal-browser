export interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  content_type?: string;
  digest?: string;
}

export interface ReleaseSummary {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  draft?: boolean;
  prerelease?: boolean;
  assets: ReleaseAsset[];
}

export interface UpdateManifestEntry {
  platform: string;
  target?: string | string[];
  url: string;
  hashFunction?: string;
  hashValue: string;
  size: number;
  type?: string;
  displayVersion?: string;
  appVersion?: string;
  platformVersion?: string;
  buildID?: string;
  detailsURL?: string;
  actions?: string;
}

export interface UpdateManifest {
  schema?: number;
  version?: string;
  displayVersion?: string;
  appVersion?: string;
  platformVersion?: string;
  buildID?: string;
  channel?: string;
  detailsURL?: string;
  actions?: string;
  updates?: UpdateManifestEntry[];
  platforms?: Record<string, Omit<UpdateManifestEntry, "platform">>;
}

const GITHUB_API = "https://api.github.com";

export function getRepository(): string {
  return process.env.HILAL_UPDATE_REPO || "VastSea0/hilal-browser";
}

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Hilal-Browser-Update-Service",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchGithubReleases(limit = 10): Promise<ReleaseSummary[]> {
  const repo = getRepository();
  const response = await fetch(
    `${GITHUB_API}/repos/${repo}/releases?per_page=${limit}`,
    { headers: githubHeaders() }
  );
  if (!response.ok) {
    throw new Error(`GitHub releases request failed: ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(normalizeRelease);
}

export async function fetchLatestRelease(): Promise<ReleaseSummary | null> {
  const releases = await fetchGithubReleases(12);
  const includePrerelease = process.env.HILAL_UPDATE_INCLUDE_PRERELEASES === "1";
  return (
    releases.find(
      release => !release.draft && (includePrerelease || !release.prerelease)
    ) || null
  );
}

export function normalizeRelease(item: any): ReleaseSummary {
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
          content_type: asset.content_type
            ? String(asset.content_type)
            : undefined,
          digest: asset.digest ? String(asset.digest) : undefined,
        }))
      : [],
  };
}

export function findUpdateManifestAsset(
  release: ReleaseSummary
): ReleaseAsset | null {
  const configured = process.env.HILAL_UPDATE_MANIFEST_ASSET;
  if (configured) {
    const exact = release.assets.find(asset => asset.name === configured);
    if (exact) {
      return exact;
    }
  }

  return (
    release.assets.find(asset =>
      /(^|[-_.])updates?(-manifest)?\.json$/i.test(asset.name)
    ) ||
    release.assets.find(asset =>
      /(^|[-_.])update-manifest\.json$/i.test(asset.name)
    ) ||
    null
  );
}

export async function fetchJsonAsset<T>(asset: ReleaseAsset): Promise<T> {
  const response = await fetch(asset.browser_download_url, {
    headers: {
      Accept: "application/octet-stream",
      "User-Agent": "Hilal-Browser-Update-Service",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub asset request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
