(function() {
  "use strict";

  const { HilalBoostsShared } = ChromeUtils.importESModule(
    "chrome://browser/content/hilal/HilalBoostsActorParent.sys.mjs"
  );

  const PREF_DATA = "hilal.boosts.data";
  const PREF_ENABLED = "hilal.boosts.enabled";

  const sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(
    Ci.nsIStyleSheetService
  );

  class HilalBoostsManager {
    constructor() {
      this._boosts = {};
      this._enabled = true;
      this._activeSheetUri = null;
      this._zapping = false;

      // Register preferences observer
      this._prefObserver = () => {
        this._loadData();
        this._applyStyles();
        this._updateUIState();
        this._updatePanelUI();
      };
    }

    init() {
      this._loadData();
      this._applyStyles();

      Services.prefs.addObserver(PREF_DATA, this._prefObserver);
      Services.prefs.addObserver(PREF_ENABLED, this._prefObserver);

      // Listen to tab selection/navigation to update panel state
      this._tabSelectListener = () => {
        this._updateUIState();
      };
      window.gBrowser.tabContainer.addEventListener("TabSelect", this._tabSelectListener);

      this._tabsProgressListener = {
        onLocationChange: (browser, webProgress, request, locationURI) => {
          this._updateUIState();
        }
      };
      window.gBrowser.addTabsProgressListener(this._tabsProgressListener);

      // Register zapper window actor programmatically
      try {
        ChromeUtils.registerWindowActor("HilalBoosts", {
          parent: {
            esModuleURI: "chrome://browser/content/hilal/HilalBoostsActorParent.sys.mjs",
          },
          child: {
            esModuleURI: "chrome://browser/content/hilal/HilalBoostsActorChild.sys.mjs",
            events: {
              DOMWindowCreated: {},
            },
          },
          allFrames: true,
          remoteTypes: ["web", "file"],
        });
      } catch (e) {
        // Might already be registered
      }

      this._updateUIState();

      window.addEventListener("unload", () => this.destroy(), { once: true });
    }

    destroy() {
      if (this._prefObserver) {
        Services.prefs.removeObserver(PREF_DATA, this._prefObserver);
        Services.prefs.removeObserver(PREF_ENABLED, this._prefObserver);
      }
      if (this._tabSelectListener) {
        window.gBrowser.tabContainer.removeEventListener("TabSelect", this._tabSelectListener);
      }
      if (this._tabsProgressListener) {
        window.gBrowser.removeTabsProgressListener(this._tabsProgressListener);
      }
    }

    _loadData() {
      this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
      try {
        const dataStr = Services.prefs.getStringPref(PREF_DATA, "{}");
        this._boosts = JSON.parse(dataStr);
      } catch (e) {
        console.error("HilalBoosts: failed to load data", e);
        this._boosts = {};
      }
    }

    _saveData() {
      try {
        Services.prefs.setStringPref(PREF_DATA, JSON.stringify(this._boosts));
      } catch (e) {
        console.error("HilalBoosts: failed to save data", e);
      }
    }

    get activeDomain() {
      try {
        const uri = window.gBrowser.selectedBrowser?.currentURI;
        if (uri && (uri.schemeIs("http") || uri.schemeIs("https"))) {
          return uri.host;
        }
      } catch (e) {}
      return null;
    }

    getBoostForDomain(domain) {
      if (!domain) return null;
      if (!this._boosts[domain]) {
        this._boosts[domain] = {
          enabled: false,
          fontFamily: "",
          fontSize: 100,
          textCase: "none",
          smartInvert: false,
          customCSS: "",
          zappedSelectors: []
        };
      }
      return this._boosts[domain];
    }

    saveBoostForDomain(domain, data) {
      if (!domain) return;
      this._boosts[domain] = data;
      this._saveData();
      this._applyStyles();
      this._updateUIState();
    }

    _applyStyles() {
      // Generate the single combined CSS string
      let css = "/* Hilal Site Boosts */\n";
      let hasActiveBoosts = false;

      if (this._enabled) {
        for (const [domain, boost] of Object.entries(this._boosts)) {
          if (!boost.enabled) continue;

          hasActiveBoosts = true;
          css += `@-moz-document domain("${domain}") {\n`;

          // Font family
          if (boost.fontFamily) {
            css += `  body *:not(.material-icons, .fa, .fas, .far, .google-symbols) { font-family: ${boost.fontFamily} !important; }\n`;
          }

          // Font size
          if (boost.fontSize && boost.fontSize !== 100) {
            css += `  html { font-size: ${boost.fontSize}% !important; }\n`;
          }

          // Text transform
          if (boost.textCase && boost.textCase !== "none") {
            css += `  body *:not(script, style) { text-transform: ${boost.textCase} !important; }\n`;
          }

          // Smart invert (dark mode)
          if (boost.smartInvert) {
            css += `  html { filter: invert(0.9) hue-rotate(180deg) !important; background: #fff !important; }\n`;
            css += `  img, video, iframe, canvas, embed, object, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }\n`;
          }

          // Zaps
          if (boost.zappedSelectors && boost.zappedSelectors.length > 0) {
            for (const selector of boost.zappedSelectors) {
              if (selector.trim()) {
                css += `  ${selector} { display: none !important; }\n`;
              }
            }
          }

          // Custom CSS
          if (boost.customCSS) {
            css += `  ${boost.customCSS}\n`;
          }

          css += `}\n`;
        }
      }

      if (!hasActiveBoosts) {
        // Unregister global sheet if registered
        if (HilalBoostsShared.activeSheetUri) {
          try {
            if (sss.sheetRegistered(HilalBoostsShared.activeSheetUri, sss.USER_SHEET)) {
              sss.unregisterSheet(HilalBoostsShared.activeSheetUri, sss.USER_SHEET);
            }
          } catch (e) {
            console.error("HilalBoosts: failed to unregister sheet", e);
          }
          HilalBoostsShared.activeSheetUri = null;
          HilalBoostsShared.activeSheetCSS = "";
        }
        return;
      }

      // Check if this CSS is already registered globally
      if (HilalBoostsShared.activeSheetCSS === css) {
        return;
      }

      // Unregister previous sheet if any
      if (HilalBoostsShared.activeSheetUri) {
        try {
          if (sss.sheetRegistered(HilalBoostsShared.activeSheetUri, sss.USER_SHEET)) {
            sss.unregisterSheet(HilalBoostsShared.activeSheetUri, sss.USER_SHEET);
          }
        } catch (e) {
          console.error("HilalBoosts: failed to unregister sheet", e);
        }
      }

      // Register the new generated stylesheet
      try {
        const dataUriStr = "data:text/css;charset=utf-8," + encodeURIComponent(css);
        HilalBoostsShared.activeSheetUri = Services.io.newURI(dataUriStr);
        HilalBoostsShared.activeSheetCSS = css;
        sss.loadAndRegisterSheet(HilalBoostsShared.activeSheetUri, sss.USER_SHEET);
      } catch (e) {
        console.error("HilalBoosts: failed to register stylesheet", e);
      }
    }

    _updateUIState() {
      const btn = document.getElementById("hilal-boosts-button");
      if (!btn) return;

      const domain = this.activeDomain;
      if (!domain) {
        btn.setAttribute("hidden", "true");
        return;
      }

      btn.removeAttribute("hidden");
      const boost = this.getBoostForDomain(domain);
      if (boost && boost.enabled) {
        btn.setAttribute("active", "true");
      } else {
        btn.removeAttribute("active");
      }
    }

    _updatePanelUI() {
      const panel = document.getElementById("hilal-boosts-panel");
      if (!panel || panel.state !== "open") return;

      // Force refresh panel contents
      this.populatePanel();
    }

    populatePanel() {
      const domain = this.activeDomain;
      if (!domain) return;

      const boost = this.getBoostForDomain(domain);

      document.getElementById("hilal-boosts-panel-title").textContent = domain;
      document.getElementById("hilal-boosts-enable").checked = boost.enabled;

      // Scale
      const scaleInput = document.getElementById("hilal-boosts-scale");
      const scaleValue = document.getElementById("hilal-boosts-scale-value");
      scaleInput.value = boost.fontSize || 100;
      scaleValue.textContent = (boost.fontSize || 100) + "%";

      // Font Family
      document.getElementById("hilal-boosts-font").value = boost.fontFamily || "";

      // Text Case
      document.getElementById("hilal-boosts-case").value = boost.textCase || "none";

      // Smart Invert
      document.getElementById("hilal-boosts-invert").checked = boost.smartInvert || false;

      // Custom CSS
      document.getElementById("hilal-boosts-css").value = boost.customCSS || "";

      // Zaps
      const zapsList = document.getElementById("hilal-boosts-zaps-list");
      zapsList.textContent = "";
      if (boost.zappedSelectors && boost.zappedSelectors.length > 0) {
        for (const selector of boost.zappedSelectors) {
          const item = document.createElement("div");
          item.className = "hilal-boosts-zap-item";
          
          const label = document.createElement("span");
          label.textContent = selector;
          label.className = "hilal-boosts-zap-label";
          label.title = selector;
          
          const removeBtn = document.createElement("button");
          removeBtn.textContent = "×";
          removeBtn.className = "hilal-boosts-zap-remove";
          removeBtn.addEventListener("click", () => {
            boost.zappedSelectors = boost.zappedSelectors.filter(s => s !== selector);
            this.saveBoostForDomain(domain, boost);
            this.populatePanel();
          });

          item.appendChild(label);
          item.appendChild(removeBtn);
          zapsList.appendChild(item);
        }
      } else {
        const placeholder = document.createElement("div");
        placeholder.textContent = "No active element blocks";
        placeholder.className = "hilal-boosts-zap-placeholder";
        zapsList.appendChild(placeholder);
      }
    }

    onPanelCommand(target) {
      const domain = this.activeDomain;
      if (!domain) return;

      const boost = this.getBoostForDomain(domain);

      if (target.id === "hilal-boosts-enable") {
        boost.enabled = target.checked;
      } else if (target.id === "hilal-boosts-scale") {
        boost.fontSize = parseInt(target.value);
        document.getElementById("hilal-boosts-scale-value").textContent = boost.fontSize + "%";
      } else if (target.id === "hilal-boosts-font") {
        boost.fontFamily = target.value;
      } else if (target.id === "hilal-boosts-case") {
        boost.textCase = target.value;
      } else if (target.id === "hilal-boosts-invert") {
        boost.smartInvert = target.checked;
      } else if (target.id === "hilal-boosts-css") {
        boost.customCSS = target.value;
      }

      this.saveBoostForDomain(domain, boost);
    }

    // Interactive element zapper trigger
    startZapMode() {
      const domain = this.activeDomain;
      if (!domain) return;

      // Close the panel
      const panel = document.getElementById("hilal-boosts-panel");
      if (panel) {
        panel.hidePopup();
      }

      const browser = window.gBrowser.selectedBrowser;
      const actor = browser.browsingContext.currentWindowGlobal.getActor("HilalBoosts");
      if (actor) {
        this._zapping = true;
        actor.sendAsyncMessage("HilalBoosts:StartZap", {});
      }
    }

    handleZappedElement(selector) {
      const domain = this.activeDomain;
      if (!domain || !selector) return;

      const boost = this.getBoostForDomain(domain);
      if (!boost.zappedSelectors) {
        boost.zappedSelectors = [];
      }
      if (!boost.zappedSelectors.includes(selector)) {
        boost.zappedSelectors.push(selector);
      }
      boost.enabled = true; // Auto-enable boost when zapping
      this.saveBoostForDomain(domain, boost);
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    window.gHilalBoosts = new HilalBoostsManager();
    window.gHilalBoosts.init();
  }, { once: true });

})();
