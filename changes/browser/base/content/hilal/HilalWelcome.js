/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, MigrationUtils, ChromeUtils, MozXULElement, gURLBar */

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
    { title: "Look", icon: "layout" },
    { title: "Privacy", icon: "shield" },
    { title: "Search", icon: "search" },
    { title: "Spaces", icon: "tabs" },
    { title: "Ready", icon: "check" },
  ];

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

    _stepsHTML() {
      return STAGES.map((stage, index) => {
        const active = index === this._stage;
        const done = index < this._stage;
        return `
          <span class="hw-progress-dot${active ? " hw-progress-active" : ""}${done ? " hw-progress-done" : ""}">
            <span data-l10n-id="hilal-welcome-step-label-${stage.icon}">${stage.title}</span>
          </span>
        `;
      }).join("");
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
          kicker: "Look",
          title: "Shape the window before it opens.",
          subtitle:
            "Pick the density, tab direction, and spaces that should define the first Hilal window.",
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
      return `
        <p class="hw-kicker" data-l10n-id="hilal-welcome-stage-${this._stage}-kicker">${copy.kicker}</p>
        <h1 class="hw-title" id="hw-stage-title" data-l10n-id="hilal-welcome-stage-${this._stage}-title">${copy.title}</h1>
        <p class="hw-sub" data-l10n-id="hilal-welcome-stage-${this._stage}-subtitle">${copy.subtitle}</p>
        <span class="hw-step-count" data-l10n-id="hilal-welcome-step-count" data-l10n-args='{"current": ${this._stage + 1}, "total": ${STAGES.length}}'>Step ${this._stage + 1}/${STAGES.length}</span>
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
          return this._layoutHTML();
        case 2:
          return `
            <div class="hw-privacy-list">
              ${this._privacyLevelsHTML()}
            </div>
          `;
        case 3:
          return `
            <div class="hw-engine-list">
              ${this._enginesHTML()}
            </div>
          `;
        case 4:
          return `
            <div class="hw-workspace-list">
              ${this._workspacesHTML()}
            </div>
          `;
        case 5:
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

    _layoutHTML() {
      return `
        <div class="hw-layout-stack">
          <div class="hw-layout-grid">
            ${this._layoutChoiceHTML("standard")}
            ${this._layoutChoiceHTML("compact")}
          </div>
          <div class="hw-layout-controls">
            <div class="hw-control-row">
              <span class="hw-control-copy">
                <span class="hw-line-title" data-l10n-id="hilal-welcome-tabs-layout-label">Tabs</span>
                <span class="hw-line-desc" data-l10n-id="hilal-welcome-tabs-layout-desc">Choose the direction that keeps your pages easiest to scan.</span>
              </span>
              <span class="hw-segment" role="group" aria-label="Tab layout">
                <button type="button" class="hw-segment-btn${this._verticalTabsSelected ? " hw-segment-active" : ""}" data-tab-layout="vertical" aria-pressed="${this._verticalTabsSelected}">
                  <span data-l10n-id="hilal-welcome-tabs-layout-vertical">Vertical</span>
                </button>
                <button type="button" class="hw-segment-btn${!this._verticalTabsSelected ? " hw-segment-active" : ""}" data-tab-layout="horizontal" aria-pressed="${!this._verticalTabsSelected}">
                  <span data-l10n-id="hilal-welcome-tabs-layout-horizontal">Horizontal</span>
                </button>
              </span>
            </div>
            <label class="hw-control-row" for="hw-workspaces-enabled-toggle">
              <span class="hw-control-copy">
                <span class="hw-line-title" data-l10n-id="hilal-welcome-workspaces-enabled-label">Spaces</span>
                <span class="hw-line-desc" data-l10n-id="hilal-welcome-workspaces-enabled-desc">Keep personal, work, and social tabs separated from the start.</span>
              </span>
              <span class="hw-toggle">
                <input type="checkbox" id="hw-workspaces-enabled-toggle"${this._workspacesEnabledSelected ? ' checked="checked"' : ""}/>
                <span class="hw-toggle-track"></span>
              </span>
            </label>
            <label class="hw-control-row${this._compactSelected ? "" : " hw-control-disabled"}" for="hw-compact-hide-toolbar-toggle">
              <span class="hw-control-copy">
                <span class="hw-line-title" data-l10n-id="hilal-welcome-compact-toolbar-label">Hide top toolbar</span>
                <span class="hw-line-desc" data-l10n-id="hilal-welcome-compact-toolbar-desc">In compact mode, reveal the address bar only when you need it.</span>
              </span>
              <span class="hw-toggle">
                <input type="checkbox" id="hw-compact-hide-toolbar-toggle"${this._compactHideToolboxSelected ? ' checked="checked"' : ""}${this._compactSelected ? "" : ' disabled="disabled"'}/>
                <span class="hw-toggle-track"></span>
              </span>
            </label>
          </div>
        </div>
      `;
    }

    _layoutChoiceHTML(mode) {
      const compact = mode === "compact";
      const active = this._compactSelected === compact;
      const label = compact ? "Compact" : "Standard";
      const desc = compact
        ? "More page, less chrome."
        : "Full toolbar, familiar spacing.";
      return `
        <button type="button" class="hw-layout-choice${active ? " hw-choice-active" : ""}" data-layout-mode="${mode}" aria-pressed="${active}">
          ${this._browserMockHTML(mode)}
          <span class="hw-layout-choice-copy">
            <span class="hw-choice-title" data-l10n-id="hilal-welcome-layout-${mode}-label">${label}</span>
            <span class="hw-choice-desc" data-l10n-id="hilal-welcome-layout-${mode}-desc">${desc}</span>
          </span>
        </button>
      `;
    }

    _browserMockHTML(mode) {
      const compact = mode === "compact";
      const orientationClass = this._verticalTabsSelected
        ? "hw-mock-vertical"
        : "hw-mock-horizontal";
      const workspaceClass = this._workspacesEnabledSelected
        ? "hw-mock-workspaces"
        : "hw-mock-no-workspaces";
      const toolbarClass = this._compactHideToolboxSelected
        ? "hw-mock-hide-toolbar"
        : "hw-mock-show-toolbar";
      return `
        <span class="hw-browser-mock ${compact ? "hw-mock-compact" : "hw-mock-standard"} ${orientationClass} ${workspaceClass} ${toolbarClass}" aria-hidden="true">
          <span class="hw-mock-topbar">
            <span class="hw-mock-window-controls">
              <span></span><span></span><span></span>
            </span>
            <span class="hw-mock-tabs">
              <span></span><span></span><span></span>
            </span>
            <span class="hw-mock-urlbar"></span>
          </span>
          <span class="hw-mock-body">
            <span class="hw-mock-sidebar">
              <span class="hw-mock-workspace-strip">
                <span></span><span></span><span></span>
              </span>
              <span class="hw-mock-sidebar-tabs">
                <span></span><span></span><span></span>
              </span>
            </span>
            <span class="hw-mock-page">
              <span></span><span></span><span></span>
            </span>
          </span>
        </span>
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

      this._overlay.querySelectorAll(".hw-layout-choice").forEach(choice => {
        choice.addEventListener("click", () => {
          this._compactSelected = choice.dataset.layoutMode === "compact";
          this._renderStage();
        });
      });

      this._overlay.querySelectorAll(".hw-segment-btn").forEach(choice => {
        choice.addEventListener("click", () => {
          this._verticalTabsSelected = choice.dataset.tabLayout === "vertical";
          this._renderStage();
        });
      });

      const workspacesEnabledToggle = document.getElementById(
        "hw-workspaces-enabled-toggle"
      );
      if (workspacesEnabledToggle) {
        workspacesEnabledToggle.addEventListener("change", event => {
          this._workspacesEnabledSelected = event.target.checked;
          this._renderStage();
        });
      }

      const compactHideToolbarToggle = document.getElementById(
        "hw-compact-hide-toolbar-toggle"
      );
      if (compactHideToolbarToggle) {
        compactHideToolbarToggle.addEventListener("change", event => {
          this._compactHideToolboxSelected = event.target.checked;
          this._renderStage();
        });
      }

      this._overlay.querySelectorAll(".hw-workspace-choice").forEach(choice => {
        choice.addEventListener("click", () => {
          const key = choice.dataset.workspace;
          this._workspacesSelected[key] = !this._workspacesSelected[key];
          this._renderStage();
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
      if (engine.iconURL) {
        return `<img class="hw-engine-image" src="${this._escapeHTML(engine.iconURL)}" alt="" />`;
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
