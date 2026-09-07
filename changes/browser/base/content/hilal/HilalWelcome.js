/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, MigrationUtils, ChromeUtils, MozXULElement, gBrowser */

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
    { key: "appearance", title: "Appearance", kicker: "Appearance", icon: "palette" },
    { key: "workflow", title: "Tabs & Spaces", kicker: "Workflow", icon: "view_sidebar" },
    { key: "privacy", title: "Privacy & Search", kicker: "Protection", icon: "security" },
    { key: "ready", title: "Getting Started", kicker: "Ready", icon: "rocket_launch" },
  ];

  const PREF_THEME_OVERRIDE = "layout.css.prefers-color-scheme.content-override";
  const PREF_ACCENT_MODE = "hilal.theme.accentMode";
  const PREF_GLOBAL_ACCENT = "hilal.theme.globalAccentColor";
  const PREF_COMPACT_ENABLED = "hilal.compact.enabled";
  const PREF_VERTICAL_TABS = "sidebar.verticalTabs";
  const PREF_SIDEBAR_REVAMP = "sidebar.revamp";
  const PREF_WORKSPACES_ENABLED = "hilal.workspaces.enabled";
  const PREF_PINNED_PUBLIC = "hilal.workspaces.pinned.public";
  const PREF_PRIVACY_LEVEL = "hilal.privacy.level";
  const PREF_SEEN = "hilal.welcome-screen.seen";

  const IS_HTTP_PREVIEW =
    typeof window !== "undefined" &&
    window.location.protocol.startsWith("http");

  const BRAND_LOGO_URL = IS_HTTP_PREVIEW
    ? "/assets/branding/about-logo@2x.png"
    : "chrome://branding/content/about-logo@2x.png";

  const TOPSITE_IMAGE_BASE = IS_HTTP_PREVIEW
    ? "/assets/tippytop/"
    : "chrome://activity-stream/content/data/content/tippytop/images/";

  const HTML_NS = "http://www.w3.org/1999/xhtml";

  const WELCOME_CSS_HREF = IS_HTTP_PREVIEW
    ? "/changes/browser/base/content/hilal/HilalWelcome.css"
    : "chrome://browser/content/hilal/HilalWelcome.css";

  const SEARCH_ENGINE_PLACEHOLDER =
    "chrome://browser/skin/search-engine-placeholder.png";
  const SEARCH_ENGINE_PLACEHOLDER_2X =
    "chrome://browser/skin/search-engine-placeholder@2x.png";

  const ACCENT_COLOR_SWATCHES = [
    { id: "blue", hex: "#0b57d0", label: "Hilal Blue" },
    { id: "purple", hex: "#af51f5", label: "Purple" },
    { id: "turquoise", hex: "#00c79a", label: "Turquoise" },
    { id: "green", hex: "#51cd00", label: "Green" },
    { id: "yellow", hex: "#ffcb00", label: "Yellow" },
    { id: "orange", hex: "#ff9f00", label: "Orange" },
    { id: "red", hex: "#ff613d", label: "Red" },
    { id: "pink", hex: "#ff4bda", label: "Pink" },
  ];

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
      hex: "#0b57d0",
    },
    {
      key: "work",
      label: "Work",
      icon: "work",
      workspaceColor: "orange",
      hex: "#ff9f00",
    },
    {
      key: "social",
      label: "Social",
      icon: "group",
      workspaceColor: "pink",
      hex: "#ff4bda",
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
      label: "X",
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

      // Theme & Accent Colors (M3 Expressive)
      this._selectedThemeMode = prefService?.getIntPref(PREF_THEME_OVERRIDE, 2) ?? 2;
      this._selectedAccentMode = prefService?.getStringPref(PREF_ACCENT_MODE, "workspace") || "workspace";
      this._selectedGlobalAccent = prefService?.getStringPref(PREF_GLOBAL_ACCENT, "#0b57d0") || "#0b57d0";

      // Workflow & Layout
      this._verticalTabsSelected = prefService?.getBoolPref(PREF_VERTICAL_TABS, false) ?? false;
      this._workspacesEnabledSelected = true;
      this._pinnedPublicSelected = prefService?.getBoolPref(PREF_PINNED_PUBLIC, true) ?? true;
      this._workspacesSelected = { personal: true, work: true, social: true };

      // Privacy & Search
      this._selectedPrivacyLevel = this._normalizePrivacyLevel(
        prefService?.getStringPref(PREF_PRIVACY_LEVEL, "standard") || "standard"
      );

      // Getting Started
      this._defaultBrowserSelected = false;
      this._pinnedSitesSelected = Object.fromEntries(
        PINNED_SITE_PRESETS.map(site => [site.key, false])
      );
      this._pinnedSiteTabs = {};
    }

    async start() {
      this._injectStyles();
      this._enterWelcomeStage();
      this._createOverlay();
      this._applyLiveTheme();
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
      this._style = document.createElementNS(HTML_NS, "link");
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

    _createOverlay() {
      let overlay = document.getElementById("hilal-welcome-overlay");
      if (!overlay) {
        overlay = document.createElementNS(HTML_NS, "div");
        overlay.id = "hilal-welcome-overlay";
        overlay.className = "beer";
        (document.body || document.documentElement).appendChild(overlay);
      }
      this._overlay = overlay;
    }

    _applyLiveTheme() {
      if (!this._overlay) return;
      let isDark = false;
      if (this._selectedThemeMode === 0) {
        isDark = true;
      } else if (this._selectedThemeMode === 1) {
        isDark = false;
      } else {
        isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      this._overlay.classList.remove("light", "dark");
      this._overlay.classList.add(isDark ? "dark" : "light");
      this._overlay.style.colorScheme = isDark ? "dark" : "light";

      if (IS_HTTP_PREVIEW && document.body) {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(isDark ? "dark" : "light");
      }

      this._applyLiveAccentColor(isDark);
    }

    _applyLiveAccentColor(isDark) {
      if (!this._overlay) return;
      if (typeof isDark === "undefined") {
        if (this._selectedThemeMode === 0) {
          isDark = true;
        } else if (this._selectedThemeMode === 1) {
          isDark = false;
        } else {
          isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
      }

      let accent = this._selectedGlobalAccent || "#0b57d0";
      if (this._selectedAccentMode === "workspace") {
        accent = isDark ? "#a8c7fa" : "#0b57d0";
      } else if (this._selectedAccentMode === "boosts") {
        accent = "#00c79a";
      }

      this._overlay.style.setProperty("--primary", accent);
      this._overlay.style.setProperty("--primary-glow", `color-mix(in srgb, ${accent} 25%, transparent)`);
      if (isDark) {
        this._overlay.style.setProperty("--primary-container", `color-mix(in srgb, ${accent} 28%, #1a2234)`);
        this._overlay.style.setProperty("--on-primary-container", `color-mix(in srgb, ${accent} 35%, #ffffff)`);
      } else {
        this._overlay.style.setProperty("--primary-container", `color-mix(in srgb, ${accent} 16%, #f0f4f9)`);
        this._overlay.style.setProperty("--on-primary-container", `color-mix(in srgb, ${accent} 80%, #041e49)`);
      }
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
      if (!iconMap) return "";
      const widths = Object.keys(iconMap)
        .map(width => parseInt(width, 10))
        .filter(width => Number.isFinite(width))
        .sort((a, b) => a - b);
      if (!widths.length) return "";
      const bestWidth = widths.find(w => w >= 32) || widths[widths.length - 1];
      return iconMap[bestWidth] || "";
    }

    _searchEnginePlaceholder() {
      return window.devicePixelRatio > 1
        ? SEARCH_ENGINE_PLACEHOLDER_2X
        : SEARCH_ENGINE_PLACEHOLDER;
    }

    _sanitizeIconURL(url) {
      if (!url) return "";
      try {
        const parsed = typeof Services !== "undefined" ? Services.io.newURI(url) : new URL(url);
        const scheme = parsed.scheme || parsed.protocol?.replace(":", "");
        const safeSchemes = ["http", "https", "data", "chrome", "resource"];
        if (safeSchemes.includes(scheme)) return url;
      } catch (e) {
        const cleanUrl = String(url).trim().toLowerCase();
        if (/^(https?|data|chrome|resource):/i.test(cleanUrl)) return url;
      }
      return "";
    }

    _setHTML(element, markup) {
      if (!element) return;
      element.replaceChildren(this._parseFragment(markup));
    }

    _parseFragment(markup) {
      const doc = new DOMParser().parseFromString(markup, "text/html");
      const frag = document.createDocumentFragment();
      while (doc.body.firstChild) {
        frag.appendChild(document.adoptNode(doc.body.firstChild));
      }
      return frag;
    }

    _renderIntro() {
      if (!this._overlay) return;

      const markup = `
        <div class="hw-overlay-center">
          <article class="hw-card hw-intro-card" role="dialog" aria-modal="true" aria-labelledby="hw-intro-title">
            <div class="hw-intro-logo-wrap">
              <img src="${BRAND_LOGO_URL}" class="hw-intro-logo" alt="" />
            </div>
            <div class="hw-badge-chip">
              <i>auto_awesome</i>
              <span>Hilal Browser</span>
            </div>
            <h2 class="hw-intro-heading" id="hw-intro-title" data-l10n-id="hilal-welcome-intro-title">Welcome to Hilal</h2>
            <p class="hw-intro-subtitle" data-l10n-id="hilal-welcome-intro-sub">A fast, private, and expressive web browser built around workspaces and solid Material 3 design.</p>
            
            <div class="hw-intro-pills">
              <div class="hw-pill-feature"><i>palette</i><span>Expressive Theming</span></div>
              <div class="hw-pill-feature"><i>view_sidebar</i><span>Isolated Workspaces</span></div>
              <div class="hw-pill-feature"><i>security</i><span>Zero Tracker Leaks</span></div>
            </div>

            <div class="hw-intro-cta-wrap">
              <button type="button" class="hw-btn-primary" id="hw-start-btn">
                <span data-l10n-id="hilal-welcome-action-start">Get Started</span>
                <i>arrow_forward</i>
              </button>
            </div>
          </article>
        </div>
      `;
      this._setHTML(this._overlay, markup);
      document.getElementById("hw-start-btn")?.addEventListener("click", () => {
        this._beginFlow();
      });
    }

    async _beginFlow() {
      const button = document.getElementById("hw-start-btn");
      if (button) button.disabled = true;

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
        <div class="hw-overlay-center">
          <article class="hw-card hw-flow-card" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title">
            <header class="hw-header">
              <div class="hw-header-brand">
                <img src="${BRAND_LOGO_URL}" class="hw-header-logo" alt="" />
                <span class="hw-header-title" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</span>
              </div>
              <div class="hw-stepper-wrap" id="hw-stepper"></div>
              <button type="button" class="hw-btn-icon" id="hw-skip-btn" title="Skip" aria-label="Skip">
                <i>close</i>
              </button>
            </header>

            <div id="hw-stage-container" class="hw-stage-scroll hw-stage-enter">
              <div id="hw-stage-head" class="hw-stage-head"></div>
              <div id="hw-stage-body" class="hw-stage-body"></div>
            </div>

            <footer class="hw-footer">
              <nav id="hw-footer-nav" class="hw-footer-nav"></nav>
            </footer>
          </article>
        </div>
      `;
      this._setHTML(this._overlay, markup);

      document.getElementById("hw-skip-btn")?.addEventListener("click", () => {
        this._dismiss();
      });
    }

    _renderStage() {
      if (!this._overlay) return;

      if (!document.getElementById("hw-stage-body")) {
        this._initFlowShell();
      }

      // Stepper
      const stepperEl = document.getElementById("hw-stepper");
      if (stepperEl) {
        this._setHTML(stepperEl, this._stepperHTML());
      }

      // Stage Header
      const headEl = document.getElementById("hw-stage-head");
      if (headEl) {
        this._setHTML(headEl, this._stageCopyHTML());
      }

      // Stage Body
      const bodyEl = document.getElementById("hw-stage-body");
      if (bodyEl) {
        this._setHTML(bodyEl, this._stageHTML());
      }

      // Footer Navigation
      const footerNavEl = document.getElementById("hw-footer-nav");
      if (footerNavEl) {
        this._setHTML(footerNavEl, this._actionsHTML());
      }

      // Entrance animation
      const containerEl = document.getElementById("hw-stage-container");
      if (containerEl) {
        containerEl.classList.remove("hw-stage-enter");
        void containerEl.offsetWidth;
        containerEl.classList.add("hw-stage-enter");
      }

      this._attachStageListeners();
    }

    _stepperHTML() {
      const current = this._stage;
      const total = STAGES.length;
      return `
        <div class="hw-stepper">
          ${STAGES.map((s, idx) => {
            const isDone = idx < current;
            const isCurrent = idx === current;
            let stateClass = isCurrent ? "hw-step-active" : isDone ? "hw-step-done" : "hw-step-pending";
            return `
              <div class="hw-step-item ${stateClass}" title="${s.title}">
                <div class="hw-step-bar"></div>
              </div>
            `;
          }).join("")}
          <div class="hw-step-badge">
            <span data-l10n-id="hilal-welcome-step-count" data-l10n-args='{"current": ${current + 1}, "total": ${total}}'>${current + 1} / ${total}</span>
          </div>
        </div>
      `;
    }

    _stageCopyHTML() {
      const stageCopies = [
        {
          kicker: "Appearance",
          title: "Make Hilal uniquely yours",
          subtitle: "Choose your preferred theme appearance and accent color palette.",
          l10nKicker: "hilal-welcome-stage-0-kicker",
          l10nTitle: "hilal-welcome-stage-0-title",
          l10nSub: "hilal-welcome-stage-0-subtitle",
        },
        {
          kicker: "Workflow & Tabs",
          title: "Organize your workflow",
          subtitle: "Select your tab orientation and set up clean workspace contexts.",
          l10nKicker: "hilal-welcome-stage-1-kicker",
          l10nTitle: "hilal-welcome-stage-1-title",
          l10nSub: "hilal-welcome-stage-1-subtitle",
        },
        {
          kicker: "Privacy & Search",
          title: "Protected and powered by your choice",
          subtitle: "Pick a protection profile and configure your primary search engine.",
          l10nKicker: "hilal-welcome-stage-2-kicker",
          l10nTitle: "hilal-welcome-stage-2-title",
          l10nSub: "hilal-welcome-stage-2-subtitle",
        },
        {
          kicker: "Getting Started",
          title: "You're all set",
          subtitle: "Import existing data, set your default browser, or jump straight in.",
          l10nKicker: "hilal-welcome-stage-3-kicker",
          l10nTitle: "hilal-welcome-stage-3-title",
          l10nSub: "hilal-welcome-stage-3-subtitle",
        },
      ];

      const copy = stageCopies[this._stage] || stageCopies[0];
      return `
        <div class="hw-badge-chip" data-l10n-id="${copy.l10nKicker}">${copy.kicker}</div>
        <h3 class="hw-stage-heading" id="hw-stage-title" data-l10n-id="${copy.l10nTitle}">${copy.title}</h3>
        <p class="hw-stage-subheading" data-l10n-id="${copy.l10nSub}">${copy.subtitle}</p>
      `;
    }

    _stageHTML() {
      switch (this._stage) {
        case 0:
          return this._stageAppearanceHTML();
        case 1:
          return this._stageWorkflowHTML();
        case 2:
          return this._stagePrivacyAndSearchHTML();
        case 3:
          return this._stageReadyHTML();
      }
      return "";
    }

    _actionsHTML() {
      const isFirst = this._stage === 0;
      const isLast = this._stage === STAGES.length - 1;

      return `
        <button type="button" class="hw-btn-secondary" id="hw-prev-btn"${isFirst ? ' disabled="disabled"' : ""}>
          <i>arrow_back</i>
          <span data-l10n-id="hilal-welcome-action-back">Back</span>
        </button>
        <div class="hw-footer-spacer"></div>
        <button type="button" class="hw-btn-primary" id="${isLast ? "hw-finish-btn" : "hw-next-btn"}">
          <span data-l10n-id="${isLast ? "hilal-welcome-action-start-browsing" : "hilal-welcome-action-continue"}">${isLast ? "Start Browsing" : "Continue"}</span>
          <i>${isLast ? "rocket_launch" : "arrow_forward"}</i>
        </button>
      `;
    }

    /* ----------------------------------------------------------
       Stage 0: Appearance (Theme & Accent Color)
       ---------------------------------------------------------- */

    _stageAppearanceHTML() {
      const themeMode = this._selectedThemeMode;
      const accentMode = this._selectedAccentMode;
      const currentGlobalAccent = (this._selectedGlobalAccent || "#0b57d0").toLowerCase();

      return `
        <div class="hw-section-block">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Theme Mode</span>
            <span class="hw-section-desc">Choose between light, dark, or system-synchronized appearance.</span>
          </div>

          <div class="hw-grid hw-grid-3">
            <div class="hw-tile" data-theme-choice="1">
              <div class="hw-tile-top">
                <div class="hw-tile-icon-circle"><i>light_mode</i></div>
                <div class="hw-tile-spacer"></div>
                <label class="hw-radio">
                  <input type="radio" name="hw-theme-mode" value="1"${themeMode === 1 ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
              <h5 class="hw-tile-title">Light</h5>
              <p class="hw-tile-desc">Crisp, solid light tonal surfaces.</p>
            </div>

            <div class="hw-tile" data-theme-choice="0">
              <div class="hw-tile-top">
                <div class="hw-tile-icon-circle"><i>dark_mode</i></div>
                <div class="hw-tile-spacer"></div>
                <label class="hw-radio">
                  <input type="radio" name="hw-theme-mode" value="0"${themeMode === 0 ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
              <h5 class="hw-tile-title">Dark</h5>
              <p class="hw-tile-desc">Deep midnight tones for comfortable viewing.</p>
            </div>

            <div class="hw-tile" data-theme-choice="2">
              <div class="hw-tile-top">
                <div class="hw-tile-icon-circle"><i>brightness_auto</i></div>
                <div class="hw-tile-spacer"></div>
                <label class="hw-radio">
                  <input type="radio" name="hw-theme-mode" value="2"${themeMode === 2 ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
              <h5 class="hw-tile-title">System</h5>
              <p class="hw-tile-desc">Seamlessly adapts to your operating system.</p>
            </div>
          </div>
        </div>

        <div class="hw-section-block hw-section-gap">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Accent Color</span>
            <span class="hw-section-desc">Select how the browser colors highlights, buttons, and active workspace badges.</span>
          </div>

          <div class="hw-segmented-bar">
            <button type="button" class="hw-segment-btn${accentMode === "workspace" ? " active" : ""}" data-accent-mode="workspace">
              <i>stacks</i>
              <span>Workspace Sync</span>
            </button>
            <button type="button" class="hw-segment-btn${accentMode === "global" ? " active" : ""}" data-accent-mode="global">
              <i>palette</i>
              <span>Global Accent</span>
            </button>
            <button type="button" class="hw-segment-btn${accentMode === "boosts" ? " active" : ""}" data-accent-mode="boosts">
              <i>auto_fix_high</i>
              <span>Hilal Boosts</span>
            </button>
          </div>

          <div class="hw-accent-swatches-box" id="hw-swatches-panel"${accentMode === "workspace" ? ' style="display: none;"' : ""}>
            <div class="hw-swatches-label">Choose primary color swatch:</div>
            <div class="hw-swatches-row">
              ${ACCENT_COLOR_SWATCHES.map(swatch => {
                const isSelected = currentGlobalAccent === swatch.hex.toLowerCase();
                return `
                  <button type="button" class="hw-swatch-circle" data-swatch-hex="${swatch.hex}" style="--swatch-color: ${swatch.hex};"${isSelected ? ' selected="true"' : ""} title="${swatch.label}">
                    ${isSelected ? `<i>check</i>` : ""}
                  </button>
                `;
              }).join("")}
              <label class="hw-custom-color-wrap" title="Custom color">
                <i>colorize</i>
                <input type="color" id="hw-custom-color-input" value="${currentGlobalAccent}" />
              </label>
            </div>
          </div>
        </div>
      `;
    }

    /* ----------------------------------------------------------
       Stage 1: Workflow (Tab Orientation & Starter Workspaces)
       ---------------------------------------------------------- */

    _stageWorkflowHTML() {
      const vertical = this._verticalTabsSelected;

      return `
        <div class="hw-section-block">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Tab Orientation</span>
            <span class="hw-section-desc">Choose whether tabs reside in the modern sidebar or classic horizontal top bar.</span>
          </div>

          <div class="hw-grid hw-grid-2">
            <div class="hw-tile" data-tab-layout="vertical">
              <div class="hw-tile-top">
                <div class="hw-tile-icon-circle"><i>view_sidebar</i></div>
                <div class="hw-tile-spacer"></div>
                <span class="hw-badge-chip-small primary">Recommended</span>
                <label class="hw-radio" style="margin-left: 8px;">
                  <input type="radio" name="hw-tab-choice" value="vertical"${vertical ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
              <h5 class="hw-tile-title">Vertical Tabs</h5>
              <p class="hw-tile-desc">Sidebar tabs for cleaner multitasking on widescreen monitors.</p>
            </div>

            <div class="hw-tile" data-tab-layout="horizontal">
              <div class="hw-tile-top">
                <div class="hw-tile-icon-circle"><i>tab</i></div>
                <div class="hw-tile-spacer"></div>
                <span class="hw-badge-chip-small">Classic</span>
                <label class="hw-radio" style="margin-left: 8px;">
                  <input type="radio" name="hw-tab-choice" value="horizontal"${!vertical ? ' checked="checked"' : ""}/>
                  <span></span>
                </label>
              </div>
              <h5 class="hw-tile-title">Horizontal Tabs</h5>
              <p class="hw-tile-desc">Familiar top tab strip across the browser window.</p>
            </div>
          </div>
        </div>

        <div class="hw-section-block hw-section-gap">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Starter Workspaces</span>
            <span class="hw-section-desc">Workspaces keep cookies, accounts, and tabs isolated so your work and personal life never mix.</span>
          </div>

          <div class="hw-grid hw-grid-3">
            ${WORKSPACE_PRESETS.map(preset => {
              const active = this._workspacesSelected[preset.key];
              return `
                <div class="hw-tile hw-tile-compact" data-starter-ws="${preset.key}">
                  <div class="hw-tile-row">
                    <div class="hw-tile-icon-circle" style="color: ${preset.hex};"><i>${preset.icon}</i></div>
                    <div class="hw-tile-label-wrap">
                      <h5 class="hw-tile-title">${preset.label}</h5>
                      <span class="hw-tile-sub">Isolated space</span>
                    </div>
                    <div class="hw-tile-spacer"></div>
                    <label class="hw-checkbox">
                      <input type="checkbox"${active ? ' checked="checked"' : ""}/>
                      <span></span>
                    </label>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    /* ----------------------------------------------------------
       Stage 2: Privacy & Search
       ---------------------------------------------------------- */

    _stagePrivacyAndSearchHTML() {
      const currentLevel = this._selectedPrivacyLevel;
      const icons = { standard: "verified_user", strict: "security", extreme: "lock" };

      return `
        <div class="hw-section-block">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Privacy Protection Profile</span>
            <span class="hw-section-desc">Hilal enforces zero tracking by default; choose how strictly tracking surfaces are closed.</span>
          </div>

          <div class="hw-grid hw-grid-3">
            ${PRIVACY_LEVELS.map(level => {
              const isSelected = currentLevel === level.key;
              return `
                <div class="hw-tile" data-privacy-choice="${level.key}">
                  <div class="hw-tile-top">
                    <div class="hw-tile-icon-circle"><i>${icons[level.key]}</i></div>
                    <div class="hw-tile-spacer"></div>
                    <span class="hw-badge-chip-small${level.key === "standard" ? " primary" : ""}">${level.badge}</span>
                    <label class="hw-radio" style="margin-left: 8px;">
                      <input type="radio" name="hw-privacy-choice" value="${level.key}"${isSelected ? ' checked="checked"' : ""}/>
                      <span></span>
                    </label>
                  </div>
                  <h5 class="hw-tile-title">${level.label}</h5>
                  <p class="hw-tile-desc">${level.description}</p>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="hw-section-block hw-section-gap">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Default Search Engine</span>
            <span class="hw-section-desc">The search provider used when you type into the unified address bar.</span>
          </div>

          <div class="hw-grid hw-grid-3">
            ${this._engines.map((engine, idx) => {
              const isActive = this._selectedEngine?.name === engine.name;
              const isDuckDuckGo = engine.name.toLowerCase().includes("duckduckgo");
              return `
                <div class="hw-tile hw-tile-compact" data-engine-choice="${idx}">
                  <div class="hw-tile-row">
                    <div class="hw-engine-icon-wrap">${this._engineIconHTML(engine)}</div>
                    <div class="hw-tile-label-wrap">
                      <h5 class="hw-tile-title">${this._escapeHTML(engine.name)}</h5>
                      <span class="hw-tile-sub">${isDuckDuckGo ? "Privacy-first" : "Direct search"}</span>
                    </div>
                    <div class="hw-tile-spacer"></div>
                    <label class="hw-radio">
                      <input type="radio" name="hw-engine-choice" value="${idx}"${isActive ? ' checked="checked"' : ""}/>
                      <span></span>
                    </label>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    /* ----------------------------------------------------------
       Stage 3: Getting Started (Import, Default, Pinned Tabs)
       ---------------------------------------------------------- */

    _stageReadyHTML() {
      const themeLabel = this._selectedThemeMode === 1 ? "Light" : this._selectedThemeMode === 0 ? "Dark" : "System";
      const tabsLabel = this._verticalTabsSelected ? "Vertical" : "Horizontal";
      const privacyLabel = PRIVACY_LEVELS.find(l => l.key === this._selectedPrivacyLevel)?.label || "Balanced";
      const engineName = this._selectedEngine?.name || "DuckDuckGo";

      return `
        <div class="hw-summary-banner">
          <div class="hw-summary-icon"><i>rocket_launch</i></div>
          <div class="hw-summary-text">
            <h5 class="hw-summary-title">Configuration Summary</h5>
            <div class="hw-summary-chips">
              <span class="hw-pill-feature"><i>palette</i>${themeLabel} Mode</span>
              <span class="hw-pill-feature"><i>view_sidebar</i>${tabsLabel} Tabs</span>
              <span class="hw-pill-feature"><i>security</i>${privacyLabel} Privacy</span>
              <span class="hw-pill-feature"><i>search</i>${this._escapeHTML(engineName)}</span>
            </div>
          </div>
        </div>

        <div class="hw-section-block hw-section-gap">
          <div class="hw-grid hw-grid-2">
            <div class="hw-row-card">
              <div class="hw-row-icon"><i>sync</i></div>
              <div class="hw-row-content">
                <h5 class="hw-row-title">Import Browser Data</h5>
                <p class="hw-row-desc">Bring bookmarks & logins.</p>
              </div>
              <button type="button" class="hw-btn-secondary" id="hw-import-btn">
                <span>Import</span>
                <i>arrow_forward</i>
              </button>
            </div>

            <div class="hw-row-card">
              <div class="hw-row-icon"><i>home</i></div>
              <div class="hw-row-content">
                <h5 class="hw-row-title">Set as Default Browser</h5>
                <p class="hw-row-desc">Open links in Hilal.</p>
              </div>
              <label class="hw-switch">
                <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? ' checked="checked"' : ""}/>
                <span></span>
              </label>
            </div>
          </div>
        </div>

        <div class="hw-section-block hw-section-gap">
          <div class="hw-section-title-wrap">
            <span class="hw-section-title">Quick-Access Pinned Tabs</span>
            <span class="hw-section-desc">Pin your daily essentials so they are always ready when you launch the browser.</span>
          </div>

          <div class="hw-grid hw-grid-3">
            ${PINNED_SITE_PRESETS.map(site => {
              const isChecked = this._pinnedSitesSelected[site.key];
              return `
                <div class="hw-tile hw-tile-compact" data-pinned-site="${site.key}">
                  <div class="hw-tile-row">
                    ${site.iconURL
                      ? `<img src="${this._escapeHTML(site.iconURL)}" class="hw-pinned-icon" alt="" />`
                      : `<div class="hw-pinned-avatar" style="background-color: ${site.color};">${site.initial}</div>`
                    }
                    <div class="hw-tile-label-wrap">
                      <h6 class="hw-tile-title">${this._escapeHTML(site.label)}</h6>
                    </div>
                    <div class="hw-tile-spacer"></div>
                    <label class="hw-checkbox">
                      <input type="checkbox"${isChecked ? ' checked="checked"' : ""}/>
                      <span></span>
                    </label>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    /* ----------------------------------------------------------
       Interactive Listeners
       ---------------------------------------------------------- */

    _attachStageListeners() {
      const onClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", fn);
      };

      onClick("hw-next-btn", () => this._next());
      onClick("hw-prev-btn", () => this._prev());
      onClick("hw-finish-btn", () => this._finish());

      // Stage 0: Theme Mode
      const themeTiles = this._overlay.querySelectorAll("[data-theme-choice]");
      themeTiles.forEach(tile => {
        tile.addEventListener("click", () => {
          const modeVal = parseInt(tile.dataset.themeChoice, 10);
          this._selectedThemeMode = modeVal;
          const radio = tile.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          this._applyLiveTheme();
        });
      });

      // Stage 0: Accent Mode Segmented Button
      const segmentBtns = this._overlay.querySelectorAll("[data-accent-mode]");
      segmentBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const mode = btn.dataset.accentMode;
          this._selectedAccentMode = mode;
          segmentBtns.forEach(b => b.classList.toggle("active", b.dataset.accentMode === mode));
          const swatchesBox = document.getElementById("hw-swatches-panel");
          if (swatchesBox) {
            swatchesBox.style.display = (mode === "workspace") ? "none" : "block";
          }
          this._applyLiveAccentColor();
        });
      });

      // Stage 0: Swatch Selection
      const swatchBtns = this._overlay.querySelectorAll("[data-swatch-hex]");
      swatchBtns.forEach(swatch => {
        swatch.addEventListener("click", (e) => {
          e.stopPropagation();
          const hex = swatch.dataset.swatchHex;
          this._selectedGlobalAccent = hex;
          swatchBtns.forEach(s => {
            const isTarget = s.dataset.swatchHex === hex;
            s.setAttribute("selected", isTarget ? "true" : "false");
            s.replaceChildren();
            if (isTarget) {
              const checkIcon = document.createElementNS(HTML_NS, "i");
              checkIcon.textContent = "check";
              s.appendChild(checkIcon);
            }
          });
          const customColorInput = document.getElementById("hw-custom-color-input");
          if (customColorInput) customColorInput.value = hex;
          this._applyLiveAccentColor();
        });
      });

      // Stage 0: Custom Color Input
      const customColorInput = document.getElementById("hw-custom-color-input");
      if (customColorInput) {
        customColorInput.addEventListener("input", (e) => {
          const hex = e.target.value;
          this._selectedGlobalAccent = hex;
          swatchBtns.forEach(s => {
            s.setAttribute("selected", "false");
            s.replaceChildren();
          });
          this._applyLiveAccentColor();
        });
      }

      // Stage 1: Tab Orientation
      const tabTiles = this._overlay.querySelectorAll("[data-tab-layout]");
      tabTiles.forEach(tile => {
        tile.addEventListener("click", () => {
          this._verticalTabsSelected = tile.dataset.tabLayout === "vertical";
          const radio = tile.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });

      // Stage 1: Starter Workspaces
      const wsTiles = this._overlay.querySelectorAll("[data-starter-ws]");
      wsTiles.forEach(tile => {
        const checkbox = tile.querySelector('input[type="checkbox"]');
        tile.addEventListener("click", (event) => {
          if (event.target !== checkbox && checkbox) {
            checkbox.checked = !checkbox.checked;
          }
          const key = tile.dataset.starterWs;
          this._workspacesSelected[key] = checkbox ? checkbox.checked : !this._workspacesSelected[key];
        });
      });

      // Stage 2: Privacy Choices
      const privacyTiles = this._overlay.querySelectorAll("[data-privacy-choice]");
      privacyTiles.forEach(tile => {
        tile.addEventListener("click", () => {
          this._selectedPrivacyLevel = tile.dataset.privacyChoice;
          const radio = tile.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });

      // Stage 2: Search Engines
      const engineTiles = this._overlay.querySelectorAll("[data-engine-choice]");
      engineTiles.forEach(tile => {
        tile.addEventListener("click", () => {
          const idx = parseInt(tile.dataset.engineChoice, 10);
          this._selectedEngine = this._engines[idx];
          const radio = tile.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });

      // Stage 3: Import Button
      onClick("hw-import-btn", async () => {
        const btn = document.getElementById("hw-import-btn");
        try {
          if (typeof MigrationUtils !== "undefined" && MigrationUtils.showMigrationWizard) {
            MigrationUtils.showMigrationWizard(window, { isStartupMigration: true });
            if (btn) {
              btn.setAttribute("data-l10n-id", "hilal-welcome-imported-button");
              btn.textContent = "Imported";
              btn.disabled = true;
            }
          }
        } catch (e) {
          console.error("HilalWelcome: migration wizard failed", e);
        }
      });

      // Stage 3: Default Browser Switch
      const defaultToggle = document.getElementById("hw-default-browser-toggle");
      if (defaultToggle) {
        defaultToggle.addEventListener("change", (e) => {
          this._defaultBrowserSelected = e.target.checked;
        });
      }

      // Stage 3: Pinned Sites
      const pinnedTiles = this._overlay.querySelectorAll("[data-pinned-site]");
      pinnedTiles.forEach(tile => {
        const checkbox = tile.querySelector('input[type="checkbox"]');
        tile.addEventListener("click", (event) => {
          if (event.target !== checkbox && checkbox) {
            checkbox.checked = !checkbox.checked;
          }
          const key = tile.dataset.pinnedSite;
          this._pinnedSitesSelected[key] = checkbox ? checkbox.checked : !this._pinnedSitesSelected[key];
        });
      });
    }

    _next() {
      if (this._stage < STAGES.length - 1) {
        this._stage++;
        this._renderStage();
      }
    }

    _prev() {
      if (this._stage > 0) {
        this._stage--;
        this._renderStage();
      }
    }

    async _finish() {
      // 1. Save Theme and Accent Prefs
      if (typeof Services !== "undefined" && Services.prefs) {
        try {
          Services.prefs.setIntPref(PREF_THEME_OVERRIDE, this._selectedThemeMode);
          Services.prefs.setStringPref(PREF_ACCENT_MODE, this._selectedAccentMode);
          Services.prefs.setStringPref(PREF_GLOBAL_ACCENT, this._selectedGlobalAccent);
        } catch (e) {
          console.error("HilalWelcome: failed to save theme prefs", e);
        }
      }

      // 2. Save Layout Prefs
      if (typeof Services !== "undefined" && Services.prefs) {
        try {
          Services.prefs.setBoolPref(PREF_COMPACT_ENABLED, true);
          Services.prefs.setBoolPref(PREF_VERTICAL_TABS, this._verticalTabsSelected);
          Services.prefs.setBoolPref(PREF_SIDEBAR_REVAMP, true);
          Services.prefs.setBoolPref(PREF_WORKSPACES_ENABLED, true);
          Services.prefs.setBoolPref(PREF_PINNED_PUBLIC, this._pinnedPublicSelected);
          Services.prefs.setStringPref(PREF_PRIVACY_LEVEL, this._selectedPrivacyLevel);
        } catch (e) {
          console.error("HilalWelcome: failed to save layout prefs", e);
        }
      }

      // 3. Create Selected Starter Workspaces
      if (this._workspaces) {
        for (const item of WORKSPACE_PRESETS) {
          if (this._workspacesSelected[item.key]) {
            let label = item.label;
            try {
              if (document.l10n?.formatValue) {
                label = await document.l10n.formatValue(`hilal-welcome-workspace-label-${item.key}`);
              }
            } catch (e) {}
            if (typeof this._workspaces.ensureWorkspace === "function") {
              this._workspaces.ensureWorkspace(label, "", item.workspaceColor);
            } else if (typeof this._workspaces.create === "function") {
              this._workspaces.create(label, "", item.workspaceColor);
            }
          }
        }
      }

      // 4. Create Pinned Tabs
      await this._createPinnedTabs();

      // 5. Set Default Engine
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
          console.error("HilalWelcome: failed to set default search engine", e);
        }
      }

      // 6. Set Default Browser
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

      this._markSeen();
      this._teardown();
    }

    async _createPinnedTabs() {
      const selectedSites = PINNED_SITE_PRESETS.filter(s => this._pinnedSitesSelected[s.key]);
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
          let tab = gBrowser.addTrustedTab(site.url, {
            inBackground: true,
            createLazyBrowser: true,
            userContextId,
          });
          if (tab && !tab.pinned) {
            gBrowser.pinTab(tab);
          }
        } catch (e) {
          console.error(`HilalWelcome: failed to pin ${site.label}`, e);
        }
      }
    }

    _dismiss() {
      this._markSeen();
      this._teardown();
    }

    _markSeen() {
      if (typeof Services === "undefined" || !Services.prefs) return;
      try {
        Services.prefs.setBoolPref(PREF_SEEN, true);
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
      } catch (e) {}
    }

    _normalizePrivacyLevel(value) {
      return PRIVACY_LEVELS.some(level => level.key === value) ? value : "standard";
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
        return `<img src="${this._escapeHTML(iconURL)}" style="width: 28px; height: 28px; object-fit: contain; display: block;" alt="" />`;
      }
      return `<i>search</i>`;
    }

    _escapeHTML(value) {
      return String(value).replace(/[&<>"']/g, char => {
        switch (char) {
          case "&": return "&amp;";
          case "<": return "&lt;";
          case ">": return "&gt;";
          case '"': return "&quot;";
          case "'": return "&#39;";
        }
        return char;
      });
    }
  }

  window.HilalWelcome = HilalWelcome;
})();
