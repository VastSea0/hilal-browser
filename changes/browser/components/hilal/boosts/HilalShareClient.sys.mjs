/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Client for shared Boost links, adapted from Zen Browser's
// ZenShareClient.sys.mjs (https://github.com/zen-browser/desktop), also under
// the MPL 2.0. Hilal only shares Boosts, so the document format is the boost
// part of Zen's schema and is checked here instead of with a JSON schema.

import { XPCOMUtils } from "resource://gre/modules/XPCOMUtils.sys.mjs";

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  JSONFile: "resource://gre/modules/JSONFile.sys.mjs",
  clearTimeout: "resource://gre/modules/Timer.sys.mjs",
  setTimeout: "resource://gre/modules/Timer.sys.mjs",
});

XPCOMUtils.defineLazyPreferenceGetter(
  lazy,
  "gBaseUrl",
  "hilal.share.base-url",
  "https://hilal-browser.vercel.app",
  null,
  value => value.trim().replace(/\/+$/, "")
);

const CACHE_FILE = "hilal-share-cache.json";
const MAX_CACHE_ENTRIES = 200;
// Matches the server's limit; screenshots are the bulk of a share.
const MAX_SHARE_BYTES = 4 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;
const CREATE_TIMEOUT_MS = 120000;
const READ_TIMEOUT_MS = 30000;

const SHARE_PATH_RE =
  /^\/boost\/([0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4})\/?$/;

export class HilalShareError extends Error {
  /**
   * @param {string} code - One of "invalid-document", "too-large",
   *      "rate-limited", "not-found", "network", "server".
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "HilalShareError";
    this.code = code;
  }
}

function isValidBoostShare(doc) {
  const shared = doc?.shared;
  return (
    !!shared &&
    shared.type == "boost" &&
    typeof shared.name == "string" &&
    typeof shared.domain == "string" &&
    !!shared.boostData &&
    typeof shared.boostData == "object" &&
    ["author", "icon", "preview"].every(
      key => shared[key] === undefined || typeof shared[key] == "string"
    )
  );
}

class nsHilalShareClient {
  #cacheFile = null;

  get #baseUrl() {
    return lazy.gBaseUrl;
  }

  #assertValidDocument(doc) {
    if (!isValidBoostShare(doc)) {
      throw new HilalShareError("invalid-document", "not a Boost share");
    }
  }

  async #request(url, options, timeoutMs = READ_TIMEOUT_MS) {
    const controller = new AbortController();
    const timer = lazy.setTimeout(() => controller.abort(), timeoutMs);
    let response;
    try {
      response = await fetch(url, {
        credentials: "omit",
        signal: controller.signal,
        ...options,
      });
    } catch (e) {
      throw new HilalShareError(
        "network",
        `could not reach ${url}: ${e.message}`
      );
    } finally {
      lazy.clearTimeout(timer);
    }
    if (response.ok) {
      return response;
    }
    let message = `${response.status}`;
    try {
      message = (await response.json()).error || message;
    } catch (e) {}
    switch (response.status) {
      case 404:
        throw new HilalShareError("not-found", message);
      case 413:
        throw new HilalShareError("too-large", message);
      case 429:
        throw new HilalShareError("rate-limited", message);
      case 400:
      case 422:
        throw new HilalShareError("invalid-document", message);
      default:
        throw new HilalShareError("server", message);
    }
  }

  /**
   * Uploads a Boost share.
   *
   * @param {object} doc - { version, shared: { type: "boost", ... } }
   * @param {{name?: string}} options - Optional sharer display name.
   * @returns {Promise<object>} The server response plus `link`.
   */
  async createShare(doc, { name } = {}) {
    this.#assertValidDocument(doc);
    const body = JSON.stringify(doc);
    if (new TextEncoder().encode(body).length > MAX_SHARE_BYTES) {
      throw new HilalShareError("too-large", "share is over the size limit");
    }
    let url = `${this.#baseUrl}/api/boosts`;
    if (name) {
      url += `?name=${encodeURIComponent(name.slice(0, MAX_NAME_LENGTH))}`;
    }
    const response = await this.#request(
      url,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      },
      CREATE_TIMEOUT_MS
    );
    const created = await response.json();
    return { ...created, link: this.#baseUrl + created.webUrl };
  }

  /**
   * Shares a document, reusing the link of an earlier identical share when
   * the server still has it.
   */
  async findOrCreateShare(doc, { name } = {}) {
    const hash = await this.hashDocument(doc, { name });
    const cache = await this.#cache();
    const cached = cache.data.shares[hash];
    if (cached?.link) {
      try {
        await this.getShare(cached.id);
        return { ...cached, reused: true };
      } catch (e) {
        delete cache.data.shares[hash];
      }
    }
    const created = await this.createShare(doc, { name });
    const entry = {
      id: created.id ?? this.parseShareUrl(created.link)?.id,
      link: created.link,
      createdAt: Date.now(),
    };
    cache.data.shares[hash] = entry;
    this.#pruneCache(cache.data.shares);
    cache.saveSoon();
    return { ...created, ...entry, reused: false };
  }

  async hashDocument(doc, { name } = {}) {
    const canonical = JSON.stringify(
      { ...doc, name: name || "" },
      (key, value) =>
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.fromEntries(
              Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1))
            )
          : value
    );
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical)
    );
    return Array.from(new Uint8Array(digest), byte =>
      byte.toString(16).padStart(2, "0")
    ).join("");
  }

  async #cache() {
    if (!this.#cacheFile) {
      this.#cacheFile = new lazy.JSONFile({
        path: PathUtils.join(PathUtils.profileDir, CACHE_FILE),
      });
      await this.#cacheFile.load();
      this.#cacheFile.data.shares ??= {};
    }
    return this.#cacheFile;
  }

  #pruneCache(shares) {
    const entries = Object.entries(shares).sort(
      ([, a], [, b]) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
    );
    for (const key of Object.keys(shares)) {
      delete shares[key];
    }
    for (const [key, entry] of entries.slice(0, MAX_CACHE_ENTRIES)) {
      shares[key] = entry;
    }
  }

  /**
   * Recognizes public Boost share pages on the configured server.
   *
   * @param {string} spec
   * @returns {?{type: "boost", id: string}}
   */
  parseShareUrl(spec) {
    let uri;
    let baseUri;
    try {
      uri = Services.io.newURI(spec);
      baseUri = Services.io.newURI(this.#baseUrl);
    } catch (e) {
      return null;
    }
    if (uri.prePath !== baseUri.prePath) {
      return null;
    }
    const match = uri.filePath.match(SHARE_PATH_RE);
    return match ? { type: "boost", id: match[1].toUpperCase() } : null;
  }

  /**
   * @param {{id: string}} share - As returned by parseShareUrl.
   * @returns {Promise<{doc: object, name: ?string}>}
   */
  async fetchSharePreview(share) {
    const meta = await this.getShare(share.id);
    this.#assertValidDocument(meta.data);
    return { doc: meta.data, name: meta.name || null };
  }

  async getShare(id) {
    const response = await this.#request(
      `${this.#baseUrl}/api/boosts/${encodeURIComponent(id)}`
    );
    return response.json();
  }
}

export const HilalShareClient = new nsHilalShareClient();
