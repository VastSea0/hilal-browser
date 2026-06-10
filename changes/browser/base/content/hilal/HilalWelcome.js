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

  const CHROME_TO_HIDE = [
    "#navigator-toolbox",
    "#browser",
    "#sidebar-main",
    "#sidebar-box",
  ];
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
      description:
        "RFP, strict tracking protection, HTTPS-only, URL cleanup, WebGL off, and cookie/cache cleanup on close.",
      detail:
        "WebRTC stays enabled for compatibility, with local leak surfaces reduced.",
      l10nLabel: "hilal-welcome-privacy-standard-label",
      l10nBadge: "hilal-welcome-privacy-standard-badge",
      l10nDesc: "hilal-welcome-privacy-standard-desc",
      l10nDetail: "hilal-welcome-privacy-standard-detail",
    },
    {
      key: "strict",
      label: "Strict",
      badge: "Less exposed",
      description:
        "Adds First Party Isolation on top of Balanced and disables WebRTC entirely.",
      detail: "Video calls and some sign-in flows may break.",
      l10nLabel: "hilal-welcome-privacy-strict-label",
      l10nBadge: "hilal-welcome-privacy-strict-badge",
      l10nDesc: "hilal-welcome-privacy-strict-desc",
      l10nDetail: "hilal-welcome-privacy-strict-detail",
    },
    {
      key: "extreme",
      label: "Maximum",
      badge: "Local only",
      description:
        "Adds JavaScript, camera, microphone, location, and history blocking on top of Strict.",
      detail:
        "Does not hide your IP address; many modern sites may not work as expected.",
      l10nLabel: "hilal-welcome-privacy-extreme-label",
      l10nBadge: "hilal-welcome-privacy-extreme-badge",
      l10nDesc: "hilal-welcome-privacy-extreme-desc",
      l10nDetail: "hilal-welcome-privacy-extreme-detail",
    },
  ];

  const WORKSPACE_PRESETS = [
    {
      key: "personal",
      label: "Personal",
      icon: "home",
      colorClass: "blue",
      workspaceColor: "blue",
    },
    {
      key: "work",
      label: "Work",
      icon: "folder",
      colorClass: "amber",
      workspaceColor: "orange",
    },
    {
      key: "social",
      label: "Social",
      icon: "star",
      colorClass: "rose",
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
      this._hiddenChrome = new Map();
      this._chromeObserver = null;
      this._chromeSyncScheduled = false;
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
      this._closeBrowserChrome();
      this._syncHiddenChrome();

      if (!this._chromeObserver) {
        this._chromeObserver = new MutationObserver(() => {
          this._scheduleChromeSync();
        });
        this._chromeObserver.observe(document.documentElement, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["style", "hidden", "collapsed", "open", "focused"],
        });
      }
    }

    _scheduleChromeSync() {
      if (this._chromeSyncScheduled) {
        return;
      }
      this._chromeSyncScheduled = true;
      window.requestAnimationFrame(() => {
        this._chromeSyncScheduled = false;
        if (!this._overlay) {
          return;
        }
        this._closeBrowserChrome();
        this._syncHiddenChrome();
      });
    }

    _closeBrowserChrome() {
      try {
        gURLBar?.view?.close?.();
        gURLBar?.blur?.();
        document.getElementById("PopupAutoCompleteRichResult")?.hidePopup?.();
      } catch (e) {
        console.error("HilalWelcome: failed to close chrome panels", e);
      }
    }

    _syncHiddenChrome() {
      for (const selector of CHROME_TO_HIDE) {
        const element = document.querySelector(selector);
        if (!element) {
          continue;
        }
        this._hideChromeElement(element);
      }
    }

    _hideChromeElement(element) {
      if (!this._hiddenChrome.has(element)) {
        this._hiddenChrome.set(element, {
          display: element.style.display,
          pointerEvents: element.style.pointerEvents,
          visibility: element.style.visibility,
        });
      }
      if (element.style.display !== "none") {
        element.style.display = "none";
      }
      if (element.style.pointerEvents !== "none") {
        element.style.pointerEvents = "none";
      }
      if (element.style.visibility !== "hidden") {
        element.style.visibility = "hidden";
      }
    }

    _leaveWelcomeStage() {
      if (this._chromeObserver) {
        this._chromeObserver.disconnect();
        this._chromeObserver = null;
      }
      this._chromeSyncScheduled = false;
      document.documentElement.removeAttribute("hilal-welcome-stage");

      for (const [element, styles] of this._hiddenChrome) {
        element.style.display = styles.display;
        element.style.pointerEvents = styles.pointerEvents;
        element.style.visibility = styles.visibility;
      }
      this._hiddenChrome.clear();
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
        <section class="hw-intro" role="dialog" aria-modal="true" aria-labelledby="hw-intro-title" xmlns="http://www.w3.org/1999/xhtml">
          <div class="hw-intro-mark">
            ${this._logoHTML()}
          </div>
          <h1 class="hw-intro-title" id="hw-intro-title">
            <span data-l10n-id="hilal-welcome-intro-line-1">Hilal starts here</span>
            <span data-l10n-id="hilal-welcome-intro-line-2">Keep the window quiet</span>
          </h1>
          <button type="button" class="hw-intro-button hw-btn-primary" id="hw-start-btn">
            <span data-l10n-id="hilal-welcome-action-start">Set up</span>
            <span class="hw-icon hw-icon-arrow-right"></span>
          </button>
        </section>
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
        <div class="hw-flow" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title" data-stage="${this._stage}" xmlns="http://www.w3.org/1999/xhtml">
          <header class="hw-flow-top">
            <div class="hw-brand">
              <span class="hw-brand-mark">${this._logoHTML()}</span>
              <span class="hw-brand-text" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</span>
            </div>
            <div class="hw-progress" aria-hidden="true">
              ${this._stepsHTML()}
            </div>
            <button type="button" class="hw-skip" id="hw-skip-btn">
              <span data-l10n-id="hilal-welcome-skip">Skip</span>
              <span class="hw-icon hw-icon-close"></span>
            </button>
          </header>
          <main class="hw-stage">
            <section class="hw-stage-copy">
              ${this._stageCopyHTML()}
            </section>
            <section class="hw-stage-panel">
              ${this._stageHTML()}
            </section>
          </main>
          <footer class="hw-flow-actions">
            ${this._actionsHTML()}
          </footer>
        </div>
      `;
      this._overlay.replaceChildren(MozXULElement.parseXULToFragment(markup));
      this._syncHiddenChrome();
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
          subtitle:
            "Bring only the data you need and decide whether links from the system should open here.",
        },
        {
          kicker: "Layout",
          title: "Pick a density.",
          subtitle:
            "Standard keeps the toolbar visible at all times. Compact hides it until you need it.",
        },
        {
          kicker: "Tabs",
          title: "Choose a tab direction.",
          subtitle:
            "Vertical tabs sit in a sidebar. Horizontal tabs line up across the top of the window.",
        },
        {
          kicker: "Spaces",
          title: "Separate your contexts.",
          subtitle:
            "Spaces keep personal, work, and social tabs in their own groups so they never mix.",
        },
        {
          kicker: "Toolbar",
          title: "Control the toolbar.",
          subtitle:
            "Auto-hide reveals the address bar only when you hover the top edge. Always visible keeps it fixed.",
        },
        {
          kicker: "Privacy",
          title: "Pick a protection posture.",
          subtitle:
            "Hilal can stay comfortable for daily browsing or tighten the surfaces that websites use to recognize you.",
        },
        {
          kicker: "Search",
          title: "Choose the address-bar engine.",
          subtitle:
            "This is the engine Hilal uses when you type into the bar. You can change it whenever the browser is open.",
        },
        {
          kicker: "Pinned tabs",
          title: "Keep essentials one click away.",
          subtitle:
            "Choose the sites Hilal should pin at startup. Netflix, Spotify, YouTube, GitHub, Reddit, Notion, and Gemini are ready to add.",
        },
        {
          kicker: "Spaces",
          title: "Start with fewer mixed tabs.",
          subtitle:
            "Create a small set of spaces now, or leave the browser empty and shape it later.",
        },
        {
          kicker: "Finish",
          title: "Ready for a clean window.",
          subtitle:
            "Your choices are saved locally. Hilal will leave the setup layer and return the browser chrome.",
        },
      ];
      const copy = stageCopies[this._stage];
      const visibleIndex = this._visibleStageIndex();
      const visibleTotal = this._visibleStages().length;
      return `
        <p class="hw-kicker" data-l10n-id="hilal-welcome-stage-${this._stage}-kicker">${copy.kicker}</p>
        <h1 class="hw-title" id="hw-stage-title" data-l10n-id="hilal-welcome-stage-${this._stage}-title">${copy.title}</h1>
        <p class="hw-sub" data-l10n-id="hilal-welcome-stage-${this._stage}-subtitle">${copy.subtitle}</p>
        <span class="hw-step-count" data-l10n-id="hilal-welcome-step-count" data-l10n-args='{"current": ${visibleIndex + 1}, "total": ${visibleTotal}}'>Step ${visibleIndex + 1}/${visibleTotal}</span>
      `;
    }

    _stageHTML() {
      switch (this._stage) {
        case 0:
          return `
            <div class="hw-choice-stack">
              <label class="hw-line-choice" for="hw-default-browser-toggle">
                <span class="hw-line-icon hw-icon hw-icon-check"></span>
                <span class="hw-line-copy">
                  <span class="hw-line-title" data-l10n-id="hilal-welcome-default-browser-label">Default browser</span>
                  <span class="hw-line-desc" data-l10n-id="hilal-welcome-default-browser-desc">Use Hilal when the system opens web links.</span>
                </span>
                <span class="hw-toggle">
                  <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? ' checked="checked"' : ""}/>
                  <span class="hw-toggle-track"></span>
                </span>
              </label>
              <div class="hw-line-choice">
                <span class="hw-line-icon hw-icon hw-icon-folder"></span>
                <span class="hw-line-copy">
                  <span class="hw-line-title" data-l10n-id="hilal-welcome-import-label">Browser data</span>
                  <span class="hw-line-desc" data-l10n-id="hilal-welcome-import-desc">Bring bookmarks, history, and passwords from another browser.</span>
                </span>
                <button type="button" class="hw-btn-secondary" id="hw-import-btn" data-l10n-id="hilal-welcome-import-button">Import</button>
              </div>
            </div>
          `;
        case 1:
          return this._layoutModeHTML();
        case 2:
          return this._tabOrientationHTML();
        case 3:
          return this._workspacesToggleHTML();
        case 4:
          return this._hideToolbarHTML();
        case 5:
          return `
            <div class="hw-privacy-list">
              ${this._privacyLevelsHTML()}
            </div>
          `;
        case 6:
          return `
            <div class="hw-engine-list">
              ${this._enginesHTML()}
            </div>
          `;
        case 7:
          return this._pinnedTabsHTML();
        case 8:
          return `
            <div class="hw-workspace-list">
              ${this._workspacesHTML()}
            </div>
          `;
        case 9:
          return `
            <div class="hw-summary">
              ${this._summaryHTML()}
            </div>
          `;
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

    _screenshotURL(name) {
      return `chrome://browser/content/hilal/screenshots/${name}.png`;
    }

    _screenshotCardHTML(imageName, label, desc, active, attrs) {
      return `
        <button type="button" class="hw-screenshot-card${active ? " hw-choice-active" : ""}" ${attrs} aria-pressed="${active}">
          <span class="hw-screenshot-frame">
            <img class="hw-screenshot-img" src="${this._screenshotURL(imageName)}" alt="${this._escapeHTML(label)}" />
          </span>
          <span class="hw-layout-choice-copy">
            <span class="hw-choice-title">${this._escapeHTML(label)}</span>
            <span class="hw-choice-desc">${this._escapeHTML(desc)}</span>
          </span>
        </button>
      `;
    }

    _layoutModeHTML() {
      return `
        <div class="hw-layout-grid">
          ${this._screenshotCardHTML(
            "welcome-standard",
            "Standard",
            "Full toolbar, familiar spacing.",
            !this._compactSelected,
            'data-layout-mode="standard"'
          )}
          ${this._screenshotCardHTML(
            "welcome-compact",
            "Compact",
            "More page, less chrome.",
            this._compactSelected,
            'data-layout-mode="compact"'
          )}
        </div>
      `;
    }

    _tabOrientationHTML() {
      const prefix = this._compactSelected
        ? "welcome-compact"
        : "welcome-standard";
      return `
        <div class="hw-layout-grid">
          ${this._screenshotCardHTML(
            `${prefix}-vertical`,
            "Vertical",
            "Tabs sit in a sidebar panel.",
            this._verticalTabsSelected,
            'data-tab-layout="vertical"'
          )}
          ${this._screenshotCardHTML(
            `${prefix}-horizontal`,
            "Horizontal",
            "Tabs line up across the top.",
            !this._verticalTabsSelected,
            'data-tab-layout="horizontal"'
          )}
        </div>
      `;
    }

    _workspacesToggleHTML() {
      return `
        <div class="hw-layout-grid">
          ${this._screenshotCardHTML(
            "welcome-workspaces-on",
            "Spaces on",
            "Group tabs into separate workspaces.",
            this._workspacesEnabledSelected,
            'data-workspaces="on"'
          )}
          ${this._screenshotCardHTML(
            "welcome-workspaces-off",
            "Spaces off",
            "One clean browser window.",
            !this._workspacesEnabledSelected,
            'data-workspaces="off"'
          )}
        </div>
      `;
    }

    _hideToolbarHTML() {
      return `
        <div class="hw-layout-grid">
          ${this._screenshotCardHTML(
            "welcome-toolbar-hidden",
            "Auto-hide",
            "Reveal the toolbar by hovering the top edge.",
            this._compactHideToolboxSelected,
            'data-toolbar="hidden"'
          )}
          ${this._screenshotCardHTML(
            "welcome-toolbar-visible",
            "Always visible",
            "The toolbar stays fixed at the top.",
            !this._compactHideToolboxSelected,
            'data-toolbar="visible"'
          )}
        </div>
      `;
    }

    _enginesHTML() {
      return this._engines
        .map((engine, index) => {
          const name = this._escapeHTML(engine.name);
          const isActive = this._selectedEngine?.name === engine.name;
          const isDuckDuckGo = engine.name.toLowerCase().includes("duckduckgo");
          return `
            <button type="button" class="hw-engine-choice${isActive ? " hw-choice-active" : ""}" data-idx="${index}" aria-pressed="${isActive}">
              <span class="hw-engine-icon">
                ${this._engineIconHTML(engine)}
              </span>
              <span class="hw-engine-name">${name}</span>
              ${isDuckDuckGo ? `<span class="hw-pill" data-l10n-id="hilal-welcome-recommended">Recommended</span>` : ""}
            </button>
          `;
        })
        .join("");
    }

    _privacyLevelsHTML() {
      return PRIVACY_LEVELS.map(level => {
        const active = this._selectedPrivacyLevel === level.key;
        return `
          <button type="button" class="hw-privacy-choice${active ? " hw-choice-active" : ""}" data-privacy-level="${level.key}" aria-pressed="${active}">
            <span class="hw-choice-top">
              <span class="hw-choice-title" data-l10n-id="${level.l10nLabel}">${level.label}</span>
              <span class="hw-pill" data-l10n-id="${level.l10nBadge}">${level.badge}</span>
            </span>
            <span class="hw-choice-desc" data-l10n-id="${level.l10nDesc}">${level.description}</span>
            <span class="hw-choice-detail" data-l10n-id="${level.l10nDetail}">${level.detail}</span>
          </button>
        `;
      }).join("");
    }

    _normalizePrivacyLevel(value) {
      return PRIVACY_LEVELS.some(level => level.key === value)
        ? value
        : "standard";
    }

    _selectedPinnedSites() {
      return PINNED_SITE_PRESETS.filter(
        site => this._pinnedSitesSelected[site.key]
      );
    }

    _pinnedTabsHTML() {
      return `
        <div class="hw-pinned-builder">
          <div class="hw-pinned-preview" aria-label="Pinned tabs sidebar preview">
            <div class="hw-pinned-window">
              <aside class="hw-pinned-sidebar">
                <div class="hw-window-dots" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div class="hw-pinned-section-label" data-l10n-id="hilal-welcome-pinned-preview-title">Pinned tabs</div>
                <div class="hw-pinned-preview-grid">
                  ${this._pinnedPreviewTabsHTML()}
                </div>
                <div class="hw-pinned-workspace-preview" aria-hidden="true">
                  <span class="hw-pinned-workspace-row hw-pinned-workspace-active"></span>
                  <span class="hw-pinned-workspace-row"></span>
                  <span class="hw-pinned-workspace-row"></span>
                </div>
              </aside>
              <div class="hw-pinned-page-preview">
                <div class="hw-pinned-urlbar"></div>
                <div class="hw-pinned-page-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="hw-pinned-controls">
            <label class="hw-line-choice" for="hw-pinned-public-toggle">
              <span class="hw-line-icon hw-icon hw-icon-tabs"></span>
              <span class="hw-line-copy">
                <span class="hw-line-title" data-l10n-id="hilal-welcome-pinned-public-label">Show pinned tabs in every space</span>
                <span class="hw-line-desc" data-l10n-id="hilal-welcome-pinned-public-desc">On by default so the sites you pin stay visible when you switch workspaces.</span>
              </span>
              <span class="hw-toggle">
                <input type="checkbox" id="hw-pinned-public-toggle"${this._pinnedPublicSelected ? ' checked="checked"' : ""}/>
                <span class="hw-toggle-track"></span>
              </span>
            </label>
            <div class="hw-pinned-site-list">
              ${this._pinnedSiteChoicesHTML()}
            </div>
          </div>
        </div>
      `;
    }

    _pinnedPreviewTabsHTML() {
      return PINNED_SITE_PRESETS.filter(
        site => this._pinnedSitesSelected[site.key]
      )
        .map(site => {
          return `
          <button type="button" class="hw-pinned-preview-tab hw-pinned-preview-active" data-pinned-site="${site.key}" aria-pressed="true" title="${this._escapeHTML(site.label)}">
            ${this._pinnedSiteIconHTML(site)}
          </button>
        `;
        })
        .join("");
    }

    _pinnedSiteChoicesHTML() {
      return PINNED_SITE_PRESETS.filter(
        site => !this._pinnedSitesSelected[site.key]
      )
        .map(site => {
          return `
          <button type="button" class="hw-pinned-site-choice" data-pinned-site="${site.key}" aria-pressed="false">
            ${this._pinnedSiteIconHTML(site)}
            <span class="hw-pinned-site-copy">
              <span class="hw-choice-title">${this._escapeHTML(site.label)}</span>
              <span class="hw-choice-desc">${this._escapeHTML(site.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</span>
            </span>
            <span class="hw-pinned-site-state" data-l10n-id="hilal-welcome-pinned-site-state-skipped">Not selected</span>
          </button>
        `;
        })
        .join("");
    }

    _pinnedSiteIconHTML(site) {
      const style = `style="--hw-pinned-color: ${this._escapeHTML(site.color)}"`;
      if (site.iconURL) {
        return `
          <span class="hw-pinned-site-icon" ${style}>
            <img src="${this._escapeHTML(site.iconURL)}" alt="" />
          </span>
        `;
      }
      return `
        <span class="hw-pinned-site-icon" ${style}>
          <span>${this._escapeHTML(site.initial)}</span>
        </span>
      `;
    }

    _workspacesHTML() {
      if (!this._workspacesEnabledSelected) {
        return `
          <div class="hw-workspace-disabled">
            <span class="hw-workspace-disabled-icon hw-icon hw-icon-tabs"></span>
            <span class="hw-workspace-disabled-copy">
              <span class="hw-choice-title" data-l10n-id="hilal-welcome-workspaces-disabled-label">Spaces are off</span>
              <span class="hw-choice-desc" data-l10n-id="hilal-welcome-workspaces-disabled-desc">Hilal will open with one clean browser space. You can turn spaces on later in Settings.</span>
            </span>
          </div>
        `;
      }

      return WORKSPACE_PRESETS.map(item => {
        const active = this._workspacesSelected[item.key];
        return `
          <button type="button" class="hw-workspace-choice hw-workspace-${item.colorClass}${active ? " hw-choice-active" : ""}" data-workspace="${item.key}" aria-pressed="${active}">
            <span class="hw-workspace-icon">
              <span class="hw-icon hw-icon-${item.icon}"></span>
            </span>
            <span class="hw-workspace-label" data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>
            <span class="hw-workspace-state" data-l10n-id="hilal-welcome-workspace-state-${active ? "added" : "skipped"}">${active ? "Will be created" : "Skipped"}</span>
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
      const activePresets = WORKSPACE_PRESETS.filter(
        item => this._workspacesSelected[item.key]
      );
      const selectedPinnedSites = this._selectedPinnedSites();
      const pinnedTabsHTML = selectedPinnedSites.length
        ? selectedPinnedSites
            .map(site => this._escapeHTML(site.label))
            .join(", ")
        : `<span data-l10n-id="hilal-welcome-summary-none">None</span>`;
      let workspacesHTML = `<span data-l10n-id="hilal-welcome-summary-off">Off</span>`;
      if (this._workspacesEnabledSelected) {
        workspacesHTML = activePresets.length
          ? activePresets
              .map(
                item =>
                  `<span data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>`
              )
              .join(", ")
          : `<span data-l10n-id="hilal-welcome-summary-none">None</span>`;
      }

      return `
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-layout">Layout</span>
          <strong data-l10n-id="hilal-welcome-summary-layout-${this._compactSelected ? "compact" : "standard"}">${this._compactSelected ? "Compact" : "Standard"}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-tabs">Tabs</span>
          <strong data-l10n-id="hilal-welcome-summary-tabs-${this._verticalTabsSelected ? "vertical" : "horizontal"}">${this._verticalTabsSelected ? "Vertical" : "Horizontal"}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-search">Search</span>
          <strong>${engineName}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-privacy">Privacy</span>
          <strong>${this._escapeHTML(privacyLevel.label)}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-pinned-tabs">Pinned tabs</span>
          <strong>${pinnedTabsHTML}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-pinned-everywhere">Pinned tabs in every space</span>
          <strong data-l10n-id="hilal-welcome-summary-${this._pinnedPublicSelected ? "on" : "off"}">${this._pinnedPublicSelected ? "On" : "Off"}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-workspaces">Spaces</span>
          <strong>${workspacesHTML}</strong>
        </div>
        <div class="hw-summary-row">
          <span data-l10n-id="hilal-welcome-summary-default-browser">Default browser</span>
          <strong data-l10n-id="hilal-welcome-summary-default-${this._defaultBrowserSelected ? "set" : "no-change"}">${this._defaultBrowserSelected ? "Set as default" : "No change"}</strong>
        </div>
      `;
    }

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

      this._overlay.querySelectorAll(".hw-engine-choice").forEach(choice => {
        choice.addEventListener("click", () => {
          const index = parseInt(choice.dataset.idx, 10);
          this._selectedEngine = this._engines[index];
          this._renderStage();
        });
      });

      this._overlay.querySelectorAll(".hw-privacy-choice").forEach(choice => {
        choice.addEventListener("click", () => {
          this._selectedPrivacyLevel = this._normalizePrivacyLevel(
            choice.dataset.privacyLevel
          );
          this._renderStage();
        });
      });

      this._overlay
        .querySelectorAll(".hw-screenshot-card[data-layout-mode]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._compactSelected = choice.dataset.layoutMode === "compact";
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-screenshot-card[data-tab-layout]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._verticalTabsSelected =
              choice.dataset.tabLayout === "vertical";
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-screenshot-card[data-workspaces]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._workspacesEnabledSelected =
              choice.dataset.workspaces === "on";
            this._renderStage();
          });
        });

      this._overlay
        .querySelectorAll(".hw-screenshot-card[data-toolbar]")
        .forEach(choice => {
          choice.addEventListener("click", () => {
            this._compactHideToolboxSelected =
              choice.dataset.toolbar === "hidden";
            this._renderStage();
          });
        });

      this._overlay.querySelectorAll(".hw-workspace-choice").forEach(choice => {
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

      this._overlay.querySelectorAll("[data-pinned-site]").forEach(choice => {
        choice.addEventListener("click", () => {
          const key = choice.dataset.pinnedSite;
          this._pinnedSitesSelected[key] = !this._pinnedSitesSelected[key];
          this._renderStage();
        });
      });
    }

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
        return `<img class="hw-engine-image" src="${this._escapeHTML(iconURL)}" alt="" />`;
      }
      return `<span class="hw-icon hw-icon-search"></span>`;
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
