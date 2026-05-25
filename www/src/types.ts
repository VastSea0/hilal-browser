export interface GithubAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
  content_type?: string;
  digest?: string;
}

export interface GithubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  assets: GithubAsset[];
  draft?: boolean;
  prerelease?: boolean;
}
