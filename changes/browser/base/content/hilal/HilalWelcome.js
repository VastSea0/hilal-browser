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
    { title: "Welcome", short: "01", icon: "moon" },
    { title: "Settings", short: "02", icon: "settings" },
    { title: "Privacy", short: "03", icon: "shield" },
    { title: "Search", short: "04", icon: "search" },
    { title: "Workspaces", short: "05", icon: "tabs" },
    { title: "Ready", short: "06", icon: "check" },
  ];

  const CHROME_TO_HIDE = ["#navigator-toolbox", "#browser"];

  const PRIVACY_LEVELS = [
    {
      key: "standard",
      label: "Balanced",
      badge: "LibreWolf-like",
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
      badge: "Less compatible",
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
      badge: "Not Tor",
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
      short: "P",
      icon: "home",
      colorClass: "blue",
      workspaceColor: "blue",
    },
    {
      key: "work",
      label: "Work",
      short: "W",
      icon: "folder",
      colorClass: "amber",
      workspaceColor: "orange",
    },
    {
      key: "social",
      label: "Social",
      short: "S",
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
      this._workspacesSelected = { personal: true, work: true, social: true };
      this._hiddenChrome = new Map();
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

      try {
        gURLBar?.view?.close?.();
        gURLBar?.blur?.();
      } catch (e) {
        console.error("HilalWelcome: failed to close urlbar", e);
      }

      for (const selector of CHROME_TO_HIDE) {
        const element = document.querySelector(selector);
        if (!element || this._hiddenChrome.has(element)) {
          continue;
        }
        this._hiddenChrome.set(element, {
          display: element.style.display,
          pointerEvents: element.style.pointerEvents,
          visibility: element.style.visibility,
        });
        element.style.display = "none";
        element.style.pointerEvents = "none";
        element.style.visibility = "hidden";
      }
    }

    _leaveWelcomeStage() {
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

      if (this._engines.length === 0) {
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
          "";
      }

      return this._sanitizeIconURL(url);
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
            <span data-l10n-id="hilal-welcome-intro-line-1">Welcome to Hilal</span>
            <span data-l10n-id="hilal-welcome-intro-line-2">A calmer internet</span>
          </h1>
          <button type="button" class="hw-intro-button hw-btn-primary" id="hw-start-btn">
            <span data-l10n-id="hilal-welcome-action-start">Start</span>
            <span class="hw-icon hw-icon-arrow-right"></span>
          </button>
        </section>
      `;
      this._overlay.replaceChildren(MozXULElement.parseXULToFragment(markup));
      document.getElementById("hw-start-btn")?.addEventListener("click", () => {
        this._beginPages();
      });
    }

    async _beginPages() {
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
        <div class="hw-pages" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title" data-stage="${this._stage}" xmlns="http://www.w3.org/1999/xhtml">
          <aside class="hw-page-sidebar">
            <div class="hw-brand">
              <span class="hw-brand-mark">${this._logoHTML()}</span>
              <span class="hw-brand-text" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</span>
            </div>
            <div class="hw-sidebar-copy">
              ${this._stageCopyHTML()}
            </div>
            <div class="hw-sidebar-bottom">
              <div class="hw-progress">
                <span class="hw-step-count" data-l10n-id="hilal-welcome-step-count" data-l10n-args='{"current": ${this._stage + 1}, "total": ${STAGES.length}}'>Step ${this._stage + 1}/${STAGES.length}</span>
                <ol class="hw-steps">
                  ${this._stepsHTML()}
                </ol>
              </div>
              ${this._actionsHTML()}
            </div>
          </aside>
          <main class="hw-page-content">
            <button type="button" class="hw-skip" id="hw-skip-btn">
              <span data-l10n-id="hilal-welcome-skip">Skip</span>
              <span class="hw-icon hw-icon-close"></span>
            </button>
            <section class="hw-content">
              ${this._stageHTML()}
            </section>
          </main>
        </div>
      `;
      this._overlay.replaceChildren(MozXULElement.parseXULToFragment(markup));
      this._attachListeners();
    }

    _stepsHTML() {
      return STAGES.map((stage, index) => {
        let state = "";
        if (index < this._stage) {
          state = " hw-step-done";
        } else if (index === this._stage) {
          state = " hw-step-active";
        }
        return `
          <li class="hw-step${state}">
            <span class="hw-step-dot"></span>
            <span class="hw-step-label" data-l10n-id="hilal-welcome-step-label-${stage.icon}">${stage.title}</span>
          </li>
        `;
      }).join("");
    }

    _stageCopyHTML() {
      const stageCopies = [
        {
          kicker: "Welcome",
          title: "A quieter start for the web.",
          subtitle:
            "Hilal opens with privacy, workspaces, and search choices in one calm flow.",
        },
        {
          kicker: "Bring your trail",
          title: "A new start, same bookmarks.",
          subtitle:
            "Move bookmarks, history, and passwords in one pass, then decide whether Hilal should become your default browser.",
        },
        {
          kicker: "Privacy Level",
          title: "Choose the amount of hardening.",
          subtitle:
            "uBlock Origin is already installed. Pick the Hilal privacy profile that matches how much site compatibility you want to keep.",
        },
        {
          kicker: "Search",
          title: "Choose your default search.",
          subtitle:
            "Select the search engine Hilal should use from the address bar. You can change it later in settings.",
        },
        {
          kicker: "Workspaces",
          title: "Keep flows apart from day one.",
          subtitle:
            "Create a few starter spaces so personal, work, and social browsing do not collapse into the same tab pile.",
        },
        {
          kicker: "Ready",
          title: "Everything is in place.",
          subtitle:
            "Hilal will apply your choices and open into a clean browsing window.",
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
          return `
            <div class="hw-hero-visual">
              <figure class="hw-home-image-frame">
                <img class="hw-home-preview-image" src="chrome://browser/content/hilal/welcome-home-preview.png" data-l10n-id="hilal-welcome-home-preview-image-alt" alt="Hilal Browser home page preview" />
              </figure>
              <div class="hw-feature-row">
                <span><span class="hw-icon hw-icon-shield"></span><span data-l10n-id="hilal-welcome-feature-privacy">Privacy focused</span></span>
                <span><span class="hw-icon hw-icon-tabs"></span><span data-l10n-id="hilal-welcome-feature-workspaces">Workspaces</span></span>
                <span><span class="hw-icon hw-icon-moon"></span><span data-l10n-id="hilal-welcome-feature-clean">Clean interface</span></span>
              </div>
            </div>
          `;
        case 1:
          return `
            <div class="hw-row-list">
              <label class="hw-row" for="hw-default-browser-toggle">
                <span class="hw-row-main">
                  <span class="hw-row-icon hw-icon hw-icon-check"></span>
                  <span class="hw-row-info">
                    <span class="hw-row-label" data-l10n-id="hilal-welcome-default-browser-label">Default browser</span>
                    <span class="hw-row-desc" data-l10n-id="hilal-welcome-default-browser-desc">Make Hilal Browser your default browser for system links.</span>
                  </span>
                </span>
                <span class="hw-toggle">
                  <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? ' checked="checked"' : ""}/>
                  <span class="hw-toggle-track"></span>
                </span>
              </label>
              <div class="hw-row">
                <span class="hw-row-main">
                  <span class="hw-row-icon hw-icon hw-icon-folder"></span>
                  <span class="hw-row-info">
                    <span class="hw-row-label" data-l10n-id="hilal-welcome-import-label">Bookmarks and passwords</span>
                    <span class="hw-row-desc" data-l10n-id="hilal-welcome-import-desc">Import your existing bookmarks, history, and passwords from another browser.</span>
                  </span>
                </span>
                <button type="button" class="hw-btn-secondary" id="hw-import-btn" data-l10n-id="hilal-welcome-import-button">Import</button>
              </div>
            </div>
          `;
        case 2:
          return `
            <div class="hw-privacy-stack">
              <div class="hw-privacy-note">
                <span class="hw-row-icon hw-icon hw-icon-shield"></span>
                <span class="hw-row-info">
                  <span class="hw-row-label" data-l10n-id="hilal-welcome-ublock-label">uBlock Origin is installed by default</span>
                  <span class="hw-row-desc" data-l10n-id="hilal-welcome-ublock-desc">Ad, tracking, and harmful-site filter lists are ready on first launch. The privacy level controls Hilal's own browser hardening settings.</span>
                </span>
              </div>
              <div class="hw-privacy-list">
                ${this._privacyLevelsHTML()}
              </div>
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
        primaryFallback = "Start browsing";
      }

      return `
        <div class="hw-actions">
          <button type="button" class="hw-btn-ghost" id="hw-prev-btn"${isFirst ? ' disabled="disabled"' : ""}>
            <span class="hw-icon hw-icon-arrow-left"></span>
            <span data-l10n-id="hilal-welcome-action-back">Back</span>
          </button>
          <button type="button" class="hw-btn-primary" id="${primaryId}">
            <span data-l10n-id="${primaryL10nId}">${primaryFallback}</span>
            <span class="hw-icon hw-icon-${isLast ? "check" : "arrow-right"}"></span>
          </button>
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
              <span class="hw-engine-meta">
                <span class="hw-engine-name">${name}</span>
                ${isDuckDuckGo ? `<span class="hw-pill" data-l10n-id="hilal-welcome-recommended">Recommended</span>` : ""}
              </span>
              <span class="hw-choice-check hw-icon hw-icon-check"></span>
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
            <span class="hw-privacy-header">
              <span class="hw-privacy-title" data-l10n-id="${level.l10nLabel}">${level.label}</span>
              <span class="hw-pill" data-l10n-id="${level.l10nBadge}">${level.badge}</span>
            </span>
            <span class="hw-privacy-desc" data-l10n-id="${level.l10nDesc}">${level.description}</span>
            <span class="hw-privacy-detail" data-l10n-id="${level.l10nDetail}">${level.detail}</span>
            <span class="hw-choice-check hw-icon hw-icon-check"></span>
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
      return WORKSPACE_PRESETS.map(item => {
        const active = this._workspacesSelected[item.key];
        return `
          <button type="button" class="hw-workspace-choice hw-workspace-${item.colorClass}${active ? " hw-choice-active" : ""}" data-workspace="${item.key}" aria-pressed="${active}">
            <span class="hw-workspace-icon">
              <span class="hw-icon hw-icon-${item.icon}"></span>
            </span>
            <span class="hw-workspace-label" data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>
            <span class="hw-workspace-state" data-l10n-id="hilal-welcome-workspace-state-${active ? "added" : "skipped"}">${active ? "Will be added" : "Skipped"}</span>
            <span class="hw-choice-check hw-icon hw-icon-check"></span>
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
      const workspacesHTML = activePresets.length
        ? activePresets
            .map(
              item =>
                `<span data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>`
            )
            .join(", ")
        : `<span data-l10n-id="hilal-welcome-summary-none">None</span>`;

      return `
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-search"></span><span data-l10n-id="hilal-welcome-summary-search">Search</span></span>
          <strong>${engineName}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-shield"></span><span data-l10n-id="hilal-welcome-summary-privacy">Privacy</span></span>
          <strong>${this._escapeHTML(privacyLevel.label)}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-tabs"></span><span data-l10n-id="hilal-welcome-summary-workspaces">Workspaces</span></span>
          <strong>${workspacesHTML}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-check"></span><span data-l10n-id="hilal-welcome-summary-default-browser">Default browser</span></span>
          <strong data-l10n-id="hilal-welcome-summary-default-${this._defaultBrowserSelected ? "set" : "no-change"}">${this._defaultBrowserSelected ? "Set as default" : "Do not change"}</strong>
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
      if (this._workspaces) {
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
