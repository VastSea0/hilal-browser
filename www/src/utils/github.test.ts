import assert from "node:assert/strict";
import { test } from "node:test";
import { computeDownloadStats, getAssetPlatform } from "./github.ts";
import type { GithubRelease } from "../types.ts";

test("getAssetPlatform classifies installer assets accurately", () => {
  assert.equal(getAssetPlatform("Hilal-Browser-v0.4.0-alpha.3-macOS.dmg"), "macos");
  assert.equal(getAssetPlatform("Hilal-0.4.0-alpha.3-win64-setup.exe"), "windows");
  assert.equal(getAssetPlatform("Hilal-0.4.0-alpha.3-win64.zip"), "windows");
  assert.equal(getAssetPlatform("Hilal-0.4.0-alpha.3-linux-x86_64.tar.xz"), "linux");
  assert.equal(getAssetPlatform("Hilal-0.4.0-alpha.3-x86_64.AppImage"), "linux");
  assert.equal(getAssetPlatform("hilal-browser-android-2.1.0.apk"), "android");
  assert.equal(getAssetPlatform("README.txt"), null);
});

test("computeDownloadStats sums browser downloads and ignores non-installer files and drafts", () => {
  const releases: GithubRelease[] = [
    {
      id: 1,
      tag_name: "v0.4.0-alpha.3",
      name: "v0.4.0-alpha.3",
      published_at: "2026-10-01T00:00:00Z",
      body: "",
      html_url: "https://example.com/1",
      draft: false,
      prerelease: false,
      assets: [
        { id: 1, name: "Hilal-Browser-v0.4.0-alpha.3-macOS.dmg", size: 1, browser_download_url: "", download_count: 8 },
        { id: 2, name: "Hilal-0.4.0-alpha.3-win64-setup.exe", size: 1, browser_download_url: "", download_count: 14 },
        { id: 3, name: "Hilal-0.4.0-alpha.3-win64.zip", size: 1, browser_download_url: "", download_count: 9 },
        { id: 4, name: "Hilal-0.4.0-alpha.3-linux-x86_64.tar.xz", size: 1, browser_download_url: "", download_count: 17 },
        { id: 5, name: "hilal-update-manifest.json", size: 1, browser_download_url: "", download_count: 88 },
        { id: 6, name: "hilal-v0.4.0-alpha.3-linux-x86_64.complete.mar", size: 1, browser_download_url: "", download_count: 5 },
        { id: 7, name: "SHA256SUMS", size: 1, browser_download_url: "", download_count: 2 },
        { id: 8, name: "hil", size: 1, browser_download_url: "", download_count: 4 },
      ],
    },
    {
      id: 2,
      tag_name: "android-v2.1.0",
      name: "android-v2.1.0",
      published_at: "2026-10-02T00:00:00Z",
      body: "",
      html_url: "https://example.com/2",
      draft: false,
      prerelease: false,
      assets: [
        { id: 9, name: "hilal-browser-android-2.1.0.apk", size: 1, browser_download_url: "", download_count: 11 },
        { id: 10, name: "hilal-browser-android-2.1.0.apk.sha256", size: 1, browser_download_url: "", download_count: 3 },
      ],
    },
    {
      id: 3,
      tag_name: "draft-release",
      name: "draft",
      published_at: "",
      body: "",
      html_url: "https://example.com/3",
      draft: true,
      prerelease: false,
      assets: [
        { id: 11, name: "Hilal-draft.dmg", size: 1, browser_download_url: "", download_count: 99 },
      ],
    },
  ];

  const stats = computeDownloadStats(releases);
  assert.deepEqual(stats, {
    total: 59,
    platforms: {
      macos: 8,
      windows: 23,
      linux: 17,
      android: 11,
    },
  });
});
