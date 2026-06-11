/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, MigrationUtils, ChromeUtils, MozXULElement, gURLBar, gBrowser */

(function () {
  "use strict";

  let SearchService;
  try {
    SearchService = ChromeUtils.importESModule(
      "moz-src:///toolkit/components/search/SearchService.sys.mjs"
    ).SearchService;
  } catch (e) {
    try {
      SearchService = ChromeUtils.importESModule(
        "resource:///modules/SearchService.sys.mjs"
      ).SearchService;
    } catch (err) {
      SearchService = window.SearchService;
    }
  }

  const STAGES = [
    { title: "First choices", icon: "settings" },
    { title: "Layout", icon: "layout" },
    { title: "Tabs", icon: "tabs" },
    { title: "Spaces", icon: "spaces" },
    { title: "Toolbar", icon: "layout" },
    { title: "Privacy", icon: "shield" },
    { title: "Search", icon: "search" },
    { title: "Pinned tabs", icon: "pin" },
    { title: "Spaces setup", icon: "spaces" },
    { title: "Ready", icon: "check" },
  ];
  const STAGE_TOOLBAR = 4;

  const PREF_COMPACT_ENABLED = "hilal.compact.enabled";
  const PREF_COMPACT_HIDE_TOOLBOX = "hilal.compact.hide_toolbox";
  const PREF_VERTICAL_TABS = "sidebar.verticalTabs";
  const PREF_WORKSPACES_ENABLED = "hilal.workspaces.enabled";
  const PREF_PINNED_PUBLIC = "hilal.workspaces.pinned.public";
  const TOPSITE_IMAGE_BASE =
    "chrome://activity-stream/content/data/content/tippytop/images/";
  const SEARCH_ENGINE_PLACEHOLDER =
    "chrome://browser/skin/search-engine-placeholder.png";
  const SEARCH_ENGINE_PLACEHOLDER_2X =
    "chrome://browser/skin/search-engine-placeholder@2x.png";

  const PRIVACY_LEVELS = [
    {
      key: "standard",
      label: "Balanced",
      badge: "Everyday",
      description: "RFP, strict tracking protection, HTTPS-only, URL cleanup, WebGL off, cookie/cache cleanup on close.",
      l10nLabel: "hilal-welcome-privacy-standard-label",
      l10nBadge: "hilal-welcome-privacy-standard-badge",
      l10nDesc: "hilal-welcome-privacy-standard-desc",
    },
    {
      key: "strict",
      label: "Strict",
      badge: "Less exposed",
      description: "Adds First Party Isolation on top of Balanced. WebRTC is disabled.",
      l10nLabel: "hilal-welcome-privacy-strict-label",
      l10nBadge: "hilal-welcome-privacy-strict-badge",
      l10nDesc: "hilal-welcome-privacy-strict-desc",
    },
    {
      key: "extreme",
      label: "Maximum",
      badge: "Local only",
      description: "Adds JavaScript, camera, microphone, location, and history blocking on top of Strict.",
      l10nLabel: "hilal-welcome-privacy-extreme-label",
      l10nBadge: "hilal-welcome-privacy-extreme-badge",
      l10nDesc: "hilal-welcome-privacy-extreme-desc",
    },
  ];

  const WORKSPACE_PRESETS = [
    {
      key: "personal",
      label: "Personal",
      icon: "home",
      workspaceColor: "blue",
    },
    {
      key: "work",
      label: "Work",
      icon: "folder",
      workspaceColor: "orange",
    },
    {
      key: "social",
      label: "Social",
      icon: "star",
      workspaceColor: "pink",
    },
  ];

  const PINNED_SITE_PRESETS = [
    {
      key: "netflix",
      label: "Netflix",
      url: "https://www.netflix.com/",
      initial: "N",
      color: "#e50914",
    },
    {
      key: "spotify",
      label: "Spotify",
      url: "https://open.spotify.com/",
      initial: "S",
      color: "#1ed760",
    },
    {
      key: "youtube",
      label: "YouTube",
      url: "https://www.youtube.com/",
      initial: "Y",
      color: "#ff0033",
      iconURL: `${TOPSITE_IMAGE_BASE}youtube-com@2x.png`,
    },
    {
      key: "github",
      label: "GitHub",
      url: "https://github.com/",
      initial: "G",
      color: "#f0f6fc",
    },
    {
      key: "reddit",
      label: "Reddit",
      url: "https://www.reddit.com/",
      initial: "R",
      color: "#ff4500",
      iconURL: `${TOPSITE_IMAGE_BASE}reddit-com@2x.png`,
    },
    {
      key: "notion",
      label: "Notion",
      url: "https://www.notion.so/",
      initial: "N",
      color: "#ffffff",
    },
    {
      key: "gemini",
      label: "Gemini",
      url: "https://gemini.google.com/",
      initial: "G",
      color: "#8ab4f8",
    },
  ];

  class HilalWelcome {
    constructor(workspacesController) {
      this._workspaces = workspacesController;
      this._stage = 0;
      this._overlay = null;
      this._style = null;
      this._engines = [];
      this._enginesReady = null;
      this._selectedEngine = null;
      this._selectedPrivacyLevel = this._normalizePrivacyLevel(
        Services.prefs.getStringPref("hilal.privacy.level", "standard")
      );
      this._defaultBrowserSelected = false;
      this._compactSelected = Services.prefs.getBoolPref(
        PREF_COMPACT_ENABLED,
        true
      );
      this._compactHideToolboxSelected = Services.prefs.getBoolPref(
        PREF_COMPACT_HIDE_TOOLBOX,
        true
      );
      this._verticalTabsSelected = Services.prefs.getBoolPref(
        PREF_VERTICAL_TABS,
        false
      );
      this._workspacesEnabledSelected = Services.prefs.getBoolPref(
        PREF_WORKSPACES_ENABLED,
        true
      );
      this._pinnedPublicSelected = Services.prefs.getBoolPref(
        PREF_PINNED_PUBLIC,
        true
      );
      this._pinnedSitesSelected = Object.fromEntries(
        PINNED_SITE_PRESETS.map(site => [site.key, false])
      );
      this._workspacesSelected = { personal: true, work: true, social: true };
    }

    async start() {
      this._injectStyles();
      this._enterWelcomeStage();
      this._createOverlay();
      this._renderIntro();
      this._enginesReady = this._fetchEngines();
      await this._enginesReady;
    }

    _injectStyles() {
      const head = document.head || document.documentElement;
      const existing = document.getElementById("hilal-welcome-style");
      if (existing) {
        this._style = existing;
        return;
      }
      this._style = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "link"
      );
      this._style.id = "hilal-welcome-style";
      this._style.rel = "stylesheet";
      this._style.href = "chrome://browser/content/hilal/HilalWelcome.css";
      head.appendChild(this._style);
    }

    _enterWelcomeStage() {
      document.documentElement.setAttribute("hilal-welcome-stage", "true");
    }

    _leaveWelcomeStage() {
      document.documentElement.removeAttribute("hilal-welcome-stage");
    }

    async _fetchEngines() {
      try {
        if (SearchService) {
          const list = await SearchService.getVisibleEngines();
          this._engines = await Promise.all(
            list
              .filter(engine => {
                const name = engine.name.toLowerCase();
                return !name.includes("wikipedia") && !name.includes("ebay");
              })
              .map(async engine => {
                return {
                  name: engine.name,
                  originalEngine: engine,
                  iconURL: await this._getEngineIconURL(engine),
                };
              })
          );
        }
      } catch (e) {
        console.error("HilalWelcome: failed to fetch engines", e);
      }

      if (this._engines.length) {
        const duckDuckGo = this._engines.find(engine =>
          engine.name.toLowerCase().includes("duckduckgo")
        );
        this._selectedEngine = duckDuckGo || this._engines[0];
      }

      if (!this._engines.length) {
        this._engines = [
          { name: "DuckDuckGo", originalEngine: null, iconURL: "" },
          { name: "Google", originalEngine: null, iconURL: "" },
          { name: "Bing", originalEngine: null, iconURL: "" },
        ];
        this._selectedEngine = this._engines[0];
      }
    }

    async _getEngineIconURL(engine) {
      let url = "";
      try {
        if (typeof engine.getIconURL === "function") {
          url =
            (await engine.getIconURL(32)) ||
            (await engine.getIconURL(16)) ||
            (await engine.getIconURL()) ||
            "";
        }
      } catch (e) {
        console.error("HilalWelcome: failed to fetch engine icon", e);
      }

      if (!url) {
        const iconURI = engine.iconURI || engine._iconURI;
        url =
          iconURI?.spec ||
          (typeof iconURI === "string" ? iconURI : "") ||
          engine.iconURL ||
          engine._iconURL ||
          this._bestIconFromMap(engine._iconMapObj) ||
          "";
      }

      return this._sanitizeIconURL(url) || this._searchEnginePlaceholder();
    }

    _bestIconFromMap(iconMap) {
      if (!iconMap) {
        return "";
      }
      const widths = Object.keys(iconMap)
        .map(width => parseInt(width, 10))
        .filter(width => Number.isFinite(width))
        .sort((first, second) => first - second);
      if (!widths.length) {
        return "";
      }
      const bestWidth =
        widths.find(width => width >= 32) || widths[widths.length - 1];
      return iconMap[bestWidth] || "";
    }

    _searchEnginePlaceholder() {
      return window.devicePixelRatio > 1
        ? SEARCH_ENGINE_PLACEHOLDER_2X
        : SEARCH_ENGINE_PLACEHOLDER;
    }

    _sanitizeIconURL(url) {
      if (!url) {
        return "";
      }
      try {
        const parsed = Services.io.newURI(url);
        const safeSchemes = ["http", "https", "data", "chrome", "resource"];
        if (safeSchemes.includes(parsed.scheme)) {
          return url;
        }
      } catch (e) {
        const cleanUrl = String(url).trim().toLowerCase();
        if (/^(https?|data|chrome|resource):/i.test(cleanUrl)) {
          return url;
        }
      }
      return "";
    }

    _createOverlay() {
      let overlay = document.getElementById("hilal-welcome-overlay");
      if (!overlay) {
        overlay = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "div"
        );
        overlay.id = "hilal-welcome-overlay";
        document.documentElement.appendChild(overlay);
      }
      this._overlay = overlay;
    }

    _renderIntro() {
      if (!this._overlay) {
        return;
      }

      const markup = `
        <div class="hw-card hw-intro-card" role="dialog" aria-modal="true" aria-labelledby="hw-intro-title" xmlns="http://www.w3.org/1999/xhtml">
          <div class="hw-intro-logo">
            ${this._logoHTML()}
          </div>
          <h1 class="hw-intro-title" id="hw-intro-title" data-l10n-id="hilal-welcome-intro-title">Set up Hilal</h1>
          <p class="hw-intro-sub" data-l10n-id="hilal-welcome-intro-sub">A few quick choices to make the browser yours.</p>
          <button type="button" class="hw-btn-primary" id="hw-start-btn">
            <span data-l10n-id="hilal-welcome-action-start">Begin</span>
            <span class="hw-icon hw-icon-arrow-right"></span>
          </button>
        </div>
      `;
      this._overlay.replaceChildren(MozXULElement.parseXULToFragment(markup));
      document.getElementById("hw-start-btn")?.addEventListener("click", () => {
        this._beginFlow();
      });
    }

    async _beginFlow() {
      const button = document.getElementById("hw-start-btn");
      if (button) {
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
      }

      try {
        await this._enginesReady;
      } catch (e) {
        console.error("HilalWelcome: engine preload failed", e);
      }

      this._stage = 0;
      this._renderStage();
    }

    _renderStage() {
      if (!this._overlay) {
        return;
      }

      const markup = `
        <div class="hw-card hw-flow-card" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title" data-stage="${this._stage}" xmlns="http://www.w3.org/1999/xhtml">
          <header class="hw-card-header">
            <div class="hw-brand">
              <span class="hw-brand-mark">${this._logoHTML()}</span>
              <span class="hw-brand-name" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</span>
            </div>
            <button type="button" class="hw-skip-btn" id="hw-skip-btn">
              <span data-l10n-id="hilal-welcome-skip">Skip</span>
              <span class="hw-icon hw-icon-close"></span>
            </button>
          </header>
          <div class="hw-progress" aria-hidden="true">
            ${this._stepsHTML()}
          </div>
          <section class="hw-stage-head">
            ${this._stageCopyHTML()}
          </section>
          <section class="hw-stage-body" id="hw-stage-body">
            ${this._stageHTML()}
          </section>
          <footer class="hw-card-footer">
            ${this._actionsHTML()}
          </footer>
        </div>
      `;
      this._overlay.replaceChildren(MozXULElement.parseXULToFragment(markup));
      this._attachListeners();
    }

    _visibleStages() {
      return STAGES.filter(
        (_, index) => index !== STAGE_TOOLBAR || this._compactSelected
      );
    }

    _visibleStageIndex() {
      let visual = 0;
      for (let i = 0; i < this._stage; i++) {
        if (i !== STAGE_TOOLBAR || this._compactSelected) {
          visual++;
        }
      }
      return visual;
    }

    _stepsHTML() {
      const visible = this._visibleStages();
      const currentVisual = this._visibleStageIndex();
      return visible
        .map((stage, index) => {
          const active = index === currentVisual;
          const done = index < currentVisual;
          return `
          <span class="hw-progress-dot${active ? " hw-progress-active" : ""}${done ? " hw-progress-done" : ""}">
            <span data-l10n-id="hilal-welcome-step-label-${stage.icon}">${stage.title}</span>
          </span>
        `;
        })
        .join("");
    }

    _stageCopyHTML() {
      const stageCopies = [
        {
          kicker: "First choices",
          title: "Choose what starts with Hilal.",
          subtitle: "Bring data from another browser and set Hilal as your default.",
        },
        {
          kicker: "Layout",
          title: "Pick a density.",
          subtitle: "Standard keeps the toolbar fixed. Compact hides it until you need it.",
        },
        {
          kicker: "Tabs",
          title: "Choose a tab direction.",
          subtitle: "Vertical tabs sit in a sidebar. Horizontal tabs line up across the top.",
        },
        {
          kicker: "Spaces",
          title: "Separate your contexts.",
          subtitle: "Spaces keep personal, work, and social tabs in their own groups.",
        },
        {
          kicker: "Toolbar",
          title: "Control the toolbar.",
          subtitle: "Auto-hide reveals the address bar on hover. Always visible keeps it fixed.",
        },
        {
          kicker: "Privacy",
          title: "Pick a protection level.",
          subtitle: "Hilal can stay comfortable for daily browsing or tighten site tracking surfaces.",
        },
        {
          kicker: "Search",
          title: "Choose the address-bar engine.",
          subtitle: "Used when you type into the bar. You can change it any time.",
        },
        {
          kicker: "Pinned tabs",
          title: "Keep essentials one click away.",
          subtitle: "Select sites to pin at startup. They stay in the sidebar across sessions.",
        },
        {
          kicker: "Spaces setup",
          title: "Start with a few spaces.",
          subtitle: "Create spaces now, or skip and shape it later.",
        },
        {
          kicker: "Done",
          title: "Ready.",
          subtitle: "Your choices are saved. Hilal will close this setup and open the browser.",
        },
      ];
      const copy = stageCopies[this._stage];
      return `
        <p class="hw-kicker" data-l10n-id="hilal-welcome-stage-${this._stage}-kicker">${copy.kicker}</p>
        <h1 class="hw-title" id="hw-stage-title" data-l10n-id="hilal-welcome-stage-${this._stage}-title">${copy.title}</h1>
        <p class="hw-sub" data-l10n-id="hilal-welcome-stage-${this._stage}-subtitle">${copy.subtitle}</p>
      `;
    }

    _stageHTML() {
      switch (this._stage) {
        case 0:
          return this._firstChoicesHTML();
        case 1:
          return this._layoutModeHTML();
        case 2:
          return this._tabOrientationHTML();
        case 3:
          return this._workspacesToggleHTML();
        case 4:
          return this._hideToolbarHTML();
        case 5:
          return this._privacyLevelsHTML();
        case 6:
          return this._enginesHTML();
        case 7:
          return this._pinnedTabsHTML();
        case 8:
          return this._workspacesHTML();
        case 9:
          return this._summaryHTML();
      }
      return "";
    }

    _actionsHTML() {
      const isFirst = this._stage === 0;
      const isLast = this._stage === STAGES.length - 1;

      let primaryId = isLast ? "hw-finish-btn" : "hw-next-btn";
      let primaryL10nId = "hilal-welcome-action-continue";
      let primaryFallback = "Continue";
      if (isLast) {
        primaryL10nId = "hilal-welcome-action-start-browsing";
        primaryFallback = "Open Hilal";
      }

      return `
        <button type="button" class="hw-btn-ghost" id="hw-prev-btn"${isFirst ? ' disabled="disabled"' : ""}>
          <span class="hw-icon hw-icon-arrow-left"></span>
          <span data-l10n-id="hilal-welcome-action-back">Back</span>
        </button>
        <button type="button" class="hw-btn-primary" id="${primaryId}">
          <span data-l10n-id="${primaryL10nId}">${primaryFallback}</span>
          <span class="hw-icon hw-icon-${isLast ? "check" : "arrow-right"}"></span>
        </button>
      `;
    }

    /* ----------------------------------------------------------
       Stage HTML methods
       ---------------------------------------------------------- */

    _firstChoicesHTML() {
      return `
        <div class="hw-choice-stack">
          <label class="hw-toggle-row" for="hw-default-browser-toggle">
            <div class="hw-toggle-row-copy">
              <span class="hw-toggle-row-title" data-l10n-id="hilal-welcome-default-browser-label">Default browser</span>
              <span class="hw-toggle-row-desc" data-l10n-id="hilal-welcome-default-browser-desc">Open system web links in Hilal.</span>
            </div>
            <span class="hw-toggle">
              <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? ' checked="checked"' : ""}/>
              <span class="hw-toggle-track"></span>
            </span>
          </label>
          <div class="hw-import-row">
            <span class="hw-import-row-icon hw-icon hw-icon-folder"></span>
            <div class="hw-import-row-copy">
              <span class="hw-toggle-row-title" data-l10n-id="hilal-welcome-import-label">Browser data</span>
              <span class="hw-toggle-row-desc" data-l10n-id="hilal-welcome-import-desc">Bring bookmarks, history, and passwords from another browser.</span>
            </div>
            <button type="button" class="hw-btn-inline" id="hw-import-btn" data-l10n-id="hilal-welcome-import-button">Import</button>
          </div>
        </div>
      `;
    }

    _layoutModeHTML() {
      const standard = !this._compactSelected;
      const compact = this._compactSelected;
      return `
        <div class="hw-choice-stack">
          ${this._optionRowHTML(
            "data-layout-mode=\"standard\"",
            "layout",
            "Standard",
            "Full toolbar, always visible.",
            standard
          )}
          ${this._optionRowHTML(
            "data-layout-mode=\"compact\"",
            "layout",
            "Compact",
            "More page, less chrome. Toolbar on hover.",
            compact
          )}
        </div>
      `;
    }

    _tabOrientationHTML() {
      return `
        <div class="hw-choice-stack">
          ${this._optionRowHTML(
            "data-tab-layout=\"vertical\"",
            "tabs",
            "Vertical",
            "Tabs sit in a sidebar panel.",
            this._verticalTabsSelected
          )}
          ${this._optionRowHTML(
            "data-tab-layout=\"horizontal\"",
            "tabs",
            "Horizontal",
            "Tabs line up across the top.",
            !this._verticalTabsSelected
          )}
        </div>
      `;
    }

    _workspacesToggleHTML() {
      return `
        <div class="hw-choice-stack">
          ${this._optionRowHTML(
            "data-workspaces=\"on\"",
            "spaces",
            "Spaces on",
            "Group tabs into separate, isolated workspaces.",
            this._workspacesEnabledSelected
          )}
          ${this._optionRowHTML(
            "data-workspaces=\"off\"",
            "layout",
            "Spaces off",
            "One clean browser window, no separation.",
            !this._workspacesEnabledSelected
          )}
        </div>
      `;
    }

    _hideToolbarHTML() {
      return `
        <div class="hw-choice-stack">
          ${this._optionRowHTML(
            "data-toolbar=\"hidden\"",
            "layout",
            "Auto-hide",
            "Reveal the toolbar by hovering the top edge.",
            this._compactHideToolboxSelected
          )}
          ${this._optionRowHTML(
            "data-toolbar=\"visible\"",
            "layout",
            "Always visible",
            "The toolbar stays fixed at the top.",
            !this._compactHideToolboxSelected
          )}
        </div>
      `;
    }

    _privacyLevelsHTML() {
      return PRIVACY_LEVELS.map(level => {
        const active = this._selectedPrivacyLevel === level.key;
        return `
          <button type="button" class="hw-option${active ? " hw-option-active" : ""}" data-privacy-level="${level.key}" aria-pressed="${active}">
            <div class="hw-option-copy">
              <span class="hw-option-title" data-l10n-id="${level.l10nLabel}">${level.label}</span>
              <span class="hw-option-desc" data-l10n-id="${level.l10nDesc}">${level.description}</span>
            </div>
            <span class="hw-pill" data-l10n-id="${level.l10nBadge}">${level.badge}</span>
            <span class="hw-option-check" aria-hidden="true">
              ${active ? `<span class="hw-icon hw-icon-check"></span>` : ""}
            </span>
          </button>
        `;
      }).join("");
    }

    _enginesHTML() {
      return this._engines
        .map((engine, index) => {
          const name = this._escapeHTML(engine.name);
          const isActive = this._selectedEngine?.name === engine.name;
          const isDuckDuckGo = engine.name.toLowerCase().includes("duckduckgo");
          return `
            <button type="button" class="hw-option${isActive ? " hw-option-active" : ""}" data-idx="${index}" aria-pressed="${isActive}">
              <span class="hw-option-icon hw-engine-icon">
                ${this._engineIconHTML(engine)}
              </span>
              <div class="hw-option-copy">
                <span class="hw-option-title">${name}</span>
              </div>
              ${isDuckDuckGo ? `<span class="hw-recommended-pill" data-l10n-id="hilal-welcome-recommended">Recommended</span>` : ""}
              <span class="hw-option-check" aria-hidden="true">
                ${isActive ? `<span class="hw-icon hw-icon-check"></span>` : ""}
              </span>
            </button>
          `;
        })
        .join("");
    }

    _pinnedTabsHTML() {
      const sites = PINNED_SITE_PRESETS;
      return `
        <div class="hw-pinned-site-list">
          <label class="hw-toggle-row" for="hw-pinned-public-toggle">
            <div class="hw-toggle-row-copy">
              <span class="hw-toggle-row-title" data-l10n-id="hilal-welcome-pinned-public-label">Show in every space</span>
              <span class="hw-toggle-row-desc" data-l10n-id="hilal-welcome-pinned-public-desc">Pinned tabs stay visible when you switch workspaces.</span>
            </div>
            <span class="hw-toggle">
              <input type="checkbox" id="hw-pinned-public-toggle"${this._pinnedPublicSelected ? ' checked="checked"' : ""}/>
              <span class="hw-toggle-track"></span>
            </span>
          </label>
          ${sites.map(site => {
            const active = this._pinnedSitesSelected[site.key];
            const domain = site.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
            return `
              <button type="button" class="hw-option${active ? " hw-option-active" : ""}" data-pinned-site="${site.key}" aria-pressed="${active}">
                <span class="hw-option-icon" style="background: radial-gradient(circle at 30% 20%, color-mix(in srgb, ${this._escapeHTML(site.color)} 28%, transparent), transparent 60%), rgba(255,255,255,0.07); color: ${this._escapeHTML(site.color)};">
                  ${site.iconURL
                    ? `<img src="${this._escapeHTML(site.iconURL)}" alt="" style="width:22px;height:22px;object-fit:contain;" />`
                    : `<span style="font-size:0.82rem;font-weight:780;">${this._escapeHTML(site.initial)}</span>`
                  }
                </span>
                <div class="hw-option-copy">
                  <span class="hw-option-title">${this._escapeHTML(site.label)}</span>
                  <span class="hw-option-desc">${this._escapeHTML(domain)}</span>
                </div>
                <span class="hw-option-check" aria-hidden="true">
                  ${active ? `<span class="hw-icon hw-icon-check"></span>` : ""}
                </span>
              </button>
            `;
          }).join("")}
        </div>
      `;
    }

    _workspacesHTML() {
      if (!this._workspacesEnabledSelected) {
        return `
          <div class="hw-workspace-off-notice">
            <span class="hw-icon hw-icon-tabs" style="--hw-icon-size:20px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,0.07);color:var(--hw-faint);"></span>
            <div class="hw-workspace-off-notice-copy">
              <span class="hw-option-title" data-l10n-id="hilal-welcome-workspaces-disabled-label">Spaces are off</span>
              <span class="hw-option-desc" data-l10n-id="hilal-welcome-workspaces-disabled-desc">Hilal will open with one clean browser space. You can turn spaces on in Settings later.</span>
            </div>
          </div>
        `;
      }

      return WORKSPACE_PRESETS.map(item => {
        const active = this._workspacesSelected[item.key];
        return `
          <button type="button" class="hw-option${active ? " hw-option-active" : ""}" data-workspace="${item.key}" aria-pressed="${active}">
            <span class="hw-option-icon">
              <span class="hw-icon hw-icon-${item.icon}" style="--hw-icon-size:17px;color:var(--hw-muted);"></span>
            </span>
            <div class="hw-option-copy">
              <span class="hw-option-title" data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>
              <span class="hw-option-desc" data-l10n-id="hilal-welcome-workspace-state-${active ? "added" : "skipped"}">${active ? "Will be created" : "Skipped"}</span>
            </div>
            <span class="hw-option-check" aria-hidden="true">
              ${active ? `<span class="hw-icon hw-icon-check"></span>` : ""}
            </span>
          </button>
        `;
      }).join("");
    }

    _summaryHTML() {
      const engineName = this._escapeHTML(
        this._selectedEngine?.name ?? "DuckDuckGo"
      );
      const privacyLevel =
        PRIVACY_LEVELS.find(
          level => level.key === this._selectedPrivacyLevel
        ) || PRIVACY_LEVELS[0];
      const selectedPinnedSites = this._selectedPinnedSites();
      const pinnedTabsText = selectedPinnedSites.length
        ? selectedPinnedSites.map(site => this._escapeHTML(site.label)).join(", ")
        : "None";

      const activePresets = WORKSPACE_PRESETS.filter(
        item => this._workspacesSelected[item.key]
      );
      let workspacesText = "Off";
      if (this._workspacesEnabledSelected) {
        workspacesText = activePresets.length
          ? activePresets.map(item => item.label).join(", ")
          : "None";
      }

      const rows = [
        { label: "Layout", value: this._compactSelected ? "Compact" : "Standard", l10nKey: "hilal-welcome-summary-layout", l10nValue: `hilal-welcome-summary-layout-${this._compactSelected ? "compact" : "standard"}` },
        { label: "Tabs", value: this._verticalTabsSelected ? "Vertical" : "Horizontal", l10nKey: "hilal-welcome-summary-tabs", l10nValue: `hilal-welcome-summary-tabs-${this._verticalTabsSelected ? "vertical" : "horizontal"}` },
        { label: "Search", value: engineName, l10nKey: "hilal-welcome-summary-search", l10nValue: null },
        { label: "Privacy", value: this._escapeHTML(privacyLevel.label), l10nKey: "hilal-welcome-summary-privacy", l10nValue: null },
        { label: "Pinned tabs", value: pinnedTabsText, l10nKey: "hilal-welcome-summary-pinned-tabs", l10nValue: null },
        { label: "Spaces", value: workspacesText, l10nKey: "hilal-welcome-summary-workspaces", l10nValue: null },
        { label: "Default browser", value: this._defaultBrowserSelected ? "Set as default" : "No change", l10nKey: "hilal-welcome-summary-default-browser", l10nValue: `hilal-welcome-summary-default-${this._defaultBrowserSelected ? "set" : "no-change"}` },
      ];

      return `
        <div class="hw-summary">
          ${rows.map(row => `
            <div class="hw-summary-row">
              <span class="hw-summary-label" data-l10n-id="${row.l10nKey}">${row.label}</span>
              <span class="hw-summary-value"${row.l10nValue ? ` data-l10n-id="${row.l10nValue}"` : ""}>${row.value}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    /* ----------------------------------------------------------
       Shared option row builder
       ---------------------------------------------------------- */

    _optionRowHTML(attrs, iconName, title, desc, active) {
      return `
        <button type="button" class="hw-option${active ? " hw-option-active" : ""}" ${attrs} aria-pressed="${active}">
          <span class="hw-option-icon">
            <span class="hw-icon hw-icon-${iconName}" style="--hw-icon-size:17px;color:var(--hw-muted);"></span>
          </span>
          <div class="hw-option-copy">
            <span class="hw-option-title">${this._escapeHTML(title)}</span>
            <span class="hw-option-desc">${this._escapeHTML(desc)}</span>
          </div>
          <span class="hw-option-check" aria-hidden="true">
            ${active ? `<span class="hw-icon hw-icon-check"></span>` : ""}
          </span>
        </button>
      `;
    }

    /* ----------------------------------------------------------
       Event listeners
       ---------------------------------------------------------- */

    _attachListeners() {
      const onClick = (id, fn) => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener("click", fn);
        }
      };

      onClick("hw-next-btn", () => this._next());
      onClick("hw-prev-btn", () => this._prev());
      onClick("hw-finish-btn", () => this._finish());
      onClick("hw-skip-btn", () => this._dismiss());

      const defaultBrowserToggle = document.getElementById(
        "hw-default-browser-toggle"
      );
      if (defaultBrowserToggle) {
        defaultBrowserToggle.addEventListener("change", event => {
          this._defaultBrowserSelected = event.target.checked;
        });
      }

      onClick("hw-import-btn", async () => {
        const button = document.getElementById("hw-import-btn");
        try {
          if (
            typeof MigrationUtils !== "undefined" &&
            MigrationUtils.showMigrationWizard
          ) {
            MigrationUtils.showMigrationWizard(window, {
              isStartupMigration: true,
            });
            if (button) {
              button.setAttribute(
                "data-l10n-id",
                "hilal-welcome-imported-button"
              );
              button.textContent = "Imported";
              button.disabled = true;
            }
          }
        } catch (e) {
          console.error("HilalWelcome: migration wizard failed", e);
        }
      });

      this._overlay.querySelectorAll(".hw-option[data-idx]").forEach(choice => {
        choice.addEventListener("click", () => {
          const index = parseInt(choice.dataset.idx, 10);
          this._selectedEngine = this._engines[index];
          this._renderStage();
        });
      });

      this._overlay.querySelectorAll(".hw-option[data-privacy-level]").forEach(choice => {
        choice.addEventListener("click", () => {
          this._selectedPrivacyLevel = this._normalizePrivacyLevel(
            choice.dataset.privacyLevel
          );
          this._renderStage();
        });
      });

      this._overlay
        .querySelectorAll(".hw-option[data-layout-mode]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._compactSelected = choice.dataset.layoutMode === "compact";
            Services.prefs.setBoolPref(PREF_COMPACT_ENABLED, this._compactSelected);
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-option[data-tab-layout]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._verticalTabsSelected =
              choice.dataset.tabLayout === "vertical";
            Services.prefs.setBoolPref(PREF_VERTICAL_TABS, this._verticalTabsSelected);
            const isSidebarActive = this._verticalTabsSelected || this._workspacesEnabledSelected;
            Services.prefs.setBoolPref("sidebar.revamp", isSidebarActive);
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-option[data-workspaces]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._workspacesEnabledSelected =
              choice.dataset.workspaces === "on";
            Services.prefs.setBoolPref(PREF_WORKSPACES_ENABLED, this._workspacesEnabledSelected);
            const isSidebarActive = this._verticalTabsSelected || this._workspacesEnabledSelected;
            Services.prefs.setBoolPref("sidebar.revamp", isSidebarActive);
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-option[data-toolbar]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._compactHideToolboxSelected =
              choice.dataset.toolbar === "hidden";
            Services.prefs.setBoolPref(PREF_COMPACT_HIDE_TOOLBOX, this._compactHideToolboxSelected);
            this._renderStage();
          });
        });

      this._overlay.querySelectorAll(".hw-option[data-workspace]").forEach(choice => {
        choice.addEventListener("click", () => {
          const key = choice.dataset.workspace;
          this._workspacesSelected[key] = !this._workspacesSelected[key];
          this._renderStage();
        });
      });

      const pinnedPublicToggle = document.getElementById(
        "hw-pinned-public-toggle"
      );
      if (pinnedPublicToggle) {
        pinnedPublicToggle.addEventListener("change", event => {
          this._pinnedPublicSelected = event.target.checked;
        });
      }

      this._overlay.querySelectorAll(".hw-option[data-pinned-site]").forEach(choice => {
        choice.addEventListener("click", () => {
          const key = choice.dataset.pinnedSite;
          this._pinnedSitesSelected[key] = !this._pinnedSitesSelected[key];
          this._renderStage();
        });
      });
    }

    /* ----------------------------------------------------------
       Navigation
       ---------------------------------------------------------- */

    _shouldSkipStage(stage) {
      return stage === STAGE_TOOLBAR && !this._compactSelected;
    }

    _next() {
      if (this._stage < STAGES.length - 1) {
        this._stage++;
        if (this._shouldSkipStage(this._stage)) {
          this._stage++;
        }
        this._renderStage();
      }
    }

    _prev() {
      if (this._stage > 0) {
        this._stage--;
        if (this._shouldSkipStage(this._stage)) {
          this._stage--;
        }
        this._renderStage();
      }
    }

    /* ----------------------------------------------------------
       Finish / dismiss / teardown
       ---------------------------------------------------------- */

    async _finish() {
      this._saveLayoutPrefs();

      if (this._workspaces && this._workspacesEnabledSelected) {
        for (const item of WORKSPACE_PRESETS) {
          if (this._workspacesSelected[item.key]) {
            let label = item.label;
            try {
              label = await document.l10n.formatValue(
                `hilal-welcome-workspace-label-${item.key}`
              );
            } catch (e) {
              console.error(
                "HilalWelcome: failed to format workspace label",
                e
              );
            }
            if (typeof this._workspaces.ensureWorkspace === "function") {
              this._workspaces.ensureWorkspace(label, "", item.workspaceColor);
            } else {
              this._workspaces.create(label, "", item.workspaceColor);
            }
          }
        }
      }

      await this._createPinnedTabs();

      if (this._selectedEngine?.originalEngine && SearchService) {
        try {
          if (SearchService.setDefault) {
            await SearchService.setDefault(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON?.UNKNOWN ?? 1
            );
          }
          if (SearchService.setDefaultPrivate) {
            await SearchService.setDefaultPrivate(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON?.UNKNOWN ?? 1
            );
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set default engine", e);
        }
      }

      if (this._defaultBrowserSelected) {
        try {
          const shellService = window.getShellService?.();
          if (shellService) {
            shellService.setDefaultBrowser(false);
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set default browser", e);
        }
      }

      try {
        Services.prefs.setStringPref(
          "hilal.privacy.level",
          this._normalizePrivacyLevel(this._selectedPrivacyLevel)
        );
      } catch (e) {
        console.error("HilalWelcome: failed to set privacy level", e);
      }

      this._markSeen();
      this._teardown();
    }

    async _createPinnedTabs() {
      const selectedSites = this._selectedPinnedSites();
      if (
        !selectedSites.length ||
        typeof gBrowser === "undefined" ||
        typeof gBrowser.addTrustedTab !== "function" ||
        typeof gBrowser.pinTab !== "function"
      ) {
        return;
      }

      const userContextId = this._workspaces?.activeContainerId || 0;
      for (const site of selectedSites) {
        try {
          let tab = this._findExistingTabForURL(site.url);
          if (!tab) {
            tab = gBrowser.addTrustedTab(site.url, {
              inBackground: true,
              createLazyBrowser: true,
              userContextId,
            });
          }
          if (tab && !tab.pinned) {
            gBrowser.pinTab(tab);
          }
        } catch (e) {
          console.error(`HilalWelcome: failed to pin ${site.label}`, e);
        }
      }
    }

    _findExistingTabForURL(url) {
      const normalizedURL = this._normalizeURLForCompare(url);
      for (const tab of gBrowser.tabs) {
        const tabURL = this._normalizeURLForCompare(
          tab.linkedBrowser?.currentURI?.spec || ""
        );
        if (tabURL && tabURL === normalizedURL) {
          return tab;
        }
      }
      return null;
    }

    _normalizeURLForCompare(url) {
      return String(url || "")
        .trim()
        .replace(/\/+$/, "")
        .toLowerCase();
    }

    _saveLayoutPrefs() {
      try {
        Services.prefs.setBoolPref(PREF_COMPACT_ENABLED, this._compactSelected);
        Services.prefs.setBoolPref(
          PREF_COMPACT_HIDE_TOOLBOX,
          this._compactHideToolboxSelected
        );
        if (this._verticalTabsSelected || this._workspacesEnabledSelected) {
          Services.prefs.setBoolPref("sidebar.revamp", true);
        }
        Services.prefs.setBoolPref(
          PREF_VERTICAL_TABS,
          this._verticalTabsSelected
        );
        Services.prefs.setBoolPref(
          PREF_WORKSPACES_ENABLED,
          this._workspacesEnabledSelected
        );
        Services.prefs.setBoolPref(
          PREF_PINNED_PUBLIC,
          this._pinnedPublicSelected
        );
      } catch (e) {
        console.error("HilalWelcome: failed to save layout prefs", e);
      }
    }

    _selectedPinnedSites() {
      return PINNED_SITE_PRESETS.filter(
        site => this._pinnedSitesSelected[site.key]
      );
    }

    _dismiss() {
      this._markSeen();
      this._teardown();
    }

    _markSeen() {
      try {
        Services.prefs.setBoolPref("hilal.welcome-screen.seen", true);
      } catch (e) {
        console.error("HilalWelcome: failed to save seen pref", e);
      }
    }

    _teardown() {
      this._overlay?.remove();
      this._overlay = null;
      this._style?.remove();
      this._style = null;
      this._leaveWelcomeStage();

      if (this._workspaces) {
        try {
          this._workspaces._apply();
          this._workspaces._updateUI();
        } catch (e) {
          console.error("HilalWelcome: failed to refresh workspaces", e);
        }
      }

      try {
        window.maximize();
      } catch (e) {
        console.error("HilalWelcome: failed to maximize window", e);
      }
    }

    /* ----------------------------------------------------------
       Utilities
       ---------------------------------------------------------- */

    _normalizePrivacyLevel(value) {
      return PRIVACY_LEVELS.some(level => level.key === value)
        ? value
        : "standard";
    }

    _logoHTML() {
      return `<img class="hw-logo-mark" src="chrome://branding/content/about-logo.svg" alt="" />`;
    }

    _engineIconHTML(engine) {
      const name = engine.name.toLowerCase();
      let iconURL = engine.iconURL;

      if (name.includes("duckduckgo")) {
        iconURL =
          "chrome://activity-stream/content/data/content/tippytop/images/duckduckgo-com@2x.svg";
      } else if (name.includes("google")) {
        iconURL =
          "chrome://activity-stream/content/data/content/tippytop/images/google-com@2x.png";
      } else if (name.includes("bing")) {
        iconURL =
          "chrome://activity-stream/content/data/content/tippytop/images/bing-com@2x.svg";
      } else if (name.includes("yandex")) {
        iconURL =
          "chrome://activity-stream/content/data/content/tippytop/images/yandex-com@2x.png";
      }

      if (iconURL) {
        return `<img src="${this._escapeHTML(iconURL)}" alt="" />`;
      }
      return `<span class="hw-icon hw-icon-search" style="--hw-icon-size:18px;color:var(--hw-muted);"></span>`;
    }

    _escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, character => {
        switch (character) {
          case "&":
            return "&amp;";
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          case '"':
            return "&quot;";
          case "'":
            return "&#39;";
        }
        return character;
      });
    }
  }

  window.HilalWelcome = HilalWelcome;
})();
