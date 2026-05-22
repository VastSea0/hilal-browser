/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, gBrowser, MigrationUtils, ChromeUtils */

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

  const STAGES = 5; // 0=hero, 1=settings, 2=search, 3=workspaces, 4=done

  class HilalWelcome {
    constructor(workspacesController) {
      this._workspaces = workspacesController;
      this._stage = 0;
      this._overlay = null;
      this._style = null;
      this._engines = [];
      this._selectedEngine = null;
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
          this._engines = list
            .filter(e => {
              const n = e.name.toLowerCase();
              return !n.includes("wikipedia") && !n.includes("ebay");
            })
            .map(e => ({ name: e.name, originalEngine: e }));

          const ddg = this._engines.find(e =>
            e.name.toLowerCase().includes("duckduckgo")
          );
          this._selectedEngine = ddg || (this._engines[0] ?? null);
        }
      } catch (e) {
        console.error("HilalWelcome: failed to fetch engines", e);
      }

      if (this._engines.length === 0) {
        this._engines = [
          { name: "DuckDuckGo", originalEngine: null },
          { name: "Google", originalEngine: null },
          { name: "Bing", originalEngine: null },
        ];
        this._selectedEngine = this._engines[0];
      }
    }

    /*
     * The overlay is appended to document.documentElement so it covers the
     * entire window including the browser chrome (toolbars, tabs, sidebar).
     */
    _createOverlay() {
      let overlay = document.getElementById("hilal-welcome-overlay");
      if (!overlay) {
        overlay = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
        overlay.id = "hilal-welcome-overlay";
        /* Append to document.documentElement. position:fixed inside a XUL
         * window anchors to the viewport, which is what we want. */
        document.documentElement.appendChild(overlay);
      }
      this._overlay = overlay;
    }

    _renderStage() {
      if (!this._overlay) {
        return;
      }

      const progress = ((this._stage + 1) / STAGES) * 100;

      this._overlay.innerHTML = `
        <div class="hw-panel">
          <div class="hw-progress">
            <div class="hw-progress-fill" style="width:${progress}%"></div>
          </div>
          <div class="hw-stage">
            <div class="hw-stage-content">
              ${this._stageHTML()}
            </div>
          </div>
          ${this._footerHTML()}
        </div>
      `;

      this._attachListeners();
    }

    _stageHTML() {
      switch (this._stage) {
        case 0:
          return `
            <div class="hw-hero">
              ${this._logoSVG()}
              <h1 class="hw-title">Hilal Browser'a Ho\u015f Geldiniz</h1>
              <p class="hw-sub">Gizlilik odakl\u0131, h\u0131zl\u0131 ve size \u00f6zel yeni nesil internet taray\u0131c\u0131n\u0131z.</p>
            </div>
          `;
        case 1:
          return `
            <h2 class="hw-section-title">Temel Ayarlar</h2>
            <p class="hw-section-sub">Hilal Browser'\u0131 tercihlerinize g\u00f6re yap\u0131land\u0131r\u0131n.</p>
            <div class="hw-row-list">
              <div class="hw-row">
                <div class="hw-row-info">
                  <span class="hw-row-label">Varsay\u0131lan Taray\u0131c\u0131</span>
                  <span class="hw-row-desc">Hilal Browser'\u0131 sistemin varsay\u0131lan taray\u0131c\u0131s\u0131 yap\u0131n.</span>
                </div>
                <label class="hw-toggle">
                  <input type="checkbox" id="hw-default-browser-toggle"${this._defaultBrowserSelected ? " checked" : ""}/>
                  <span class="hw-toggle-track"></span>
                </label>
              </div>
              <div class="hw-row">
                <div class="hw-row-info">
                  <span class="hw-row-label">Verileri \u0130\u00e7e Aktar</span>
                  <span class="hw-row-desc">Yer imleri, ge\u00e7mi\u015f ve \u015fifrelerinizi ta\u015f\u0131y\u0131n.</span>
                </div>
                <button class="hw-btn-secondary" id="hw-import-btn">\u0130\u00e7e Aktar</button>
              </div>
            </div>
          `;
        case 2:
          return `
            <h2 class="hw-section-title">Arama Motoru</h2>
            <p class="hw-section-sub">Hilal, gizlili\u011finizi korumak i\u00e7in varsay\u0131lan olarak DuckDuckGo kullan\u0131r.</p>
            <div class="hw-engine-grid">
              ${this._enginesHTML()}
            </div>
          `;
        case 3:
          return `
            <h2 class="hw-section-title">\u00c7al\u0131\u015fma Alanlar\u0131</h2>
            <p class="hw-section-sub">Hilal Workspaces ile sekmeleri izole edin.</p>
            <div class="hw-ws-grid">
              ${this._workspacesHTML()}
            </div>
          `;
        case 4:
          return `
            <div class="hw-hero">
              ${this._checkSVG()}
              <h1 class="hw-title">Her \u015eey Haz\u0131r!</h1>
              <p class="hw-sub">G\u00fcvenli, h\u0131zl\u0131 ve izole bir internet deneyimi sizi bekliyor.</p>
            </div>
          `;
      }
      return "";
    }

    _footerHTML() {
      if (this._stage === 0) {
        return `
          <div class="hw-footer hw-footer-solo">
            <button class="hw-btn-primary" id="hw-next-btn">
              Ba\u015flayal\u0131m
              ${this._arrowSVG()}
            </button>
          </div>
        `;
      }
      if (this._stage === 4) {
        return `
          <div class="hw-footer hw-footer-solo">
            <button class="hw-btn-primary" id="hw-finish-btn">
              G\u00f6z Atmaya Ba\u015fla
              ${this._arrowSVG()}
            </button>
          </div>
        `;
      }
      return `
        <div class="hw-footer">
          <button class="hw-btn-ghost" id="hw-prev-btn">Geri</button>
          <button class="hw-btn-primary" id="hw-next-btn">
            Devam Et
            ${this._arrowSVG()}
          </button>
        </div>
      `;
    }

    _enginesHTML() {
      return this._engines
        .map((engine, idx) => {
          const isActive =
            this._selectedEngine && this._selectedEngine.name === engine.name;
          const isDdg = engine.name.toLowerCase().includes("duckduckgo");
          return `
            <div class="hw-engine-card${isActive ? " hw-active" : ""}" data-idx="${idx}">
              ${isDdg ? `<span class="hw-recommended-badge">\u00d6nerilen</span>` : ""}
              <div class="hw-engine-icon">
                ${this._engineIconSVG(engine.name)}
              </div>
              <span class="hw-engine-name">${engine.name}</span>
            </div>
          `;
        })
        .join("");
    }

    _workspacesHTML() {
      const items = [
        {
          key: "personal",
          label: "Ki\u015fisel",
          icon: "\uD83C\uDFE0",
          color: "#3b82f6",
          bg: "rgba(59,130,246,0.12)",
        },
        {
          key: "work",
          label: "\u0130\u015f",
          icon: "\uD83D\uDCBC",
          color: "#f59e0b",
          bg: "rgba(245,158,11,0.12)",
        },
        {
          key: "social",
          label: "Sosyal",
          icon: "\uD83D\uDCAC",
          color: "#ec4899",
          bg: "rgba(236,72,153,0.12)",
        },
      ];
      return items
        .map(item => {
          const active = this._workspacesSelected[item.key];
          return `
            <div class="hw-ws-card${active ? ` hw-ws-active-${item.key}` : ""}" id="hw-ws-${item.key}">
              <input type="checkbox" class="hw-ws-check" id="hw-ws-chk-${item.key}"${active ? " checked" : ""}/>
              <div class="hw-ws-icon" style="background:${item.bg};color:${item.color}">${item.icon}</div>
              <span class="hw-ws-name">${item.label}</span>
            </div>
          `;
        })
        .join("");
    }

    _attachListeners() {
      const on = (id, fn) => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener("click", fn);
        }
      };

      on("hw-next-btn", () => this._next());
      on("hw-prev-btn", () => this._prev());
      on("hw-finish-btn", () => this._finish());

      on("hw-default-browser-toggle", e => {
        this._defaultBrowserSelected = e.target.checked;
      });

      on("hw-import-btn", async () => {
        const btn = document.getElementById("hw-import-btn");
        try {
          if (
            typeof MigrationUtils !== "undefined" &&
            MigrationUtils.showMigrationWizard
          ) {
            MigrationUtils.showMigrationWizard(window, {
              isStartupMigration: true,
            });
            if (btn) {
              btn.textContent = "Aktar\u0131ld\u0131";
              btn.disabled = true;
            }
          }
        } catch (e) {
          console.error("HilalWelcome: migration wizard failed", e);
        }
      });

      this._overlay.querySelectorAll(".hw-engine-card").forEach(card => {
        card.addEventListener("click", () => {
          const idx = parseInt(card.dataset.idx, 10);
          this._selectedEngine = this._engines[idx];
          this._overlay
            .querySelectorAll(".hw-engine-card")
            .forEach(c => c.classList.remove("hw-active"));
          card.classList.add("hw-active");
        });
      });

      const wsKeys = ["personal", "work", "social"];
      wsKeys.forEach(key => {
        const card = document.getElementById(`hw-ws-${key}`);
        const chk = document.getElementById(`hw-ws-chk-${key}`);
        if (!card || !chk) {
          return;
        }

        const sync = () => {
          const active = this._workspacesSelected[key];
          card.classList.toggle(`hw-ws-active-${key}`, active);
          chk.checked = active;
        };

        card.addEventListener("click", e => {
          if (e.target === chk) {
            return;
          }
          this._workspacesSelected[key] = !this._workspacesSelected[key];
          sync();
        });

        chk.addEventListener("change", e => {
          this._workspacesSelected[key] = e.target.checked;
          sync();
        });
      });
    }

    _next() {
      if (this._stage < STAGES - 1) {
        this._stage++;
        this._renderStage();
      } else {
        this._finish();
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
        if (this._workspacesSelected.personal) {
          this._workspaces.create("Ki\u015fisel", "\uD83C\uDFE0", "blue");
        }
        if (this._workspacesSelected.work) {
          this._workspaces.create("\u0130\u015f", "\uD83D\uDCBC", "orange");
        }
        if (this._workspacesSelected.social) {
          this._workspaces.create("Sosyal", "\uD83D\uDCAC", "pink");
        }
      }

      if (
        this._selectedEngine?.originalEngine &&
        SearchService
      ) {
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
          const shellSvc = window.getShellService?.();
          if (shellSvc) {
            shellSvc.setDefaultBrowser(false);
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set default browser", e);
        }
      }

      try {
        Services.prefs.setBoolPref("hilal.welcome-screen.seen", true);
      } catch (e) {
        console.error("HilalWelcome: failed to save seen pref", e);
      }

      this._teardown();
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
        } catch (e) {}
      }

      try {
        window.maximize();
      } catch (e) {}
    }

    /* --- SVG helpers --- */

    _logoSVG() {
      return `
        <img class="hw-logo-mark" src="chrome://branding/content/about-logo.svg" />
      `;
    }

    _checkSVG() {
      return `
        <svg class="hw-logo-mark" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hw-grad-check" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop stop-color="#10b981"/>
              <stop offset="1" stop-color="#3b82f6"/>
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="24" fill="url(#hw-grad-check)" opacity="0.15"/>
          <circle cx="32" cy="32" r="24" stroke="url(#hw-grad-check)" stroke-width="2"/>
          <path d="M22 32l8 8 14-16" stroke="url(#hw-grad-check)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }

    _arrowSVG() {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    }

    _engineIconSVG(name) {
      const n = name.toLowerCase();
      if (n.includes("duckduckgo")) {
        return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="#de5833"/><path d="M18 9a9 9 0 100 18A9 9 0 0018 9zm-.48 3.27h2.16c.32 0 .58.22.63.53l.43 2.46c.48.21.93.49 1.33.83l2.32-.84c.3-.11.63.05.76.34l1.13 1.96c.13.29.05.64-.2.84l-1.94 1.53c.08.29.12.6.12.91s-.04.62-.12.91l1.94 1.53c.25.2.33.55.2.84l-1.13 1.96c-.13.29-.46.45-.76.34l-2.32-.84c-.4.34-.85.62-1.33.83l-.43 2.46c-.05.31-.31.53-.63.53h-2.16c-.32 0-.58-.22-.63-.53l-.43-2.46c-.48-.21-.93-.49-1.33-.83l-2.32.84c-.3.11-.63-.05-.76-.34l-1.13-1.96c-.13-.29-.05-.64.2-.84l1.94-1.53c-.08-.29-.12-.6-.12-.91s.04-.62.12-.91l-1.94-1.53c-.25-.2-.33-.55-.2-.84l1.13-1.96c.13-.29.46-.45.76-.34l2.32.84c.4-.34.85-.62 1.33-.83l.43-2.46c.05-.31.31-.53.63-.53z" fill="white"/></svg>`;
      }
      if (n.includes("google")) {
        return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="#fff"/><path d="M18.24 16.57v3.43h5.65c-.23 1.3-1.39 3.81-5.65 3.81-3.66 0-6.64-2.99-6.64-6.65s2.98-6.64 6.64-6.64c2.09 0 3.49.88 4.29 1.64l2.71-2.65C23.49 7.63 21.1 6.66 18.24 6.66c-5.9 0-10.69 4.49-10.69 10.24s4.79 10.24 10.69 10.24c6.16 0 10.25-4.29 10.25-10.24 0-.67-.08-1.17-.19-1.6H18.24z" fill="#4285f4"/></svg>`;
      }
      if (n.includes("bing")) {
        return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="#008373"/><path d="M13 9v18l5.5-3.1 1.5-5.5-3-1.4L20.5 9H13zm0 18l5.5-3.1 3 1.75L18 27 13 27z" fill="white"/></svg>`;
      }
      /* generic fallback */
      const initials = name.slice(0, 2).toUpperCase();
      return `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="18" fill="#374151"/><text x="18" y="23" text-anchor="middle" font-size="13" font-weight="700" font-family="system-ui" fill="white">${initials}</text></svg>`;
    }
  }

  window.HilalWelcome = HilalWelcome;
})();
