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
  firefoxVersion?: string;
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
  firefoxVersion?: string;
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

/**
 * Lists releases, newest first. GitHub's REST release list leaves out releases
 * that github-actions[bot] created (most desktop builds), so with a token the
 * list comes from GraphQL, which returns all of them. REST stays as the
 * fallback.
 */
export async function fetchGithubReleases(limit = 10): Promise<ReleaseSummary[]> {
  if (process.env.GITHUB_TOKEN) {
    try {
      return await fetchGithubReleasesGraphQL(limit);
    } catch (error) {
      console.error("GraphQL release list failed, using REST", error);
    }
  }
  return fetchGithubReleasesRest(limit);
}

const RELEASES_QUERY = `
  query ($owner: String!, $name: String!, $limit: Int!) {
    repository(owner: $owner, name: $name) {
      releases(first: $limit, orderBy: { field: CREATED_AT, direction: DESC }) {
        nodes {
          databaseId
          tagName
          name
          publishedAt
          createdAt
          description
          url
          isDraft
          isPrerelease
          releaseAssets(first: 50) {
            nodes { name size downloadUrl contentType }
          }
        }
      }
    }
  }
`;

async function fetchGithubReleasesGraphQL(limit: number): Promise<ReleaseSummary[]> {
  const [owner, name] = getRepository().split("/");
  const response = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      query: RELEASES_QUERY,
      variables: { owner, name, limit: Math.min(limit, 100) },
    }),
  });
  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status}`);
  }
  const data = await response.json();
  const nodes = data?.data?.repository?.releases?.nodes;
  if (!Array.isArray(nodes)) {
    throw new Error(
      `GitHub GraphQL returned no releases: ${JSON.stringify(data?.errors ?? data)}`
    );
  }
  return nodes.map((node: any) =>
    normalizeRelease({
      id: node.databaseId,
      tag_name: node.tagName,
      name: node.name,
      published_at: node.publishedAt || node.createdAt,
      body: node.description,
      html_url: node.url,
      draft: node.isDraft,
      prerelease: node.isPrerelease,
      // GraphQL has no numeric asset ids; derive unique ones for UI keys.
      assets: (node.releaseAssets?.nodes || []).map((asset: any, index: number) => ({
        id: Number(node.databaseId || 0) * 1000 + index + 1,
        name: asset.name,
        size: asset.size,
        browser_download_url: asset.downloadUrl,
        content_type: asset.contentType,
      })),
    })
  );
}

async function fetchGithubReleasesRest(limit: number): Promise<ReleaseSummary[]> {
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

/** Android releases share the repository; their tags start with "android-" or "mobile-". */
export function isAndroidRelease(release: ReleaseSummary): boolean {
  return /^(android|mobile)-/.test(release.tag_name);
}

/** Newest desktop release, for the desktop updater. Android releases are skipped. */
export async function fetchLatestRelease(): Promise<ReleaseSummary | null> {
  const releases = await fetchGithubReleases(30);
  const includePrerelease = process.env.HILAL_UPDATE_INCLUDE_PRERELEASES === "1";
  return (
    releases.find(
      release =>
        !release.draft &&
        !isAndroidRelease(release) &&
        (includePrerelease || !release.prerelease)
    ) || null
  );
}

/** Newest stable release that ships an APK. */
export async function fetchLatestAndroidApk(): Promise<{ release: ReleaseSummary; apk: ReleaseAsset } | null> {
  const releases = await fetchGithubReleases(30);
  for (const release of releases) {
    if (release.draft || release.prerelease) continue;
    const apk = release.assets.find(asset => asset.name.toLowerCase().endsWith(".apk"));
    if (apk) return { release, apk };
  }
  return null;
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
