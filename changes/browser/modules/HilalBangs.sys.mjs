/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export var HilalBangs = {
  DEFAULT_BANGS: Object.freeze({
    g: {
      search: "https://www.google.com/search?q={query}",
      home: "https://www.google.com",
    },
    google: {
      search: "https://www.google.com/search?q={query}",
      home: "https://www.google.com",
    },
    yt: {
      search: "https://www.youtube.com/results?search_query={query}",
      home: "https://www.youtube.com",
    },
    youtube: {
      search: "https://www.youtube.com/results?search_query={query}",
      home: "https://www.youtube.com",
    },
    w: {
      search: "https://en.wikipedia.org/wiki/Special:Search?search={query}",
      home: "https://www.wikipedia.org",
    },
    wikipedia: {
      search: "https://en.wikipedia.org/wiki/Special:Search?search={query}",
      home: "https://www.wikipedia.org",
    },
    d: {
      search: "https://duckduckgo.com/?q={query}",
      home: "https://duckduckgo.com",
    },
    duckduckgo: {
      search: "https://duckduckgo.com/?q={query}",
      home: "https://duckduckgo.com",
    },
    gh: {
      search: "https://github.com/search?q={query}",
      home: "https://github.com",
    },
    github: {
      search: "https://github.com/search?q={query}",
      home: "https://github.com",
    },
    r: {
      search: "https://www.reddit.com/search/?q={query}",
      home: "https://www.reddit.com",
    },
    reddit: {
      search: "https://www.reddit.com/search/?q={query}",
      home: "https://www.reddit.com",
    },
    a: {
      search: "https://www.amazon.com/s?k={query}",
      home: "https://www.amazon.com",
    },
    amazon: {
      search: "https://www.amazon.com/s?k={query}",
      home: "https://www.amazon.com",
    },
    n: {
      search: "https://www.netflix.com/search?q={query}",
      home: "https://www.netflix.com",
    },
    netflix: {
      search: "https://www.netflix.com/search?q={query}",
      home: "https://www.netflix.com",
    },
    imdb: {
      search: "https://www.imdb.com/find?q={query}",
      home: "https://www.imdb.com",
    },
    tr: {
      search: "https://translate.google.com/?sl=auto&tl=en&text={query}",
      home: "https://translate.google.com",
    },
    translate: {
      search: "https://translate.google.com/?sl=auto&tl=en&text={query}",
      home: "https://translate.google.com",
    },
    tw: {
      search: "https://twitter.com/search?q={query}",
      home: "https://twitter.com",
    },
    twitter: {
      search: "https://twitter.com/search?q={query}",
      home: "https://twitter.com",
    },
    x: { search: "https://x.com/search?q={query}", home: "https://x.com" },
    maps: {
      search: "https://www.google.com/maps/search/{query}",
      home: "https://maps.google.com",
    },
    b: {
      search: "https://www.bing.com/search?q={query}",
      home: "https://www.bing.com",
    },
    bing: {
      search: "https://www.bing.com/search?q={query}",
      home: "https://www.bing.com",
    },
    y: {
      search: "https://search.yahoo.com/search?p={query}",
      home: "https://yahoo.com",
    },
    yahoo: {
      search: "https://search.yahoo.com/search?p={query}",
      home: "https://yahoo.com",
    },
    ebay: {
      search: "https://www.ebay.com/sch/i.html?_nkw={query}",
      home: "https://www.ebay.com",
    },
    wiki: {
      search: "https://en.wikipedia.org/wiki/Special:Search?search={query}",
      home: "https://www.wikipedia.org",
    },
    wa: {
      search: "https://www.wolframalpha.com/input?i={query}",
      home: "https://www.wolframalpha.com",
    },
    wolfram: {
      search: "https://www.wolframalpha.com/input?i={query}",
      home: "https://www.wolframalpha.com",
    },
    stack: {
      search: "https://stackoverflow.com/search?q={query}",
      home: "https://stackoverflow.com",
    },
    so: {
      search: "https://stackoverflow.com/search?q={query}",
      home: "https://stackoverflow.com",
    },
    twitch: {
      search: "https://www.twitch.tv/search?term={query}",
      home: "https://www.twitch.tv",
    },
    pinterest: {
      search: "https://www.pinterest.com/search/pins/?q={query}",
      home: "https://www.pinterest.com",
    },
    spotify: {
      search: "https://open.spotify.com/search/{query}",
      home: "https://open.spotify.com",
    },
    steam: {
      search: "https://store.steampowered.com/search/?term={query}",
      home: "https://store.steampowered.com",
    },
    medium: {
      search: "https://medium.com/search?q={query}",
      home: "https://medium.com",
    },
    quora: {
      search: "https://www.quora.com/search?q={query}",
      home: "https://www.quora.com",
    },
    facebook: {
      search: "https://www.facebook.com/search/top/?q={query}",
      home: "https://www.facebook.com",
    },
    fb: {
      search: "https://www.facebook.com/search/top/?q={query}",
      home: "https://www.facebook.com",
    },
    instagram: {
      search: "https://www.instagram.com/explore/tags/{query}",
      home: "https://www.instagram.com",
    },
    ig: {
      search: "https://www.instagram.com/explore/tags/{query}",
      home: "https://www.instagram.com",
    },
  }),

  getBangsMap() {
    const custom = this._readCustomBangs();
    if (!custom || !custom.length) {
      return this.DEFAULT_BANGS;
    }
    const merged = { ...this.DEFAULT_BANGS };
    for (const entry of custom) {
      if (
        entry &&
        typeof entry.trigger === "string" &&
        typeof entry.search === "string"
      ) {
        const triggerClean = entry.trigger.replace(/^!/, "").toLowerCase();
        if (triggerClean) {
          merged[triggerClean] = {
            search: entry.search,
            home:
              typeof entry.home === "string"
                ? entry.home
                : entry.search.replace(/\?.*$/, ""),
          };
        }
      }
    }
    return merged;
  },

  resolveQuery(query, { fallbackToDuckDuckGo = false } = {}) {
    const bangInfo = this._parseQuery(query);
    if (!bangInfo) {
      return null;
    }

    const bangsMap = this.getBangsMap();
    const bangEntry = bangsMap[bangInfo.bang];
    if (bangEntry) {
      let resolvedUrl = "";
      if (!bangInfo.query) {
        resolvedUrl = bangEntry.home;
      } else {
        resolvedUrl = bangEntry.search.replace(
          "{query}",
          encodeURIComponent(bangInfo.query)
        );
      }
      try {
        const uri = Services.io.newURI(resolvedUrl);
        if (uri.scheme === "http" || uri.scheme === "https") {
          return { url: resolvedUrl };
        }
      } catch (e) {
        // ignore invalid/non-http URLs
      }
      return null;
    }

    let shouldFallback = fallbackToDuckDuckGo;
    try {
      shouldFallback = shouldFallback && Services.prefs.getBoolPref("hilal.bangs.fallback_to_ddg", false);
    } catch (e) {
      shouldFallback = false;
    }

    if (!shouldFallback) {
      return { query: bangInfo.query || "" };
    }

    const duckDuckGoQuery = `!${bangInfo.rawBang}${
      bangInfo.query ? ` ${bangInfo.query}` : ""
    }`;
    return {
      url: `https://duckduckgo.com/?q=${this._encodeDuckDuckGoQuery(
        duckDuckGoQuery
      )}`,
    };
  },

  getDefaultBangs() {
    return this.DEFAULT_BANGS;
  },

  getCustomBangs() {
    return this._readCustomBangs();
  },

  setCustomBangs(bangs) {
    Services.prefs.setStringPref(
      "hilal.bangs.custom",
      JSON.stringify(bangs)
    );
  },

  _readCustomBangs() {
    try {
      return JSON.parse(
        Services.prefs.getStringPref("hilal.bangs.custom", "[]")
      );
    } catch {
      return [];
    }
  },

  _parseQuery(query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) {
      return null;
    }

    const match = trimmed.match(/(?:^|\s)!([a-zA-Z0-9_-]+)(?:\s|$)/i);
    if (!match) {
      return null;
    }

    const bangWord = `!${match[1]}`;
    const extractedQuery = trimmed
      .replace(
        new RegExp(
          "(?:^|\\s)" +
            bangWord.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&") +
            "(?:\\s|$)",
          "i"
        ),
        " "
      )
      .trim();

    return {
      bang: match[1].toLowerCase(),
      rawBang: match[1],
      query: extractedQuery,
    };
  },

  _encodeDuckDuckGoQuery(query) {
    return encodeURIComponent(query).replace(/%20/g, "+");
  },
};
