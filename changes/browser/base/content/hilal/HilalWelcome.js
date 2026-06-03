/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, MigrationUtils, ChromeUtils, MozXULElement */

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
    { title: "Kar\u015f\u0131lama", short: "01", icon: "moon" },
    { title: "Settings", short: "02", icon: "settings" },
    { title: "Privacy", short: "03", icon: "shield" },
    { title: "Search", short: "04", icon: "search" },
    { title: "Workspaces", short: "05", icon: "tabs" },
    { title: "Ready", short: "06", icon: "check" },
  ];

  const PRIVACY_LEVELS = [
    {
      key: "standard",
      label: "Balanced",
      badge: "LibreWolf-like",
      description:
        "RFP, strict tracking protection, HTTPS-only, URL cleanup, WebGL off, and cookie/cache cleanup on close.",
      detail: "WebRTC stays enabled for compatibility, with local leak surfaces reduced.",
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
      detail: "Does not hide your IP address; many modern sites may not work as expected.",
      l10nLabel: "hilal-welcome-privacy-extreme-label",
      l10nBadge: "hilal-welcome-privacy-extreme-badge",
      l10nDesc: "hilal-welcome-privacy-extreme-desc",
      l10nDetail: "hilal-welcome-privacy-extreme-detail",
    },
  ];

  const WORKSPACE_PRESETS = [
    {
      key: "personal",
      label: "Ki\u015fisel",
      short: "K",
      icon: "home",
      colorClass: "blue",
      workspaceColor: "blue",
    },
    {
      key: "work",
      label: "\u0130\u015f",
      short: "I",
      icon: "folder",
      colorClass: "amber",
      workspaceColor: "orange",
    },
    {
      key: "social",
      label: "Sosyal",
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
      this._selectedEngine = null;
      this._selectedPrivacyLevel = this._normalizePrivacyLevel(
        Services.prefs.getStringPref("hilal.privacy.level", "standard")
      );
      this._defaultBrowserSelected = false;
      this._workspacesSelected = { personal: true, work: true, social: true };
    }

    async start() {
      this._injectStyles();
      await this._fetchEngines();
      this._createOverlay();
      this._renderStage();
    }

    _injectStyles() {
      const head = document.head || document.documentElement;
      if (document.getElementById("hilal-welcome-style")) {
        return;
      }
      this._style = document.createElementNS("http://www.w3.org/1999/xhtml", "link");
      this._style.id = "hilal-welcome-style";
      this._style.rel = "stylesheet";
      this._style.href = "chrome://browser/content/hilal/HilalWelcome.css";
      head.appendChild(this._style);
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
          url = (
            (await engine.getIconURL(32)) ||
            (await engine.getIconURL(16)) ||
            (await engine.getIconURL()) ||
            ""
          );
        }
      } catch (e) {
        console.error("HilalWelcome: failed to fetch engine icon", e);
      }

      if (!url) {
        const iconURI = engine.iconURI || engine._iconURI;
        url = (
          iconURI?.spec ||
          (typeof iconURI === "string" ? iconURI : "") ||
          engine.iconURL ||
          engine._iconURL ||
          ""
        );
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
        overlay = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
        overlay.id = "hilal-welcome-overlay";
        document.documentElement.appendChild(overlay);
      }
      this._overlay = overlay;
    }

    _renderStage() {
      if (!this._overlay) {
        return;
      }

      const markup = `
        <div class="hw-shell" role="dialog" aria-modal="true" aria-labelledby="hw-stage-title" xmlns="http://www.w3.org/1999/xhtml">
          <aside class="hw-rail">
            <div class="hw-brand">
              <span class="hw-brand-mark">${this._logoHTML()}</span>
              <span class="hw-brand-text" data-l10n-id="hilal-welcome-brand-text">Hilal Browser</span>
            </div>
            <div class="hw-rail-copy">
              ${this._stageCopyHTML()}
            </div>
            <ol class="hw-steps">
              ${this._stepsHTML()}
            </ol>
            ${this._actionsHTML()}
          </aside>
          <main class="hw-main">
            <div class="hw-topbar">
              <span class="hw-step-count" data-l10n-id="hilal-welcome-step-count" data-l10n-args='{"current": ${this._stage + 1}, "total": ${STAGES.length}}'>Ad\u0131m ${this._stage + 1}/${STAGES.length}</span>
              <button type="button" class="hw-skip" id="hw-skip-btn">
                <span data-l10n-id="hilal-welcome-skip">Atla</span>
                <span class="hw-icon hw-icon-close"></span>
              </button>
            </div>
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
            <span class="hw-step-icon hw-icon hw-icon-${stage.icon}"></span>
            <span class="hw-step-number">${stage.short}</span>
            <span class="hw-step-label" data-l10n-id="hilal-welcome-step-label-${stage.icon}">${stage.title}</span>
          </li>
        `;
      }).join("");
    }

    _stageCopyHTML() {
      const stageCopies = [
        {
          kicker: "Hilal'e Ho\u015f Geldiniz",
          title: "Taray\u0131c\u0131n\u0131z\u0131 temiz bir ritme kurun.",
          subtitle:
            "Gizlilik, arama ve \u00e7al\u0131\u015fma alanlar\u0131n\u0131 ilk a\u00e7\u0131l\u0131\u015fta netle\u015ftirin.",
        },
        {
          kicker: "Temel Ayarlar",
          title: "Ta\u015f\u0131nmas\u0131 gerekenler burada.",
          subtitle:
            "Varsay\u0131lan taray\u0131c\u0131 karar\u0131n\u0131 verin, yer imleri ve parolalar\u0131n\u0131z\u0131 tek ad\u0131mda getirin.",
        },
        {
          kicker: "Privacy Level",
          title: "Choose your protection level clearly.",
          subtitle:
            "uBlock Origin is installed by default. Choose which Hilal hardening profile should apply on top of it.",
        },
        {
          kicker: "Arama",
          title: "Arama motorunuz sizi takip etmesin.",
          subtitle:
            "Varsay\u0131lan arama deneyimini se\u00e7in. Bu karar\u0131 daha sonra ayarlardan de\u011fi\u015ftirebilirsiniz.",
        },
        {
          kicker: "\u00c7al\u0131\u015fma Alanlar\u0131",
          title: "Sekmeler birbirine kar\u0131\u015fmas\u0131n.",
          subtitle:
            "Ki\u015fisel, i\u015f ve sosyal ak\u0131\u015flar\u0131 ayr\u0131 tutan ilk alanlar\u0131 olu\u015fturun.",
        },
        {
          kicker: "Son Kontrol",
          title: "Her \u015fey yerli yerinde.",
          subtitle:
            "Se\u00e7imleriniz uygulanacak ve Hilal sizi bo\u015f, sakin bir pencereye b\u0131rakacak.",
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
                <img class="hw-home-preview-image" src="chrome://browser/content/hilal/welcome-home-preview.png" data-l10n-id="hilal-welcome-home-preview-image-alt" alt="Hilal Browser ana sayfa \u00f6nizlemesi" />
              </figure>
              <div class="hw-feature-row">
                <span><span class="hw-icon hw-icon-shield"></span><span data-l10n-id="hilal-welcome-feature-privacy">Gizlilik odakl\u0131</span></span>
                <span><span class="hw-icon hw-icon-tabs"></span><span data-l10n-id="hilal-welcome-feature-workspaces">\u00c7al\u0131\u015fma alanlar\u0131</span></span>
                <span><span class="hw-icon hw-icon-moon"></span><span data-l10n-id="hilal-welcome-feature-clean">Sade aray\u00fcz</span></span>
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
                    <span class="hw-row-label" data-l10n-id="hilal-welcome-default-browser-label">Varsay\u0131lan taray\u0131c\u0131</span>
                    <span class="hw-row-desc" data-l10n-id="hilal-welcome-default-browser-desc">Hilal Browser sistem ba\u011flant\u0131lar\u0131n\u0131 a\u00e7s\u0131n.</span>
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
                    <span class="hw-row-label" data-l10n-id="hilal-welcome-import-label">Yer imleri ve \u015fifreler</span>
                    <span class="hw-row-desc" data-l10n-id="hilal-welcome-import-desc">Firefox aktar\u0131m sihirbaz\u0131 ile mevcut verileri ta\u015f\u0131y\u0131n.</span>
                  </span>
                </span>
                <button type="button" class="hw-btn-secondary" id="hw-import-btn" data-l10n-id="hilal-welcome-import-button">\u0130\u00e7e aktar</button>
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
      let primaryFallback = "Devam";
      if (isLast) {
        primaryL10nId = "hilal-welcome-action-start-browsing";
        primaryFallback = "G\u00f6z atmaya ba\u015fla";
      } else if (isFirst) {
        primaryL10nId = "hilal-welcome-action-start";
        primaryFallback = "Ba\u015fla";
      }

      return `
        <div class="hw-actions">
          <button type="button" class="hw-btn-ghost" id="hw-prev-btn"${isFirst ? ' disabled="disabled"' : ""}>
            <span class="hw-icon hw-icon-arrow-left"></span>
            <span data-l10n-id="hilal-welcome-action-back">Geri</span>
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
                ${isDuckDuckGo ? `<span class="hw-pill" data-l10n-id="hilal-welcome-recommended">\u00d6nerilen</span>` : ""}
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
      return PRIVACY_LEVELS.some(level => level.key === value) ? value : "standard";
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
            <span class="hw-workspace-state" data-l10n-id="hilal-welcome-workspace-state-${active ? 'added' : 'skipped'}">${active ? "Eklenecek" : "Atland\u0131"}</span>
            <span class="hw-choice-check hw-icon hw-icon-check"></span>
          </button>
        `;
      }).join("");
    }

    _summaryHTML() {
      const engineName = this._escapeHTML(this._selectedEngine?.name ?? "DuckDuckGo");
      const privacyLevel =
        PRIVACY_LEVELS.find(level => level.key === this._selectedPrivacyLevel) ||
        PRIVACY_LEVELS[0];
      const activePresets = WORKSPACE_PRESETS.filter(item => this._workspacesSelected[item.key]);
      const workspacesHTML = activePresets.length > 0 
        ? activePresets.map(item => `<span data-l10n-id="hilal-welcome-workspace-label-${item.key}">${item.label}</span>`).join(", ")
        : `<span data-l10n-id="hilal-welcome-summary-none">Yok</span>`;

      return `
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-search"></span><span data-l10n-id="hilal-welcome-summary-search">Arama</span></span>
          <strong>${engineName}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-shield"></span><span data-l10n-id="hilal-welcome-summary-privacy">Privacy</span></span>
          <strong>${privacyLevel.label}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-tabs"></span><span data-l10n-id="hilal-welcome-summary-workspaces">\u00c7al\u0131\u015fma alanlar\u0131</span></span>
          <strong>${workspacesHTML}</strong>
        </div>
        <div class="hw-summary-row">
          <span class="hw-summary-label"><span class="hw-icon hw-icon-check"></span><span data-l10n-id="hilal-welcome-summary-default-browser">Varsay\u0131lan taray\u0131c\u0131</span></span>
          <strong data-l10n-id="hilal-welcome-summary-default-${this._defaultBrowserSelected ? 'set' : 'no-change'}">${this._defaultBrowserSelected ? "Ayarla" : "De\u011fi\u015ftirme"}</strong>
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

      const defaultBrowserToggle = document.getElementById("hw-default-browser-toggle");
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
              button.setAttribute("data-l10n-id", "hilal-welcome-imported-button");
              button.textContent = "Aktar\u0131ld\u0131";
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
              label = await document.l10n.formatValue(`hilal-welcome-workspace-label-${item.key}`);
            } catch (e) {
              console.error("HilalWelcome: failed to format workspace label", e);
            }
            if (typeof this._workspaces.ensureWorkspace === "function") {
              this._workspaces.ensureWorkspace(
                label,
                "",
                item.workspaceColor
              );
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
