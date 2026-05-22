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

  class HilalWelcome {
    constructor(workspacesController) {
      this._workspaces = workspacesController;
      this._stage = 0;
      this._container = null;
      this._style = null;
      this._engines = [];
      this._selectedEngine = null;
      this._defaultBrowserSelected = false;
      this._workspacesSelected = {
        personal: true,
        work: true,
        social: true,
      };
    }

    async start() {
      this._centerWindow();
      this._injectStyles();
      await this._fetchEngines();
      this._render();
    }

    _centerWindow() {
      try {
        window.resizeTo(875, 560);
        window.focus();
        try {
          const appWin = window.docShell.treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow);
          appWin.rollupAllPopups();
        } catch (e) {}
        const x = screen.availLeft + (screen.availWidth - 875) / 2;
        const y = screen.availTop + (screen.availHeight - 560) / 2;
        window.moveTo(x, y);
      } catch (e) {
        console.error("HilalWelcome: failed to center window", e);
      }
    }

    _injectStyles() {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap";
      document.head.appendChild(fontLink);

      this._style = document.createElement("link");
      this._style.id = "hilal-welcome-style";
      this._style.rel = "stylesheet";
      this._style.href = "chrome://browser/content/hilal/HilalWelcome.css";
      document.head.appendChild(this._style);
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
            .map(e => ({
              name: e.name,
              originalEngine: e,
            }));

          const ddg = this._engines.find(e =>
            e.name.toLowerCase().includes("duckduckgo")
          );
          if (ddg) {
            this._selectedEngine = ddg;
          } else if (this._engines.length > 0) {
            this._selectedEngine = this._engines[0];
          }
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

    _next() {
      if (this._stage < 4) {
        this._stage++;
        this._render();
      } else {
        this._finish();
      }
    }

    _prev() {
      if (this._stage > 0) {
        this._stage--;
        this._render();
      }
    }

    async _finish() {
      if (this._workspaces) {
        if (this._workspacesSelected.personal) {
          this._workspaces.create("Ki\u{015f}isel", "\u{1F3E0}", "blue");
        }
        if (this._workspacesSelected.work) {
          this._workspaces.create("\u{0130}\u{015f}", "\u{1F4BC}", "orange");
        }
        if (this._workspacesSelected.social) {
          this._workspaces.create("Sosyal", "\u{1F4AC}", "pink");
        }
      }

      if (
        this._selectedEngine &&
        this._selectedEngine.originalEngine &&
        SearchService
      ) {
        try {
          if (SearchService.setDefault) {
            await SearchService.setDefault(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON.UNKNOWN || 1
            );
          }
          if (SearchService.setDefaultPrivate) {
            await SearchService.setDefaultPrivate(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON.UNKNOWN || 1
            );
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set search engine default", e);
        }
      }

      if (this._defaultBrowserSelected) {
        try {
          const shellSvc = window.getShellService
            ? window.getShellService()
            : null;
          if (shellSvc) {
            shellSvc.setDefaultBrowser(false);
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set default browser", e);
        }
      }

      this._restoreUI();
    }

    _restoreUI() {
      if (this._container) {
        this._container.remove();
      }
      if (this._style) {
        this._style.remove();
      }

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

    _render() {
      let container = document.getElementById("hilal-welcome");
      if (!container) {
        container = document.createElement("div");
        container.id = "hilal-welcome";
        document.getElementById("browser").appendChild(container);
      }
      this._container = container;

      const progressPercent = ((this._stage + 1) / 5) * 100;

      container.innerHTML = `
        <div id="hilal-welcome-card">
          <div id="hilal-welcome-progress">
            <div id="hilal-welcome-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div id="hilal-welcome-stage-container">
            ${this._getStageHTML()}
          </div>
          <div id="hilal-welcome-footer">
            ${this._getFooterHTML()}
          </div>
        </div>
      `;

      this._setupListeners();
    }

    _getStageHTML() {
      switch (this._stage) {
        case 0:
          return `
            <div class="hilal-welcome-content text-center">
              <div class="hilal-welcome-logo">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.2384 20.9056 10.4988 20.728 9.792C19.824 10.536 18.666 11 17.4 11C14.0863 11 11.4 8.31371 11.4 5C11.4 4.2384 11.5416 3.51 11.802 2.844C11.868 2.88 11.934 2.916 12 3Z" fill="url(#hilal-logo-grad)" />
                  <defs>
                    <linearGradient id="hilal-logo-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#37adff" />
                      <stop offset="1" stop-color="#af51f5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1>Hilal Browser'a Ho\u{015f} Geldiniz</h1>
              <p class="hilal-welcome-desc">Gizlilik odakl\u{0131}, h\u{0131}zl\u{0131} ve tamamen size \u{00f6}zel yeni nesil internet taray\u{0131}c\u{0131}n\u{0131}z.</p>
              <div class="text-center" style="margin-top: 20px;">
                <button class="hilal-btn-primary" id="btn-start">
                  <span>Ba\u{015f}layal\u{0131}m</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          `;
        case 1:
          return `
            <div class="hilal-welcome-content">
              <h1>Ayarlar\u{0131}n\u{0131}z\u{0131} \u{00d6}zelle\u{015f}tirin</h1>
              <p class="hilal-welcome-desc text-center">Tercihlerinizi yap\u{0131}land\u{0131}rarak Hilal Browser'\u{0131} hemen kullanmaya ba\u{015f}lay\u{0131}n.</p>
              
              <div class="hilal-card-list">
                <div class="hilal-settings-card">
                  <div class="hilal-card-info">
                    <span class="hilal-card-title">Varsay\u{0131}lan Taray\u{0131}c\u{0131} Yap</span>
                    <span class="hilal-card-desc">Hilal Browser'\u{0131} internetteki birincil kap\u{0131}n\u{0131}z haline getirin.</span>
                  </div>
                  <label class="hilal-switch">
                    <input type="checkbox" id="toggle-default-browser" ${this._defaultBrowserSelected ? "checked" : ""}>
                    <span class="hilal-slider"></span>
                  </label>
                </div>

                <div class="hilal-settings-card">
                  <div class="hilal-card-info">
                    <span class="hilal-card-title">Verileri \u{0130}\u{00e7}e Aktar</span>
                    <span class="hilal-card-desc">Yer imlerinizi, ge\u{00e7}mi\u{015f}inizi ve \u{015fifrelerinizi kolayca Hilal'e ta\u{015f}\u{0131}y\u{0131}n.</span>
                  </div>
                  <button class="hilal-btn-secondary" id="btn-import-data">\u{0130}\u{00e7}e Aktar</button>
                </div>
              </div>
            </div>
          `;
        case 2:
          return `
            <div class="hilal-welcome-content">
              <h1>Arama Motorunuzu Se\u{00e7}in</h1>
              <p class="hilal-welcome-desc text-center">Hilal, gizlili\u{011f}inizi korumak i\u{00e7}in varsay\u{0131}lan olarak DuckDuckGo aramalar\u{0131}n\u{0131} kullan\u{0131}r.</p>
              
              <div class="hilal-engine-grid">
                ${this._engines
                  .map((engine, idx) => {
                    const isActive =
                      this._selectedEngine &&
                      this._selectedEngine.name === engine.name;
                    const isDdg = engine.name
                      .toLowerCase()
                      .includes("duckduckgo");
                    return `
                    <div class="hilal-engine-card ${isActive ? "active" : ""}" data-idx="${idx}">
                      ${isDdg ? `<span class="hilal-badge">\u{00d6}nerilen</span>` : ""}
                      <div class="hilal-engine-icon-container">
                        ${this._getEngineIconSVG(engine.name)}
                      </div>
                      <span class="hilal-engine-name">${engine.name}</span>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        case 3:
          return `
            <div class="hilal-welcome-content">
              <h1>\u{00c7}al\u{0131}\u{015f}ma Alanlar\u{0131}n\u{0131}z\u{0131} Haz\u{0131}rlay\u{0131}n</h1>
              <p class="hilal-welcome-desc text-center">Hilal Workspaces ile sekmelerinizi izole edin. \u{0130}\u{015f}, ki\u{015f}isel ve sosyal hayat\u{0131}n\u{0131}z\u{0131} birbirinden ay\u{0131}r\u{0131}n.</p>
              
              <div class="hilal-ws-grid">
                <div class="hilal-ws-card ${this._workspacesSelected.personal ? "active-personal" : ""}" id="ws-card-personal">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-personal" ${this._workspacesSelected.personal ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #37adff; background: rgba(55, 173, 255, 0.1);">\u{1F3E0}</div>
                  <span class="hilal-ws-card-title">Ki\u{015f}isel</span>
                </div>

                <div class="hilal-ws-card ${this._workspacesSelected.work ? "active-work" : ""}" id="ws-card-work">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-work" ${this._workspacesSelected.work ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #ff9f00; background: rgba(255, 159, 0, 0.1);">\u{1F4BC}</div>
                  <span class="hilal-ws-card-title">\u{0130}\u{015f}</span>
                </div>

                <div class="hilal-ws-card ${this._workspacesSelected.social ? "active-social" : ""}" id="ws-card-social">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-social" ${this._workspacesSelected.social ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #ff4bda; background: rgba(255, 75, 218, 0.1);">\u{1F4AC}</div>
                  <span class="hilal-ws-card-title">Sosyal</span>
                </div>
              </div>
            </div>
          `;
        case 4:
          return `
            <div class="hilal-welcome-content text-center">
              <div class="hilal-welcome-logo">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="url(#hilal-success-grad)" />
                  <defs>
                    <linearGradient id="hilal-success-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#00c79a" />
                      <stop offset="1" stop-color="#37adff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1>Her \u{015e}ey Haz\u{0131}r!</h1>
              <p class="hilal-welcome-desc">Hilal Browser ile güvenli, h\u{0131}zl\u{0131} ve izole bir internet deneyimi sizi bekliyor.</p>
              <div class="text-center" style="margin-top: 20px;">
                <button class="hilal-btn-primary" id="btn-finish">
                  <span>G\u{00f6}z Atmaya Ba\u{015f}la</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          `;
      }
    }

    _getFooterHTML() {
      if (this._stage === 0 || this._stage === 4) {
        return "";
      }
      return `
        <button class="hilal-btn-secondary" id="btn-prev">Geri</button>
        <button class="hilal-btn-primary" id="btn-next">
          <span>Devam Et</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;
    }

    _getEngineIconSVG(name) {
      const n = name.toLowerCase();
      if (n.includes("duckduckgo")) {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#de5833"/>
            <path d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM11.66 8.18C11.89 8.18 12.11 8.35 12.15 8.58L12.44 10.22C12.76 10.36 13.06 10.55 13.33 10.78L14.88 10.22C15.1 10.14 15.35 10.24 15.46 10.45L16.21 11.75C16.32 11.96 16.26 12.22 16.08 12.37L14.79 13.38C14.84 13.58 14.86 13.79 14.86 14C14.86 14.21 14.84 14.42 14.79 14.62L16.08 15.63C16.26 15.78 16.32 16.04 16.21 16.25L15.46 17.55C15.35 17.76 15.1 17.86 14.88 17.78L13.33 17.22C13.06 17.45 12.76 17.64 12.44 17.78L12.15 19.42C12.11 19.65 11.89 19.82 11.66 19.82H10.16C9.93 19.82 9.71 19.65 9.67 19.42L9.38 17.78C9.06 17.64 8.76 17.45 8.49 17.22L6.94 17.78C6.72 17.86 6.47 17.76 6.36 17.55L5.61 16.25C5.5 16.04 5.56 15.78 5.74 15.63L7.03 14.62C6.98 14.42 6.96 14.21 6.96 14C6.96 13.79 6.98 13.58 7.03 13.38L5.74 12.37C5.56 12.22 5.5 11.96 5.61 11.75L6.36 10.45C6.47 10.24 6.72 10.14 6.94 10.22L8.49 10.78C8.76 10.55 9.06 10.36 9.38 10.22L9.67 8.58C9.71 8.35 9.93 8.18 10.16 8.18H11.66Z" fill="white"/>
          </svg>
        `;
      } else if (n.includes("google")) {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#4285f4"/>
            <path d="M12.24 10.285V13.715H17.89C17.64 15.015 16.48 17.525 12.24 17.525C8.58 17.525 5.6 14.535 5.6 10.885C5.6 7.235 8.58 4.245 12.24 4.245C14.33 4.245 15.73 5.125 16.53 5.885L19.24 3.235C17.49 1.625 15.1 0.655 12.24 0.655C6.34 0.655 1.55 5.145 1.55 10.885C1.55 16.625 6.34 21.115 12.24 21.115C18.4 21.115 22.49 16.825 22.49 10.885C22.49 10.215 22.41 9.715 22.3 9.285H12.24Z" fill="white" transform="scale(0.8) translate(3, 3)"/>
          </svg>
        `;
      } else {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#0c8484"/>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 16H11V10H13V16ZM13 8H11V6H13V8Z" fill="white"/>
          </svg>
        `;
      }
    }

    _setupListeners() {
      const btnPrev = document.getElementById("btn-prev");
      if (btnPrev) {
        btnPrev.addEventListener("click", () => this._prev());
      }

      const btnNext = document.getElementById("btn-next");
      if (btnNext) {
        btnNext.addEventListener("click", () => this._next());
      }

      const btnStart = document.getElementById("btn-start");
      if (btnStart) {
        btnStart.addEventListener("click", () => this._next());
      }

      const btnFinish = document.getElementById("btn-finish");
      if (btnFinish) {
        btnFinish.addEventListener("click", () => this._finish());
      }

      const chkDefaultBrowser = document.getElementById(
        "toggle-default-browser"
      );
      if (chkDefaultBrowser) {
        chkDefaultBrowser.addEventListener("change", e => {
          this._defaultBrowserSelected = e.target.checked;
        });
      }

      const btnImport = document.getElementById("btn-import-data");
      if (btnImport) {
        btnImport.addEventListener("click", async () => {
          try {
            if (
              typeof MigrationUtils !== "undefined" &&
              MigrationUtils.showMigrationWizard
            ) {
              MigrationUtils.showMigrationWizard(window, {
                isStartupMigration: true,
              });
              btnImport.textContent = "Veriler \u{0130}\u{00e7}e Aktar\u{0131}ld\u{0131}";
              btnImport.classList.add("disabled");
              btnImport.disabled = true;
            }
          } catch (e) {
            console.error("HilalWelcome: failed to open migration wizard", e);
          }
        });
      }

      const cards = this._container.querySelectorAll(".hilal-engine-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const idx = parseInt(card.dataset.idx, 10);
          this._selectedEngine = this._engines[idx];
          cards.forEach(c => c.classList.remove("active"));
          card.classList.add("active");
        });
      });

      const setupWsCard = (id, key) => {
        const card = document.getElementById(`ws-card-${id}`);
        const chk = document.getElementById(`chk-${id}`);
        if (card && chk) {
          const updateVisual = () => {
            if (this._workspacesSelected[key]) {
              card.classList.add(`active-${id}`);
            } else {
              card.classList.remove(`active-${id}`);
            }
            chk.checked = this._workspacesSelected[key];
          };

          card.addEventListener("click", e => {
            if (e.target !== chk) {
              this._workspacesSelected[key] = !this._workspacesSelected[key];
              updateVisual();
            }
          });

          chk.addEventListener("change", e => {
            this._workspacesSelected[key] = e.target.checked;
            updateVisual();
          });
        }
      };

      setupWsCard("personal", "personal");
      setupWsCard("work", "work");
      setupWsCard("social", "social");
    }
  }

  window.HilalWelcome = HilalWelcome;
})();
