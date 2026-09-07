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
    { title: "Layout", icon: "desktop_windows" },
    { title: "Tabs", icon: "view_sidebar" },
    { title: "Spaces", icon: "stacks" },
    { title: "Toolbar", icon: "visibility" },
    { title: "Privacy", icon: "security" },
    { title: "Search", icon: "search" },
    { title: "Pinned tabs", icon: "push_pin" },
    { title: "Spaces setup", icon: "home" },
    { title: "Ready", icon: "check_circle" },
  ];
  const STAGE_TOOLBAR = 4;

  const PREF_COMPACT_ENABLED = "hilal.compact.enabled";
  const PREF_COMPACT_HIDE_TOOLBOX = "hilal.compact.hide_toolbox";
  const PREF_VERTICAL_TABS = "sidebar.verticalTabs";
  const PREF_WORKSPACES_ENABLED = "hilal.workspaces.enabled";
  const PREF_PINNED_PUBLIC = "hilal.workspaces.pinned.public";

  const IS_HTTP_PREVIEW =
    typeof window !== "undefined" &&
    window.location.protocol.startsWith("http");

  const BRAND_LOGO_URL = IS_HTTP_PREVIEW
    ? "/assets/branding/about-logo.svg"
    : "chrome://branding/content/about-logo.svg";

  const TOPSITE_IMAGE_BASE = IS_HTTP_PREVIEW
    ? "/assets/tippytop/"
    : "chrome://activity-stream/content/data/content/tippytop/images/";

  const WELCOME_CSS_HREF = IS_HTTP_PREVIEW
    ? "/changes/browser/base/content/hilal/HilalWelcome.css"
    : "chrome://browser/content/hilal/HilalWelcome.css";

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
        "RFP, strict tracking protection, HTTPS-only, URL cleanup, WebGL off, cookie/cache cleanup on close.",
      l10nLabel: "hilal-welcome-privacy-standard-label",
      l10nBadge: "hilal-welcome-privacy-standard-badge",
      l10nDesc: "hilal-welcome-privacy-standard-desc",
    },
    {
      key: "strict",
      label: "Strict",
      badge: "Less exposed",
      description:
        "Adds First Party Isolation on top of Balanced. WebRTC is disabled.",
      l10nLabel: "hilal-welcome-privacy-strict-label",
      l10nBadge: "hilal-welcome-privacy-strict-badge",
      l10nDesc: "hilal-welcome-privacy-strict-desc",
    },
    {
      key: "extreme",
      label: "Maximum",
      badge: "Local only",
      description:
        "Adds JavaScript, camera, microphone, location, and history blocking on top of Strict.",
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
      icon: "work",
      workspaceColor: "orange",
    },
    {
      key: "social",
      label: "Social",
      icon: "group",
      workspaceColor: "pink",
    },
  ];

  const PINNED_SITE_PRESETS = [
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
      key: "google",
      label: "Google",
      url: "https://www.google.com/",
      initial: "G",
      color: "#4285f4",
      iconURL: `${TOPSITE_IMAGE_BASE}google-com@2x.png`,
    },
    {
      key: "wikipedia",
      label: "Wikipedia",
      url: "https://www.wikipedia.org/",
      initial: "W",
      color: "#ffffff",
      iconURL: `${TOPSITE_IMAGE_BASE}wikipedia-org@2x.png`,
    },
    {
      key: "twitter",
      label: "X / Twitter",
      url: "https://twitter.com/",
      initial: "X",
      color: "#1da1f2",
      iconURL: `${TOPSITE_IMAGE_BASE}twitter-com@2x.png`,
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

      const prefService = typeof Services !== "undefined" ? Services.prefs : null;
      this._selectedPrivacyLevel = this._normalizePrivacyLevel(
        prefService?.getStringPref("hilal.privacy.level", "standard") || "standard"
      );
      this._defaultBrowserSelected = false;
      this._compactSelected = prefService?.getBoolPref(PREF_COMPACT_ENABLED, true) ?? true;
      this._compactHideToolboxSelected = prefService?.getBoolPref(PREF_COMPACT_HIDE_TOOLBOX, true) ?? true;
      this._verticalTabsSelected = prefService?.getBoolPref(PREF_VERTICAL_TABS, false) ?? false;
      this._workspacesEnabledSelected = prefService?.getBoolPref(PREF_WORKSPACES_ENABLED, true) ?? true;
      this._pinnedPublicSelected = prefService?.getBoolPref(PREF_PINNED_PUBLIC, true) ?? true;

      this._pinnedSitesSelected = Object.fromEntries(
        PINNED_SITE_PRESETS.map(site => [site.key, false])
      );
      this._pinnedSiteTabs = {};
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
      this._style = document.createElement("link");
      this._style.id = "hilal-welcome-style";
      this._style.rel = "stylesheet";
      this._style.href = WELCOME_CSS_HREF;
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
        const parsed = typeof Services !== "undefined" ? Services.io.newURI(url) : new URL(url);
        const scheme = parsed.scheme || parsed.protocol?.replace(":", "");
        const safeSchemes = ["http", "https", "data", "chrome", "resource"];
        if (safeSchemes.includes(scheme)) {
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
        overlay = document.createElement("div");
        overlay.id = "hilal-welcome-overlay";
        overlay.className = "beer dark";
        document.documentElement.appendChild(overlay);
      }
      this._overlay = overlay;
    }

    _parseFragment(markup) {
      if (typeof MozXULElement !== "undefined" && MozXULElement.parseXULToFragment) {
        return MozXULElement.parseXULToFragment(markup);
      }
      return document.createRange().createContextualFragment(markup);
    }

    _renderIntro() {
      if (!this._overlay) {
        return;
      }

      const markup = `
        <div class="center-align middle-align" style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px;" role="dialog" aria-modal="true" aria-labelledby="hw-intro-title">
          <div class="circle extra surface-container-highest center-align middle-align" style="width: 88px; height: 88px; margin: 0 auto;">
            <img src="${BRAND_LOGO_URL}" style="width: 52px; height: 52px; display: block;" alt="" />
          </div>
          <div class="space"></div>
          <div class="chip primary bold upper">
            Welcome to Hilal
          </div>
          <div class="small-space"></div>
          <h3 class="bold" id="hw-intro-title" data-l10n-id="hilal-welcome-intro-title">Set up Hilal</h3>
          <p class="secondary-text large-text center-align" style="max-width: 480px; margin: 8px auto 0;" data-l10n-id="hilal-welcome-intro-sub">A few quick choices to make the browser yours.</p>
          <div class="large-space"></div>
          <button type="button" class="primary round large" id="hw-start-btn">
            <span data-l10n-id="hilal-welcome-action-start">Set up</span>
            <i>arrow_forward</i>
          </button>
        </div>
      `;
      this._overlay.replaceChildren(this._parseFragment(markup));
      document.getElementById("hw-start-btn")?.addEventListener("click", () => {
        this._beginFlow();
      });
    }

    async _beginFlow() {
      const button = document.getElementById("hw-start-btn");
      if (button) {
        button.disabled = true;
      }

      try {
        await this._enginesReady;
      } catch (e) {
        console.error("HilalWelcome: engine preload failed", e);
      }

      this._stage = 0;
      this._initFlowShell();
      this._renderStage();
    }

    _initFlowShell() {
      const markup = `
        <div style="min-height: 100vh; display: flex; flex-direction: column;" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title">
          <header class="fixed responsive">
            <nav style="max-width: 680px; margin: 0 auto; width: 100%;">
              <img src="${BRAND_LOGO_URL}" style="width: 24px; height: 24px; display: block;" alt="" />
              <h6 class="bold" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</h6>
              <div class="max"></div>
              <progress id="hw-progress" value="1" max="10" style="max-width: 140px;"></progress>
              <div class="chip small secondary-container" id="hw-progress-chip">1 / 10</div>
              <div class="max"></div>
              <button type="button" class="circle transparent" id="hw-skip-btn" title="Skip" aria-label="Skip">
                <i>close</i>
              </button>
            </nav>
          </header>

          <main class="responsive" style="max-width: 680px; width: 100%; margin: 0 auto; padding-top: 84px; padding-bottom: 96px; flex: 1 1 auto; overflow-y: auto;">
            <div class="center-align" id="hw-stage-head" style="margin-bottom: 24px;"></div>
            <div id="hw-stage-body"></div>
          </main>

          <footer class="fixed responsive">
            <nav id="hw-footer-nav" style="max-width: 680px; width: 100%; margin: 0 auto;"></nav>
          </footer>
        </div>
      `;
      this._overlay.replaceChildren(this._parseFragment(markup));

      document.getElementById("hw-skip-btn")?.addEventListener("click", () => {
        this._dismiss();
      });
    }

    _renderStage() {
      if (!this._overlay) {
        return;
      }

      if (!document.getElementById("hw-stage-body")) {
        this._initFlowShell();
      }

      const visible = this._visibleStages();
      const currentVisual = this._visibleStageIndex();

      const progressEl = document.getElementById("hw-progress");
      if (progressEl) {
        progressEl.value = currentVisual + 1;
        progressEl.max = visible.length;
      }

      const progressChip = document.getElementById("hw-progress-chip");
      if (progressChip) {
        progressChip.textContent = `${currentVisual + 1} / ${visible.length}`;
      }

      const headEl = document.getElementById("hw-stage-head");
      if (headEl) {
        headEl.innerHTML = this._stageCopyHTML();
      }

      const bodyEl = document.getElementById("hw-stage-body");
      if (bodyEl) {
        bodyEl.innerHTML = this._stageHTML();
      }

      const footerNavEl = document.getElementById("hw-footer-nav");
      if (footerNavEl) {
        footerNavEl.innerHTML = this._actionsHTML();
      }

      this._attachStageListeners();
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

    _stageCopyHTML() {
      const stageCopies = [
        {
          kicker: "First choices",
          title: "Choose what starts with Hilal.",
          subtitle:
            "Bring data from another browser and set Hilal as your default.",
        },
        {
          kicker: "Layout",
          title: "Pick a density.",
          subtitle:
            "Standard keeps the toolbar fixed. Compact hides it until you need it.",
        },
        {
          kicker: "Tabs",
          title: "Choose a tab direction.",
          subtitle:
            "Vertical tabs sit in a sidebar. Horizontal tabs line up across the top.",
        },
        {
          kicker: "Spaces",
          title: "Separate your contexts.",
          subtitle:
            "Spaces keep personal, work, and social tabs in their own groups.",
        },
        {
          kicker: "Toolbar",
          title: "Control the toolbar.",
          subtitle:
            "Auto-hide reveals the address bar on hover. Always visible keeps it fixed.",
        },
        {
          kicker: "Privacy",
          title: "Pick a protection level.",
          subtitle:
            "Hilal can stay comfortable for daily browsing or tighten site tracking surfaces.",
        },
        {
          kicker: "Search",
          title: "Choose the address-bar engine.",
          subtitle:
            "Used when you type into the bar. You can change it any time.",
        },
        {
          kicker: "Pinned tabs",
          title: "Keep essentials one click away.",
          subtitle:
            "Select sites to pin at startup. They stay in the sidebar across sessions.",
        },
        {
          kicker: "Spaces setup",
          title: "Start with a few spaces.",
          subtitle: "Create spaces now, or skip and shape it later.",
        },
        {
          kicker: "Done",
          title: "Ready.",
          subtitle:
            "Your choices are saved. Hilal will close this setup and open the browser.",
        },
      ];
      const copy = stageCopies[this._stage];
      return `
        <div class="chip primary bold upper" data-l10n-id="hilal-welcome-stage-${this._stage}-kicker">
          ${copy.kicker}
        </div>
        <div class="small-space"></div>
        <h4 class="bold no-margin" id="hw-stage-title" data-l10n-id="hilal-welcome-stage-${this._stage}-title">${copy.title}</h4>
        <p class="secondary-text medium-text no-margin" style="margin-top: 8px;" data-l10n-id="hilal-welcome-stage-${this._stage}-subtitle">${copy.subtitle}</p>
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
        <button type="button" class="border round large" id="hw-prev-btn"${isFirst ? ' disabled="disabled"' : ""}>
          <i>arrow_back</i>
          <span data-l10n-id="hilal-welcome-action-back">Back</span>
        </button>
        <div class="max"></div>
        <button type="button" class="primary round large" id="${primaryId}">
          <span data-l10n-id="${primaryL10nId}">${primaryFallback}</span>
          <i>${isLast ? "check" : "arrow_forward"}</i>
        </button>
      `;
    }

    /* ----------------------------------------------------------
       Pure Beer CSS Semantic Markup (No Custom Classes)
       ---------------------------------------------------------- */

    _firstChoicesHTML() {
      return `
        <article class="border round">
          <div class="row">
            <i>home</i>
            <div class="max">
              <h6 class="small bold no-margin" data-l10n-id="hilal-welcome-default-browser-label">Default browser</h6>
              <div class="small-text secondary-text" data-l10n-id="hilal-welcome-default-browser-desc">Open system web links in Hilal.</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? ' checked="checked"' : ""}/>
              <span></span>
            </label>
          </div>
          <hr>
          <div class="row">
            <i>sync</i>
            <div class="max">
              <h6 class="small bold no-margin" data-l10n-id="hilal-welcome-import-label">Browser data</h6>
              <div class="small-text secondary-text" data-l10n-id="hilal-welcome-import-desc">Bring bookmarks, history, and passwords from another browser.</div>
            </div>
            <button type="button" class="border round" id="hw-import-btn" data-l10n-id="hilal-welcome-import-button">
              <span data-l10n-id="hilal-welcome-import-button">Import</span>
              <i>arrow_forward</i>
            </button>
          </div>
        </article>
      `;
    }

    _layoutModeHTML() {
      const standard = !this._compactSelected;
      const compact = this._compactSelected;
      return `
        <div class="grid">
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-layout-mode="standard">
              <div>
                <div class="row">
                  <i>desktop_windows</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Standard</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="layout-choice" value="standard"${standard ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">Full toolbar, always visible. Ideal for classic browsing.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip">Default</div>
              </div>
            </article>
          </div>
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-layout-mode="compact">
              <div>
                <div class="row">
                  <i>fullscreen</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Compact</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="layout-choice" value="compact"${compact ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">More page, less chrome. Address bar reveals on hover.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip primary">Immersive</div>
              </div>
            </article>
          </div>
        </div>
      `;
    }

    _tabOrientationHTML() {
      const vertical = this._verticalTabsSelected;
      return `
        <div class="grid">
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-tab-layout="vertical">
              <div>
                <div class="row">
                  <i>view_sidebar</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Vertical</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="tabs-choice" value="vertical"${vertical ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">Tabs sit in a sleek sidebar panel. Great for modern widescreen displays.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip primary">Modern</div>
              </div>
            </article>
          </div>
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-tab-layout="horizontal">
              <div>
                <div class="row">
                  <i>tab</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Horizontal</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="tabs-choice" value="horizontal"${!vertical ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">Tabs line up across the top bar. Familiar, classic workflow.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip">Classic</div>
              </div>
            </article>
          </div>
        </div>
      `;
    }

    _workspacesToggleHTML() {
      const on = this._workspacesEnabledSelected;
      return `
        <div class="grid">
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-workspaces="on">
              <div>
                <div class="row">
                  <i>stacks</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Spaces on</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="spaces-choice" value="on"${on ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">Group tabs into separate contexts (Personal, Work, Social) with isolated cookies.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip primary">Recommended</div>
              </div>
            </article>
          </div>
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-workspaces="off">
              <div>
                <div class="row">
                  <i>tab_unselected</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Spaces off</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="spaces-choice" value="off"${!on ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">One single browser window without workspace isolation.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip">Simple</div>
              </div>
            </article>
          </div>
        </div>
      `;
    }

    _hideToolbarHTML() {
      const hidden = this._compactHideToolboxSelected;
      return `
        <div class="grid">
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-toolbar="hidden">
              <div>
                <div class="row">
                  <i>visibility_off</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Auto-hide</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="toolbar-choice" value="hidden"${hidden ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">Toolbar stays hidden to maximize screen space; reveal by hovering the top.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip primary">Auto-hide</div>
              </div>
            </article>
          </div>
          <div class="s6">
            <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-toolbar="visible">
              <div>
                <div class="row">
                  <i>visibility</i>
                  <div class="max">
                    <h6 class="small bold no-margin">Always visible</h6>
                  </div>
                  <label class="radio">
                    <input type="radio" name="toolbar-choice" value="visible"${!hidden ? ' checked="checked"' : ""}/>
                    <span></span>
                  </label>
                </div>
                <div class="small-space"></div>
                <p class="small-text secondary-text no-margin">The toolbar stays fixed at the top even in compact mode.</p>
              </div>
              <div style="margin-top: 16px;">
                <div class="chip">Fixed</div>
              </div>
            </article>
          </div>
        </div>
      `;
    }

    _privacyLevelsHTML() {
      const icons = {
        standard: "verified_user",
        strict: "security",
        extreme: "lock",
      };
      return `
        <article class="border round">
          ${PRIVACY_LEVELS.map((level, idx) => {
            const active = this._selectedPrivacyLevel === level.key;
            return `
              ${idx > 0 ? `<hr>` : ""}
              <div class="row" style="cursor: pointer; padding: 12px 0;" data-privacy-level="${level.key}">
                <i>${icons[level.key]}</i>
                <div class="max">
                  <div class="row" style="align-items: center; gap: 8px;">
                    <h6 class="small bold no-margin" data-l10n-id="${level.l10nLabel}">${level.label}</h6>
                    <div class="chip small">${level.badge}</div>
                  </div>
                  <div class="small-text secondary-text" style="margin-top: 4px;" data-l10n-id="${level.l10nDesc}">${level.description}</div>
                </div>
                <label class="radio">
                  <input type="radio" name="privacy-choice" value="${level.key}"${active ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
            `;
          }).join("")}
        </article>
      `;
    }

    _enginesHTML() {
      const colClass = this._engines.length === 3 ? "s12 m4" : "s12 m6";
      return `
        <div class="grid">
          ${this._engines.map((engine, index) => {
            const name = this._escapeHTML(engine.name);
            const isActive = this._selectedEngine?.name === engine.name;
            const isDuckDuckGo = engine.name.toLowerCase().includes("duckduckgo");
            return `
              <div class="${colClass}">
                <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-idx="${index}">
                  <div>
                    <div class="row">
                      ${this._engineIconHTML(engine)}
                      <div class="max">
                        <h6 class="small bold no-margin">${name}</h6>
                      </div>
                      <label class="radio">
                        <input type="radio" name="engine-choice" value="${index}"${isActive ? ' checked="checked"' : ""}/>
                        <span></span>
                      </label>
                    </div>
                  </div>
                  <div style="margin-top: 16px;">
                    ${isDuckDuckGo ? `<div class="chip primary bold" data-l10n-id="hilal-welcome-recommended">Recommended</div>` : `<div class="chip">Search</div>`}
                  </div>
                </article>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    _pinnedTabsHTML() {
      const sites = PINNED_SITE_PRESETS;
      return `
        <article class="border round">
          <div class="row">
            <i>push_pin</i>
            <div class="max">
              <h6 class="small bold no-margin" data-l10n-id="hilal-welcome-pinned-public-label">Show in every space</h6>
              <div class="small-text secondary-text" data-l10n-id="hilal-welcome-pinned-public-desc">Pinned tabs stay visible when you switch workspaces.</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="hw-pinned-public-toggle"${this._pinnedPublicSelected ? ' checked="checked"' : ""}/>
              <span></span>
            </label>
          </div>
        </article>
        <div class="space"></div>
        <div class="grid">
          ${sites.map(site => {
            const active = this._pinnedSitesSelected[site.key];
            const domain = site.url
              .replace(/^https?:\/\/(www\.)?/, "")
              .replace(/\/$/, "");
            return `
              <div class="s6 m4">
                <article class="border round" style="cursor: pointer; height: 100%; display: flex; flex-direction: column; justify-content: space-between;" data-pinned-site="${site.key}">
                  <div>
                    <div class="row">
                      ${
                        site.iconURL
                          ? `<img src="${this._escapeHTML(site.iconURL)}" style="width: 24px; height: 24px; object-fit: contain; display: block;" alt="" />`
                          : `<div class="circle small surface-container center-align middle-align"><b>${this._escapeHTML(site.initial)}</b></div>`
                      }
                      <div class="max"></div>
                      <label class="checkbox">
                        <input type="checkbox"${active ? ' checked="checked"' : ""}/>
                        <span></span>
                      </label>
                    </div>
                    <div class="small-space"></div>
                    <h6 class="small bold no-margin">${this._escapeHTML(site.label)}</h6>
                    <div class="small-text secondary-text">${this._escapeHTML(domain)}</div>
                  </div>
                </article>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    _workspacesHTML() {
      if (!this._workspacesEnabledSelected) {
        return `
          <article class="border round">
            <div class="row">
              <i>tab_unselected</i>
              <div class="max">
                <h6 class="small bold no-margin" data-l10n-id="hilal-welcome-workspaces-disabled-label">Spaces are off</h6>
                <div class="small-text secondary-text" data-l10n-id="hilal-welcome-workspaces-disabled-desc">Hilal will open with one clean browser space. You can turn spaces on in Settings later.</div>
              </div>
            </div>
          </article>
        `;
      }

      const icons = { personal: "home", work: "work", social: "group" };
      return `
        <article class="border round">
          ${WORKSPACE_PRESETS.map((item, idx) => {
            const active = this._workspacesSelected[item.key];
            return `
              ${idx > 0 ? `<hr>` : ""}
              <div class="row" style="cursor: pointer; padding: 12px 0;" data-workspace="${item.key}">
                <i>${icons[item.key] || "folder"}</i>
                <div class="max">
                  <h6 class="small bold no-margin" data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</h6>
                  <div class="small-text secondary-text hw-workspace-status" data-l10n-id="hilal-welcome-workspace-state-${active ? "added" : "skipped"}">${active ? "Will be created" : "Skipped"}</div>
                </div>
                <label class="checkbox">
                  <input type="checkbox"${active ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
            `;
          }).join("")}
        </article>
      `;
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
        ? selectedPinnedSites
            .map(site => this._escapeHTML(site.label))
            .join(", ")
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
        {
          label: "Layout",
          value: this._compactSelected ? "Compact" : "Standard",
          icon: "desktop_windows",
          l10nKey: "hilal-welcome-summary-layout",
          l10nValue: `hilal-welcome-summary-layout-${this._compactSelected ? "compact" : "standard"}`,
        },
        {
          label: "Tabs",
          value: this._verticalTabsSelected ? "Vertical" : "Horizontal",
          icon: "view_sidebar",
          l10nKey: "hilal-welcome-summary-tabs",
          l10nValue: `hilal-welcome-summary-tabs-${this._verticalTabsSelected ? "vertical" : "horizontal"}`,
        },
        {
          label: "Search",
          value: engineName,
          icon: "search",
          l10nKey: "hilal-welcome-summary-search",
          l10nValue: null,
        },
        {
          label: "Privacy",
          value: this._escapeHTML(privacyLevel.label),
          icon: "security",
          l10nKey: "hilal-welcome-summary-privacy",
          l10nValue: null,
        },
        {
          label: "Pinned tabs",
          value: pinnedTabsText,
          icon: "push_pin",
          l10nKey: "hilal-welcome-summary-pinned-tabs",
          l10nValue: null,
        },
        {
          label: "Spaces",
          value: workspacesText,
          icon: "stacks",
          l10nKey: "hilal-welcome-summary-workspaces",
          l10nValue: null,
        },
        {
          label: "Default browser",
          value: this._defaultBrowserSelected ? "Set as default" : "No change",
          icon: "home",
          l10nKey: "hilal-welcome-summary-default-browser",
          l10nValue: `hilal-welcome-summary-default-${this._defaultBrowserSelected ? "set" : "no-change"}`,
        },
      ];

      return `
        <div class="center-align">
          <div class="circle extra primary-container center-align middle-align" style="margin: 0 auto 16px; width: 64px; height: 64px;">
            <i>check</i>
          </div>
          <h4 class="bold no-margin">You're all set</h4>
          <p class="secondary-text medium-text">Here is a quick overview of your configuration.</p>
        </div>
        <div class="space"></div>
        <article class="border round">
          ${rows
            .map(
              (row, idx) => `
            ${idx > 0 ? `<hr>` : ""}
            <div class="row" style="padding: 10px 0;">
              <div class="row" style="align-items: center; gap: 8px;">
                <i class="secondary-text">${row.icon}</i>
                <span class="secondary-text">${row.label}</span>
              </div>
              <div class="max"></div>
              <span class="bold"${row.l10nValue ? ` data-l10n-id="${row.l10nValue}"` : ""}>${row.value}</span>
            </div>
          `
            )
            .join("")}
        </article>
      `;
    }

    /* ----------------------------------------------------------
       Interactive Selection (Pure Beer CSS, No DOM wiping)
       ---------------------------------------------------------- */

    _attachStageListeners() {
      const onClick = (id, fn) => {
        const element = document.getElementById(id);
        if (element) {
          element.addEventListener("click", fn);
        }
      };

      onClick("hw-next-btn", () => this._next());
      onClick("hw-prev-btn", () => this._prev());
      onClick("hw-finish-btn", () => this._finish());

      // Stage 0: Default browser
      const defaultBrowserToggle = document.getElementById(
        "hw-default-browser-toggle"
      );
      if (defaultBrowserToggle) {
        defaultBrowserToggle.addEventListener("change", event => {
          this._defaultBrowserSelected = event.target.checked;
        });
      }

      // Stage 0: Import button
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

      // Stage 1: Layout Density
      const layoutArticles = this._overlay.querySelectorAll("[data-layout-mode]");
      layoutArticles.forEach(art => {
        const radio = art.querySelector('input[type="radio"]');
        const handler = () => {
          this._compactSelected = art.dataset.layoutMode === "compact";
          if (typeof Services !== "undefined") {
            Services.prefs.setBoolPref(PREF_COMPACT_ENABLED, this._compactSelected);
          }
          if (radio) radio.checked = true;
        };
        art.addEventListener("click", handler);
      });

      // Stage 2: Tab Orientation
      const tabArticles = this._overlay.querySelectorAll("[data-tab-layout]");
      tabArticles.forEach(art => {
        const radio = art.querySelector('input[type="radio"]');
        const handler = () => {
          this._verticalTabsSelected = art.dataset.tabLayout === "vertical";
          if (typeof Services !== "undefined") {
            Services.prefs.setBoolPref(
              PREF_VERTICAL_TABS,
              this._verticalTabsSelected
            );
            const isSidebarActive =
              this._verticalTabsSelected || this._workspacesEnabledSelected;
            Services.prefs.setBoolPref("sidebar.revamp", isSidebarActive);
          }
          if (radio) radio.checked = true;
        };
        art.addEventListener("click", handler);
      });

      // Stage 3: Spaces
      const wsArticles = this._overlay.querySelectorAll("[data-workspaces]");
      wsArticles.forEach(art => {
        const radio = art.querySelector('input[type="radio"]');
        const handler = () => {
          this._workspacesEnabledSelected = art.dataset.workspaces === "on";
          if (typeof Services !== "undefined") {
            Services.prefs.setBoolPref(
              PREF_WORKSPACES_ENABLED,
              this._workspacesEnabledSelected
            );
            const isSidebarActive =
              this._verticalTabsSelected || this._workspacesEnabledSelected;
            Services.prefs.setBoolPref("sidebar.revamp", isSidebarActive);
          }
          if (radio) radio.checked = true;
        };
        art.addEventListener("click", handler);
      });

      // Stage 4: Toolbar
      const tbArticles = this._overlay.querySelectorAll("[data-toolbar]");
      tbArticles.forEach(art => {
        const radio = art.querySelector('input[type="radio"]');
        const handler = () => {
          this._compactHideToolboxSelected =
            art.dataset.toolbar === "hidden";
          if (typeof Services !== "undefined") {
            Services.prefs.setBoolPref(
              PREF_COMPACT_HIDE_TOOLBOX,
              this._compactHideToolboxSelected
            );
          }
          if (radio) radio.checked = true;
        };
        art.addEventListener("click", handler);
      });

      // Stage 5: Privacy
      const privacyRows = this._overlay.querySelectorAll("[data-privacy-level]");
      privacyRows.forEach(row => {
        const radio = row.querySelector('input[type="radio"]');
        const handler = () => {
          this._selectedPrivacyLevel = this._normalizePrivacyLevel(
            row.dataset.privacyLevel
          );
          if (radio) radio.checked = true;
        };
        row.addEventListener("click", handler);
      });

      // Stage 6: Engines
      const engineArticles = this._overlay.querySelectorAll("[data-idx]");
      engineArticles.forEach(art => {
        const radio = art.querySelector('input[type="radio"]');
        const handler = () => {
          const index = parseInt(art.dataset.idx, 10);
          this._selectedEngine = this._engines[index];
          if (radio) radio.checked = true;
        };
        art.addEventListener("click", handler);
      });

      // Stage 7: Pinned Public Toggle
      const pinnedPublicToggle = document.getElementById(
        "hw-pinned-public-toggle"
      );
      if (pinnedPublicToggle) {
        pinnedPublicToggle.addEventListener("change", event => {
          this._pinnedPublicSelected = event.target.checked;
          if (typeof Services !== "undefined") {
            Services.prefs.setBoolPref(
              PREF_PINNED_PUBLIC,
              this._pinnedPublicSelected
            );
          }
        });
      }

      // Stage 7: Pinned Sites
      const pinnedArticles = this._overlay.querySelectorAll("[data-pinned-site]");
      pinnedArticles.forEach(art => {
        const checkbox = art.querySelector('input[type="checkbox"]');
        const handler = event => {
          if (event.target !== checkbox && checkbox) {
            checkbox.checked = !checkbox.checked;
          }
          const key = art.dataset.pinnedSite;
          this._pinnedSitesSelected[key] = checkbox ? checkbox.checked : !this._pinnedSitesSelected[key];
          this._togglePinnedSite(key, this._pinnedSitesSelected[key]);
        };
        art.addEventListener("click", handler);
      });

      // Stage 8: Workspace Presets
      const wsRows = this._overlay.querySelectorAll("[data-workspace]");
      wsRows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        const handler = event => {
          if (event.target !== checkbox && checkbox) {
            checkbox.checked = !checkbox.checked;
          }
          const key = row.dataset.workspace;
          this._workspacesSelected[key] = checkbox ? checkbox.checked : !this._workspacesSelected[key];
          const statusEl = row.querySelector(".hw-workspace-status");
          if (statusEl) {
            const active = this._workspacesSelected[key];
            statusEl.textContent = active ? "Will be created" : "Skipped";
            statusEl.setAttribute(
              "data-l10n-id",
              `hilal-welcome-workspace-state-${active ? "added" : "skipped"}`
            );
          }
        };
        row.addEventListener("click", handler);
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
              if (document.l10n?.formatValue) {
                label = await document.l10n.formatValue(
                  `hilal-welcome-workspace-label-${item.key}`
                );
              }
            } catch (e) {
              console.error(
                "HilalWelcome: failed to format workspace label",
                e
              );
            }
            if (typeof this._workspaces.ensureWorkspace === "function") {
              this._workspaces.ensureWorkspace(label, "", item.workspaceColor);
            } else if (typeof this._workspaces.create === "function") {
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
        if (typeof Services !== "undefined") {
          Services.prefs.setStringPref(
            "hilal.privacy.level",
            this._normalizePrivacyLevel(this._selectedPrivacyLevel)
          );
        }
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
          let tab = this._pinnedSiteTabs[site.key];
          if (tab && !gBrowser.tabs.includes(tab)) {
            tab = null;
            this._pinnedSiteTabs[site.key] = null;
          }
          if (!tab) {
            tab = this._findExistingTabForURL(site.url);
          }
          if (!tab) {
            tab = gBrowser.addTrustedTab(site.url, {
              inBackground: true,
              createLazyBrowser: true,
              userContextId,
            });
            this._pinnedSiteTabs[site.key] = tab;
          }
          if (tab && !tab.pinned) {
            gBrowser.pinTab(tab);
          }
        } catch (e) {
          console.error(`HilalWelcome: failed to pin ${site.label}`, e);
        }
      }
    }

    _togglePinnedSite(key, selected) {
      if (
        typeof gBrowser === "undefined" ||
        typeof gBrowser.addTrustedTab !== "function" ||
        typeof gBrowser.pinTab !== "function"
      ) {
        return;
      }
      const site = PINNED_SITE_PRESETS.find(s => s.key === key);
      if (!site) {
        return;
      }
      let tab = this._pinnedSiteTabs[key];
      if (tab && !gBrowser.tabs.includes(tab)) {
        tab = null;
        this._pinnedSiteTabs[key] = null;
      }

      if (selected) {
        if (!tab) {
          const userContextId = this._workspaces?.activeContainerId || 0;
          try {
            tab = gBrowser.addTrustedTab(site.url, {
              inBackground: true,
              createLazyBrowser: true,
              userContextId,
            });
            if (tab) {
              gBrowser.pinTab(tab);
              this._pinnedSiteTabs[key] = tab;
            }
          } catch (e) {
            console.error(`HilalWelcome: failed to pin ${site.label}`, e);
          }
        } else if (!tab.pinned) {
          gBrowser.pinTab(tab);
        }
      } else {
        if (tab) {
          gBrowser.removeTab(tab);
          this._pinnedSiteTabs[key] = null;
        }
      }
    }

    _findExistingTabForURL(url) {
      const normalizedURL = this._normalizeURLForCompare(url);
      if (typeof gBrowser === "undefined" || !gBrowser.tabs) {
        return null;
      }
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
      if (typeof Services === "undefined") {
        return;
      }
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
      if (typeof Services === "undefined") {
        return;
      }
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
          this._workspaces._apply?.();
          this._workspaces._updateUI?.();
        } catch (e) {
          console.error("HilalWelcome: failed to refresh workspaces", e);
        }
      }

      try {
        window.maximize?.();
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

    _engineIconHTML(engine) {
      const name = engine.name.toLowerCase();
      let iconURL = engine.iconURL;

      if (name.includes("duckduckgo")) {
        iconURL = IS_HTTP_PREVIEW
          ? "/assets/tippytop/duckduckgo-com@2x.svg"
          : "chrome://activity-stream/content/data/content/tippytop/images/duckduckgo-com@2x.svg";
      } else if (name.includes("google")) {
        iconURL = IS_HTTP_PREVIEW
          ? "/assets/tippytop/google-com@2x.png"
          : "chrome://activity-stream/content/data/content/tippytop/images/google-com@2x.png";
      } else if (name.includes("bing")) {
        iconURL = IS_HTTP_PREVIEW
          ? "/assets/tippytop/bing-com@2x.svg"
          : "chrome://activity-stream/content/data/content/tippytop/images/bing-com@2x.svg";
      }

      if (iconURL) {
        return `<img src="${this._escapeHTML(iconURL)}" style="width: 24px; height: 24px; object-fit: contain; display: block;" alt="" />`;
      }
      return `<i>search</i>`;
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
