import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildUpdateXml,
  compareFirefoxVersions,
  isFirefoxAppVersion,
  isValidEntry,
  shouldOfferUpdate,
  type UpdateRequest,
} from "./update.ts";
import type { ReleaseSummary, UpdateManifestEntry } from "../server/github.ts";

const release: ReleaseSummary = {
  id: 1,
  tag_name: "v0.2.0-alpha.4",
  name: "Hilal Browser 0.2.0-alpha.4",
  published_at: "2026-05-26T00:00:00Z",
  body: "",
  html_url: "https://github.com/VastSea0/hilal-browser/releases/tag/v0.2.0-alpha.4",
  draft: false,
  prerelease: true,
  assets: [],
};

const request: UpdateRequest = {
  product: "Firefox",
  version: "152.0a1",
  buildID: "20260526014454",
  buildTarget: "Darwin_aarch64-gcc3",
  locale: "tr",
  channel: "hilal-release",
};

const entry: UpdateManifestEntry = {
  platform: "macos-arm64",
  url: "https://example.com/hilal.complete.mar",
  hashFunction: "sha512",
  hashValue: "a".repeat(128),
  size: 123,
  type: "minor",
  displayVersion: "0.2.0-alpha.4",
  firefoxVersion: "152.0a1",
  appVersion: "152.0a1",
  platformVersion: "152.0a1",
  buildID: "20260526014454",
};

test("Hilal display version difference does not create a self-update", () => {
  assert.equal(shouldOfferUpdate(request, release, entry), false);
});

test("newer Firefox app version creates an update", () => {
  assert.equal(
    shouldOfferUpdate(request, release, {
      ...entry,
      firefoxVersion: "153.0a1",
      appVersion: "153.0a1",
      platformVersion: "153.0a1",
      buildID: "20260527000000",
    }),
    true
  );
});

test("older Firefox app version is never offered as an update", () => {
  assert.equal(
    shouldOfferUpdate(
      { ...request, version: "153.0a1", buildID: "20260527000000" },
      release,
      entry
    ),
    false
  );
});

test("Hilal release strings are rejected as Firefox app versions", () => {
  assert.equal(isFirefoxAppVersion("0.2.0-alpha.4"), false);
  assert.equal(isFirefoxAppVersion("153.0a1"), true);
  assert.equal(isFirefoxAppVersion("140.0.1esr"), true);
});

test("update entries require complete safe metadata", () => {
  assert.equal(isValidEntry(entry), true);
  assert.equal(isValidEntry({ ...entry, buildID: "" }), false);
  assert.equal(isValidEntry({ ...entry, platform: "" }), false);
  assert.equal(isValidEntry({ ...entry, url: "http://example.com/hilal.mar" }), false);
  assert.equal(isValidEntry({ ...entry, hashValue: "a".repeat(64) }), false);
  assert.equal(isValidEntry({ ...entry, appVersion: "0.2.0-alpha.4" }), false);
});

test("update XML keeps displayVersion and appVersion separate", () => {
  const xml = buildUpdateXml(release, entry);
  assert.match(xml, /displayVersion="0\.2\.0-alpha\.4"/);
  assert.match(xml, /appVersion="152\.0a1"/);
  assert.match(xml, /platformVersion="152\.0a1"/);
});

test("Firefox version comparison handles nightly, beta, release, and esr forms", () => {
  assert.equal(compareFirefoxVersions("153.0a1", "152.0a1"), 1);
  assert.equal(compareFirefoxVersions("153.0b1", "153.0a1"), 1);
  assert.equal(compareFirefoxVersions("153.0", "153.0b9"), 1);
  assert.equal(compareFirefoxVersions("140.0.1esr", "140.0.1"), 0);
});
