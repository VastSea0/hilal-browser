import { GithubRelease, GithubAsset } from "../types";

export const FALLBACK_RELEASE_TR: GithubRelease = {
  id: 1,
  tag_name: "v1.0.0-alpha.5",
  name: "v1.0.0-alpha.5: Kararlı Başlangıç",
  published_at: "2026-05-20T14:30:00Z",
  html_url: "https://github.com/VastSea0/hilal-browser/releases",
  body: `### Öne Çıkan Özellikler\n- 🦊 **Firefox (Gecko-128)** kararlı Web motoru altyapısına tamamen geçiş yapıldı.\n- 🛡️ Reklam ve izleyici engelleyicilerin lideri **uBlock Origin** eklentisi varsayılan olarak entegre edildi.\n- 📑 Ekranın sol kenarını kullanarak dikey navigasyon sağlayan yenilikçi **Dikey Sekmeler (Vertical Tabs)**.\n- ⚡ Sayfa yükleme hızlarında uBlock Origin sayesinde %40'a varan artış ve sıfır efor.\n- 🎨 Gözü yormayan sadeleştirilmiş başlangıç sayfası önizlemesi hazırlandı.`,
  assets: [
    {
      id: 101,
      name: "hilal-browser-1.0.0-setup.exe",
      size: 82312450,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/hilal-browser-1.0.0-setup.exe"
    },
    {
      id: 102,
      name: "hilal-browser-1.0.0.dmg",
      size: 89432100,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/hilal-browser-1.0.0.dmg"
    },
    {
      id: 103,
      name: "hilal-browser-1.0.0-x86_64.AppImage",
      size: 96210450,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/hilal-browser-1.0.0-x86_64.AppImage"
    },
    {
      id: 104,
      name: "hilal-browser-1.0.0_amd64.deb",
      size: 68150240,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/hilal-browser-1.0.0_amd64.deb"
    },
    {
      id: 105,
      name: "hilal-browser-1.0.0.zip",
      size: 102140500,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/hilal-browser-1.0.0.zip"
    },
    {
      id: 106,
      name: "Hilal-1.0.0-x86_64.tar.gz",
      size: 99120500,
      browser_download_url: "https://github.com/VastSea0/hilal-browser/releases/download/v1.0.0-alpha.5/Hilal-1.0.0-x86_64.tar.gz"
    }
  ]
};

export const FALLBACK_RELEASE_EN: GithubRelease = {
  id: 1,
  tag_name: "v1.0.0-alpha.5",
  name: "v1.0.0-alpha.5: Stable Outset",
  published_at: "2026-05-20T14:30:00Z",
  html_url: "https://github.com/VastSea0/hilal-browser/releases",
  body: `### Key Highlights\n- 🦊 **Firefox (Gecko-128)** fully migrated to the stable Gecko web engine.\n- 🛡️ Ad & tracker blocking champion **uBlock Origin** comes pre-integrated by default.\n- 📑 Innovative **Vertical Tabs** system built inside for a wider screen estate.\n- ⚡ Fast browsing with up to 40% reduction in web size overhead, zero configuration.\n- 🎨 Beautiful minimalist welcome home landing layout constructed.`,
  assets: FALLBACK_RELEASE_TR.assets
};

/**
 * Robust fetch with exponential backoff
 * Retries up to 5 times on fetch/transient errors, silently (does not log retries).
 */
export async function fetchGithubReleases(): Promise<GithubRelease[]> {
  const localFeed = await fetchReleaseFeed("/releases.json");
  if (localFeed.length > 0) {
    return localFeed;
  }

  const url = "https://api.github.com/repos/VastSea0/hilal-browser/releases";
  const maxRetries = 5;
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

      // If rate limited or standard non-2xx status, trigger backoff retry
      throw new Error(`State error: ${response.status}`);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait for next attempt with exponential delay
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

    // Headings starting with #
    if (trimmed.startsWith("#")) {
      const cleanHeader = trimmed.replace(/^#+\s*/, "");
      result.push({ type: "header", text: cleanHeader });
    }
    // List items starting with -, *, or numerical lists
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

export type DetectionOS = "windows" | "macos" | "linux" | "other";

/**
 * Clean and reliable helper to detect the user's Operating System
 */
export function detectOS(): DetectionOS {
  if (typeof window === "undefined" || !window.navigator) {
    return "other";
  }
  const userAgent = window.navigator.userAgent.toLowerCase();
  
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

/**
 * Filter and recommend the best install asset for the detected Operating System
 */
export function getRecommendedAsset(assets: GithubAsset[], os: DetectionOS): GithubAsset | null {
  if (!assets || assets.length === 0) return null;
  
  if (os === "windows") {
    const exe = assets.find(a => a.name.toLowerCase().endsWith(".exe"));
    if (exe) return exe;
  } else if (os === "macos") {
    const dmg = assets.find(a => a.name.toLowerCase().endsWith(".dmg"));
    if (dmg) return dmg;
  } else if (os === "linux") {
    const deb = assets.find(a => a.name.toLowerCase().endsWith(".deb"));
    if (deb) return deb;
    const appimage = assets.find(a => a.name.toLowerCase().endsWith(".appimage"));
    if (appimage) return appimage;
    const tarball = assets.find(a => {
      const name = a.name.toLowerCase();
      return name.endsWith(".tar.gz") || name.endsWith(".tar.xz");
    });
    if (tarball) return tarball;
  }
  return null;
}
