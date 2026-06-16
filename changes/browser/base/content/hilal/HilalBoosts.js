(function() {
  "use strict";

  const { HilalBoostsShared } = ChromeUtils.importESModule(
    "chrome://browser/content/hilal/HilalBoostsActorParent.sys.mjs"
  );

  const PREF_DATA = "hilal.boosts.data";
  const PREF_ENABLED = "hilal.boosts.enabled";
  const PREF_AUTO_PALETTE = "hilal.boosts.auto_palette.enabled";
  const PREF_BROWSER_UI = "hilal.boosts.browser_ui.enabled";
  const DEFAULT_ACCENT_COLOR = "#7c5cff";
  const DEFAULT_SECONDARY_COLOR = "#00d4ff";

  const sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(
    Ci.nsIStyleSheetService
  );

  class HilalBoostsManager {
    constructor() {
      this._boosts = {};
      this._enabled = true;
      this._extractedThemeColors = {};
      this._activeSheetUri = null;
      this._zapping = false;
      this._draggingColor = false;
      this._lastPulseAt = 0;
      this._browserFrameOverlay = null;
      this._buttonListener = event => this.togglePanel(event);
      this._panelCommandListener = event => this.onPanelCommand(event.target);
      this._zapButtonListener = () => this.startZapMode();
      this._colorPresetListener = event => this._onColorPresetClick(event);
      this._colorPickerPointerDown = event => this._onColorPickerPointerDown(event);
      this._colorPickerPointerMove = event => this._onColorPickerPointerMove(event);
      this._colorPickerPointerUp = () => {
        this._draggingColor = false;
      };

      // Register preferences observer
      this._prefObserver = () => {
        this._loadData();
        this._applyStyles();
        this._syncContentBoosts();
        this._updateUIState();
        this._updatePanelUI();
      };
    }

    init() {
      this._loadData();
      this._applyStyles();

      Services.prefs.addObserver(PREF_DATA, this._prefObserver);
      Services.prefs.addObserver(PREF_ENABLED, this._prefObserver);
      Services.prefs.addObserver(PREF_AUTO_PALETTE, this._prefObserver);
      Services.prefs.addObserver(PREF_BROWSER_UI, this._prefObserver);

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

      try {
        ChromeUtils.registerWindowActor("HilalBoosts", {
          parent: {
            esModuleURI: "chrome://browser/content/hilal/HilalBoostsActorParent.sys.mjs",
          },
          child: {
            esModuleURI: "chrome://browser/content/hilal/HilalBoostsActorChild.sys.mjs",
            events: {
              DOMDocElementInserted: {},
              DOMContentLoaded: {},
              pageshow: {},
            },
          },
          allFrames: true,
          remoteTypes: ["web", "file"],
        });
      } catch (e) {
        // Might already be registered
      }

      this._updateUIState();
      this._bindButton();
      this._bindPanelControls();

      window.addEventListener("unload", () => this.destroy(), { once: true });
    }

    destroy() {
      if (this._prefObserver) {
        Services.prefs.removeObserver(PREF_DATA, this._prefObserver);
        Services.prefs.removeObserver(PREF_ENABLED, this._prefObserver);
        Services.prefs.removeObserver(PREF_AUTO_PALETTE, this._prefObserver);
        Services.prefs.removeObserver(PREF_BROWSER_UI, this._prefObserver);
      }
      if (this._tabSelectListener) {
        window.gBrowser.tabContainer.removeEventListener("TabSelect", this._tabSelectListener);
      }
      if (this._tabsProgressListener) {
        window.gBrowser.removeTabsProgressListener(this._tabsProgressListener);
      }
      const btn = document.getElementById("hilal-boosts-button");
      if (btn && this._buttonListener) {
        btn.removeEventListener("click", this._buttonListener);
        btn.removeEventListener("keypress", this._buttonListener);
      }
      const picker = document.getElementById("hilal-boosts-color-picker");
      if (picker) {
        picker.removeEventListener("pointerdown", this._colorPickerPointerDown);
      }
      document.getElementById("hilal-boosts-zap-btn")
        ?.removeEventListener("click", this._zapButtonListener);
      for (const preset of document.querySelectorAll(".hilal-boosts-swatch-circle")) {
        preset.removeEventListener("click", this._colorPresetListener);
      }
      this._removePanelCommandListeners();
      window.removeEventListener("pointermove", this._colorPickerPointerMove);
      window.removeEventListener("pointerup", this._colorPickerPointerUp);
      this._removeBrowserFrameOverlay();
    }

    _loadData() {
      try {
        this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
      } catch (e) {
        this._enabled = true;
      }
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

    _makeDefaultBoost() {
      return {
        enabled: false,
        fontFamily: "",
        fontSize: 100,
        textCase: "none",
        smartInvert: false,
        colorEnabled: false,
        browserUIEnabled: Services.prefs.getBoolPref(PREF_BROWSER_UI, false),
        autoPaletteEnabled: Services.prefs.getBoolPref(PREF_AUTO_PALETTE, false),
        accentColor: DEFAULT_ACCENT_COLOR,
        secondaryColor: DEFAULT_SECONDARY_COLOR,
        colorIntensity: 35,
        colorBrightness: 100,
        customCSS: "",
        zappedSelectors: [],
      };
    }

    get activeDomain() {
      try {
        const uri = window.gBrowser.selectedBrowser?.currentURI;
        return this._domainForURI(uri);
      } catch (e) {}
      return null;
    }

    _domainForURI(uri) {
      if (!uri || !(uri.schemeIs("http") || uri.schemeIs("https"))) {
        return null;
      }
      try {
        return Services.eTLD.getBaseDomain(uri);
      } catch (e) {
        return uri.host;
      }
    }

    getBoostForDomain(domain) {
      if (!domain) return null;
      return this._normalizeBoost(this._boosts[domain] || this._makeDefaultBoost());
    }

    saveBoostForDomain(domain, data) {
      if (!domain) return;
      this._boosts[domain] = data;
      this._saveData();
      this._applyStyles();
      this._updateUIState();
      this._pulseContentBorder();
      this._syncContentBoosts(domain);
    }

    _syncContentBoosts(targetDomain = null) {
      try {
        for (let win of Services.wm.getEnumerator("navigator:browser")) {
          if (win.gBrowser && win.gBrowser.tabs) {
            for (let tab of win.gBrowser.tabs) {
              const browser = tab.linkedBrowser;
              if (browser && browser.browsingContext) {
                try {
                  const tabDomain = this._domainForURI(browser.currentURI);
                  if (!tabDomain || (targetDomain && tabDomain !== targetDomain)) {
                    continue;
                  }
                  const windowGlobal = browser.browsingContext.currentWindowGlobal;
                  const actor = windowGlobal?.getActor("HilalBoosts");
                  if (!actor) {
                    continue;
                  }
                  const boost = this._enabled ? this._boosts[tabDomain] : null;
                  if (boost?.enabled) {
                    actor.sendAsyncMessage("HilalBoosts:UpdateBoost", this._normalizeBoost(boost));
                  } else {
                    actor.sendAsyncMessage("HilalBoosts:ClearBoost");
                  }
                  windowGlobal
                    ?.getActor("HilalTahoe")
                    ?.sendAsyncMessage("HilalTahoe:UpdateOffsets", {});
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) {
        console.error("HilalBoosts: failed to send update to child actors", e);
      }
    }

    _applyStyles() {
      const nextSheets = new Map();
      let combinedCSS = "/* Hilal Site Boosts */\n";
      let hasActiveBoosts = false;

      if (this._enabled) {
        for (const [domain, rawBoost] of Object.entries(this._boosts)) {
          const boost = this._normalizeBoost(rawBoost);
          if (!boost.enabled) continue;

          hasActiveBoosts = true;
          let css = `/* Hilal Site Boosts: ${domain} */\n`;
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

          // CSS filter chain logic removed in favor of layout-level colors resolving.

          // Additional local element overrides to blend form controls and selection
          if (boost.colorEnabled && this._isHexColor(boost.accentColor)) {
            const accentColor = boost.accentColor;
            css += `  html { accent-color: ${accentColor} !important; }\n`;
            css += `  body ::selection { background: ${accentColor} !important; color: #fff !important; }\n`;
            css += `  body :is(button, input, textarea, select, [role="button"], [role="tab"], [role="switch"]) { accent-color: ${accentColor} !important; }\n`;
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
          nextSheets.set(domain, css);
          combinedCSS += css;
        }
      }

      if (!hasActiveBoosts) {
        this._unregisterAllSheets();
        return;
      }

      this._syncDomainSheets(nextSheets, combinedCSS);
    }

    _syncDomainSheets(nextSheets, combinedCSS) {
      const sheetType = sss.AGENT_SHEET;
      if (!HilalBoostsShared.activeSheetUris) {
        HilalBoostsShared.activeSheetUris = new Map();
      }

      if (HilalBoostsShared.activeSheetUri) {
        this._unregisterSheet(HilalBoostsShared.activeSheetUri);
        HilalBoostsShared.activeSheetUri = null;
      }

      for (const [domain, entry] of HilalBoostsShared.activeSheetUris) {
        if (!nextSheets.has(domain) || nextSheets.get(domain) !== entry.css) {
          this._unregisterSheet(entry.uri);
          HilalBoostsShared.activeSheetUris.delete(domain);
        }
      }

      for (const [domain, css] of nextSheets) {
        const current = HilalBoostsShared.activeSheetUris.get(domain);
        if (current?.css === css && sss.sheetRegistered(current.uri, sheetType)) {
          continue;
        }

        if (current) {
          this._unregisterSheet(current.uri);
        }

        try {
          const dataUriStr = "data:text/css;charset=utf-8," + encodeURIComponent(css);
          const uri = Services.io.newURI(dataUriStr);
          sss.loadAndRegisterSheet(uri, sheetType);
          HilalBoostsShared.activeSheetUris.set(domain, { uri, css });
        } catch (e) {
          console.error(`HilalBoosts: failed to register stylesheet for ${domain}`, e);
        }
      }

      HilalBoostsShared.activeSheetCSS = combinedCSS;
      HilalBoostsShared.sheetType = sheetType;
    }

    _unregisterAllSheets() {
      if (HilalBoostsShared.activeSheetUri) {
        this._unregisterSheet(HilalBoostsShared.activeSheetUri);
        HilalBoostsShared.activeSheetUri = null;
      }

      if (HilalBoostsShared.activeSheetUris) {
        for (const { uri } of HilalBoostsShared.activeSheetUris.values()) {
          this._unregisterSheet(uri);
        }
        HilalBoostsShared.activeSheetUris.clear();
      }

      HilalBoostsShared.activeSheetCSS = "";
      HilalBoostsShared.sheetType = null;
    }

    _unregisterSheet(uri) {
      for (const sheetType of [sss.AGENT_SHEET, sss.USER_SHEET]) {
        try {
          if (sss.sheetRegistered(uri, sheetType)) {
            sss.unregisterSheet(uri, sheetType);
          }
        } catch (e) {
          console.error("HilalBoosts: failed to unregister sheet", e);
        }
      }
    }

    _updateUIState() {
      const btn = document.getElementById("hilal-boosts-button");
      if (!btn) return;

      const domain = this.activeDomain;
      if (!domain) {
        btn.setAttribute("hidden", "true");
        this._updateBrowserUIColors(null);
        return;
      }

      btn.removeAttribute("hidden");
      const boost = this.getBoostForDomain(domain);
      if (this._enabled && boost && boost.enabled) {
        btn.setAttribute("active", "true");
      } else {
        btn.removeAttribute("active");
      }

      this._updateBrowserUIColors(boost);
    }

    _updateBrowserUIColors(boost) {
      const docEl = document.documentElement;
      const domain = this.activeDomain;

      if (!this._enabled) {
        this._clearBrowserUIColors();
        this._clearTahoeBoostedPageBackground();
        return;
      }

      this._updateTahoeBoostedPageBackground(boost);

      const globalAutoPalette = Services.prefs.getBoolPref(PREF_AUTO_PALETTE, false);
      const isAutoPalette = boost && boost.enabled
        ? boost.autoPaletteEnabled
        : globalAutoPalette;

      const extractedColor = domain ? this._extractedThemeColors[domain] : null;

      if (isAutoPalette && extractedColor) {
        const secondaryColor = this._rotateHexColor(extractedColor, 52);
        const intensity = boost ? boost.colorIntensity : 35;
        const brightness = boost ? boost.colorBrightness : 100;

        docEl.setAttribute("hilal-boosts-ui", "true");
        docEl.style.setProperty("--hilal-boosts-ui-accent", extractedColor);
        docEl.style.setProperty("--hilal-boosts-ui-secondary", secondaryColor);
        docEl.style.setProperty("--hilal-boosts-ui-intensity", intensity + "%");
        docEl.style.setProperty("--hilal-boosts-ui-brightness", brightness + "%");
      } else if (boost && boost.enabled && boost.browserUIEnabled) {
        docEl.setAttribute("hilal-boosts-ui", "true");
        docEl.style.setProperty("--hilal-boosts-ui-accent", boost.accentColor);
        docEl.style.setProperty("--hilal-boosts-ui-secondary", boost.secondaryColor);
        docEl.style.setProperty("--hilal-boosts-ui-intensity", boost.colorIntensity + "%");
        docEl.style.setProperty("--hilal-boosts-ui-brightness", boost.colorBrightness + "%");
      } else {
        this._clearBrowserUIColors();
      }
    }

    refreshTahoeBoostedPageBackground() {
      if (!this._enabled) {
        this._clearTahoeBoostedPageBackground();
        return;
      }

      const domain = this.activeDomain;
      this._updateTahoeBoostedPageBackground(
        domain ? this.getBoostForDomain(domain) : null
      );
    }

    _clearBrowserUIColors() {
      const docEl = document.documentElement;
      docEl.removeAttribute("hilal-boosts-ui");
      docEl.style.removeProperty("--hilal-boosts-ui-accent");
      docEl.style.removeProperty("--hilal-boosts-ui-secondary");
      docEl.style.removeProperty("--hilal-boosts-ui-intensity");
      docEl.style.removeProperty("--hilal-boosts-ui-brightness");
    }

    _updateTahoeBoostedPageBackground(boost) {
      const docEl = document.documentElement;
      if (!boost?.enabled || !boost.colorEnabled || !this._isHexColor(boost.accentColor)) {
        this._clearTahoeBoostedPageBackground();
        return;
      }

      const accentColor = this._adjustHexBrightness(
        boost.accentColor,
        boost.colorBrightness
      );
      const pageColor =
        this._parseCssRgbColor(
          getComputedStyle(docEl).getPropertyValue("--hilal-safari-page-bg")
        ) || this._fallbackTahoePageRgb();
      const accentRgb = this._parseCssRgbColor(accentColor) || pageColor;
      const accentWeight = Math.min(
        78,
        Math.max(0, Math.round(boost.colorIntensity * 1.35))
      );
      if (!accentWeight) {
        this._clearTahoeBoostedPageBackground();
        return;
      }

      const boostedRgb = this._mixRgbChannels(
        pageColor,
        accentRgb,
        accentWeight / 100
      );
      docEl.style.setProperty(
        "--hilal-safari-boosted-page-bg",
        `rgb(${boostedRgb.join(", ")})`
      );
    }

    _clearTahoeBoostedPageBackground() {
      document.documentElement.style.removeProperty(
        "--hilal-safari-boosted-page-bg"
      );
    }

    _fallbackTahoePageRgb() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? [28, 28, 30]
        : [255, 255, 255];
    }

    _mixRgbChannels(baseRgb, accentRgb, accentWeight) {
      return baseRgb.map((channel, index) =>
        Math.round(channel * (1 - accentWeight) + accentRgb[index] * accentWeight)
      );
    }

    _parseCssRgbColor(value) {
      if (!value) {
        return null;
      }

      const color = value.trim();
      const lightDarkMatch = color.match(/^light-dark\((.*),(.*)\)$/i);
      if (lightDarkMatch) {
        return this._parseCssRgbColor(
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? lightDarkMatch[2]
            : lightDarkMatch[1]
        );
      }

      const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) {
          hex = hex
            .split("")
            .map(channel => channel + channel)
            .join("");
        }
        return [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16));
      }

      const rgbMatch = color.match(/^rgba?\((.*)\)$/i);
      if (rgbMatch) {
        const channels = rgbMatch[1]
          .replace("/", " ")
          .split(/[,\s]+/)
          .filter(Boolean)
          .slice(0, 3)
          .map(channel => Math.round(parseFloat(channel)));
        return channels.length === 3 && channels.every(Number.isFinite)
          ? channels.map(channel => Math.min(255, Math.max(0, channel)))
          : null;
      }

      const srgbMatch = color.match(
        /^color\(srgb\s+([.\d]+)\s+([.\d]+)\s+([.\d]+)/i
      );
      if (srgbMatch) {
        return [1, 2, 3].map(index =>
          Math.min(255, Math.max(0, Math.round(parseFloat(srgbMatch[index]) * 255)))
        );
      }

      return null;
    }

    _updatePanelUI() {
      const panel = document.getElementById("hilal-boosts-panel");
      if (!panel || panel.state !== "open") return;

      // Force refresh panel contents
      this.populatePanel();
    }

    _bindButton() {
      const btn = document.getElementById("hilal-boosts-button");
      if (!btn) return;

      btn.addEventListener("click", this._buttonListener);
      btn.addEventListener("keypress", this._buttonListener);
    }

    _bindPanelControls() {
      const picker = document.getElementById("hilal-boosts-color-picker");
      if (picker) {
        picker.addEventListener("pointerdown", this._colorPickerPointerDown);
      }

      this._addPanelCommandListener("hilal-boosts-enable", "change");
      this._addPanelCommandListener("hilal-boosts-scale", "input");
      this._addPanelCommandListener("hilal-boosts-font", "change");
      this._addPanelCommandListener("hilal-boosts-case", "change");
      this._addPanelCommandListener("hilal-boosts-invert", "change");
      this._addPanelCommandListener("hilal-boosts-color-enable", "change");
      this._addPanelCommandListener("hilal-boosts-auto-palette-enable", "change");
      this._addPanelCommandListener("hilal-boosts-browser-ui-enable", "change");
      this._addPanelCommandListener("hilal-boosts-color", "input");
      this._addPanelCommandListener("hilal-boosts-color-secondary", "input");
      this._addPanelCommandListener("hilal-boosts-color-intensity", "input");
      this._addPanelCommandListener("hilal-boosts-color-brightness", "input");
      this._addPanelCommandListener("hilal-boosts-css", "input");
      document.getElementById("hilal-boosts-zap-btn")
        ?.addEventListener("click", this._zapButtonListener);
      for (const preset of document.querySelectorAll(".hilal-boosts-swatch-circle")) {
        preset.addEventListener("click", this._colorPresetListener);
      }

      document.getElementById("hilal-boosts-btn-close")?.addEventListener("click", () => {
        document.getElementById("hilal-boosts-panel")?.hidePopup();
      });

      document.getElementById("hilal-boosts-btn-reset")?.addEventListener("click", () => {
        const domain = this.activeDomain;
        if (domain) {
          this.saveBoostForDomain(domain, {
            enabled: false,
            fontFamily: "",
            fontSize: 100,
            textCase: "none",
            smartInvert: false,
            colorEnabled: false,
            autoPaletteEnabled: false,
            browserUIEnabled: false,
            accentColor: DEFAULT_ACCENT_COLOR,
            secondaryColor: DEFAULT_SECONDARY_COLOR,
            colorIntensity: 35,
            colorBrightness: 100,
            customCSS: "",
            zappedSelectors: []
          });
          this.populatePanel();
        }
      });

      document.getElementById("hilal-boosts-btn-sparkle")?.addEventListener("click", () => {
        const input = document.getElementById("hilal-boosts-color-enable");
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event("change"));
        }
      });

      document.getElementById("hilal-boosts-btn-invert-toggle")?.addEventListener("click", () => {
        const input = document.getElementById("hilal-boosts-invert");
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event("change"));
        }
      });

      document.getElementById("hilal-boosts-btn-sliders-toggle")?.addEventListener("click", (event) => {
        const drawer = document.getElementById("hilal-boosts-drawer-sliders");
        const btn = event.currentTarget;
        if (drawer) {
          const isOpen = drawer.getAttribute("open") === "true";
          drawer.setAttribute("open", isOpen ? "false" : "true");
          btn.setAttribute("active", isOpen ? "false" : "true");
        }
      });

      document.getElementById("hilal-boosts-btn-power-toggle")?.addEventListener("click", () => {
        const input = document.getElementById("hilal-boosts-enable");
        if (input) {
          input.checked = !input.checked;
          input.dispatchEvent(new Event("change"));
        }
      });

      for (const btn of document.querySelectorAll(".hilal-boosts-font-preview-btn")) {
        btn.addEventListener("click", (event) => {
          const fontInput = document.getElementById("hilal-boosts-font");
          if (fontInput) {
            fontInput.value = event.currentTarget.dataset.font || "";
            fontInput.dispatchEvent(new Event("change"));
          }
        });
      }

      document.getElementById("hilal-boosts-btn-size-toggle")?.addEventListener("click", () => {
        const drawer = document.getElementById("hilal-boosts-drawer-sliders");
        const btn = document.getElementById("hilal-boosts-btn-sliders-toggle");
        if (drawer) {
          const isOpen = drawer.getAttribute("open") === "true";
          drawer.setAttribute("open", isOpen ? "false" : "true");
          btn?.setAttribute("active", isOpen ? "false" : "true");
        }
      });

      document.getElementById("hilal-boosts-btn-case-cycle")?.addEventListener("click", () => {
        const input = document.getElementById("hilal-boosts-case");
        if (input) {
          const cases = ["none", "uppercase", "lowercase", "capitalize"];
          const currentIdx = cases.indexOf(input.value || "none");
          const nextIdx = (currentIdx + 1) % cases.length;
          input.value = cases[nextIdx];
          input.dispatchEvent(new Event("change"));
        }
      });

      document.getElementById("hilal-boosts-code-btn")?.addEventListener("click", () => {
        const drawer = document.getElementById("hilal-boosts-drawer-code");
        if (drawer) {
          const isOpen = drawer.getAttribute("open") === "true";
          drawer.setAttribute("open", isOpen ? "false" : "true");
        }
      });

      window.addEventListener("pointermove", this._colorPickerPointerMove);
      window.addEventListener("pointerup", this._colorPickerPointerUp);
    }

    _addPanelCommandListener(id, type) {
      const element = document.getElementById(id);
      if (!element) return;
      element.addEventListener(type, this._panelCommandListener);
    }

    _removePanelCommandListeners() {
      const bindings = [
        ["hilal-boosts-enable", "change"],
        ["hilal-boosts-scale", "input"],
        ["hilal-boosts-font", "change"],
        ["hilal-boosts-case", "change"],
        ["hilal-boosts-invert", "change"],
        ["hilal-boosts-color-enable", "change"],
        ["hilal-boosts-auto-palette-enable", "change"],
        ["hilal-boosts-browser-ui-enable", "change"],
        ["hilal-boosts-color", "input"],
        ["hilal-boosts-color-secondary", "input"],
        ["hilal-boosts-color-intensity", "input"],
        ["hilal-boosts-color-brightness", "input"],
        ["hilal-boosts-css", "input"],
      ];
      for (const [id, type] of bindings) {
        const element = document.getElementById(id);
        element?.removeEventListener(type, this._panelCommandListener);
      }
    }

    togglePanel(event) {
      if (event?.type === "keypress" && event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event?.preventDefault();
      event?.stopPropagation();

      const domain = this.activeDomain;
      if (!domain) return;

      const btn = document.getElementById("hilal-boosts-button");
      const panel = document.getElementById("hilal-boosts-panel");
      if (!btn || !panel) return;

      this.populatePanel();

      if (panel.state === "open" || panel.state === "showing") {
        panel.hidePopup();
        btn.removeAttribute("open");
        return;
      }

      const anchor = this._getPopupAnchor(btn);
      btn.setAttribute("open", "true");
      panel.addEventListener("popuphidden", () => {
        btn.removeAttribute("open");
      }, { once: true });
      panel.openPopup(anchor.node, anchor.position, 0, 0, false, false, event);
      this._pulseContentBorder(true);
    }

    _getPopupAnchor(btn) {
      const btnRect = btn.getBoundingClientRect();
      if (btnRect.width && btnRect.height) {
        return { node: btn, position: "bottomright topright" };
      }

      const urlbar = document.getElementById("urlbar");
      const urlbarRect = urlbar?.getBoundingClientRect();
      if (urlbarRect?.width && urlbarRect?.height) {
        return { node: urlbar, position: "bottomright topright" };
      }

      return { node: document.documentElement, position: "overlap" };
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

      // Color Boost
      document.getElementById("hilal-boosts-color-enable").checked = !!boost.colorEnabled;
      document.getElementById("hilal-boosts-auto-palette-enable").checked = !!boost.autoPaletteEnabled;
      document.getElementById("hilal-boosts-browser-ui-enable").checked = !!boost.browserUIEnabled;
      const colorInput = document.getElementById("hilal-boosts-color");
      colorInput.value = boost.accentColor;
      const secondaryColorInput = document.getElementById("hilal-boosts-color-secondary");
      secondaryColorInput.value = boost.secondaryColor;

      const intensityInput = document.getElementById("hilal-boosts-color-intensity");
      const intensityValue = document.getElementById("hilal-boosts-color-intensity-value");
      intensityInput.value = boost.colorIntensity;
      intensityValue.textContent = boost.colorIntensity + "%";

      const brightnessInput = document.getElementById("hilal-boosts-color-brightness");
      const brightnessValue = document.getElementById("hilal-boosts-color-brightness-value");
      brightnessInput.value = boost.colorBrightness;
      brightnessValue.textContent = boost.colorBrightness + "%";
      this._updateColorPickerVisuals(boost);

      // Custom CSS
      document.getElementById("hilal-boosts-css").value = boost.customCSS || "";

      // Action Row Buttons Active State
      document.getElementById("hilal-boosts-btn-invert-toggle").toggleAttribute("active", !!boost.smartInvert);
      document.getElementById("hilal-boosts-btn-power-toggle").toggleAttribute("active", !!boost.enabled);

      // Text Case Cycle Button Text
      const caseBtn = document.getElementById("hilal-boosts-btn-case-cycle");
      if (caseBtn) {
        const textCase = boost.textCase || "none";
        let label = "Case: Default";
        if (textCase === "uppercase") label = "Case: UPPER";
        else if (textCase === "lowercase") label = "Case: lower";
        else if (textCase === "capitalize") label = "Case: Title";
        caseBtn.textContent = label;
      }

      // Font Family Selection Grid Highlight
      const font = boost.fontFamily || "";
      let activeFontLabel = "System Default";
      for (const fontBtn of document.querySelectorAll(".hilal-boosts-font-preview-btn")) {
        const isMatch = (fontBtn.dataset.font || "") === font;
        fontBtn.toggleAttribute("active", isMatch);
        if (isMatch) {
          activeFontLabel = fontBtn.getAttribute("title") || "System Default";
        }
      }
      const labelEl = document.getElementById("hilal-boosts-lbl-active-font");
      if (labelEl) {
        labelEl.textContent = activeFontLabel;
      }

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
        document.getElementById("hilal-boosts-drawer-zaps")?.setAttribute("open", "true");
      } else {
        const placeholder = document.createElement("div");
        placeholder.textContent = "No active element blocks";
        placeholder.className = "hilal-boosts-zap-placeholder";
        zapsList.appendChild(placeholder);
        document.getElementById("hilal-boosts-drawer-zaps")?.setAttribute("open", "false");
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
      } else if (target.id === "hilal-boosts-color-enable") {
        boost.colorEnabled = target.checked;
        if (target.checked) {
          boost.enabled = true;
          document.getElementById("hilal-boosts-enable").checked = true;
        }
      } else if (target.id === "hilal-boosts-auto-palette-enable") {
        boost.autoPaletteEnabled = target.checked;
        if (target.checked) {
          boost.enabled = true;
          document.getElementById("hilal-boosts-enable").checked = true;
        }
      } else if (target.id === "hilal-boosts-browser-ui-enable") {
        boost.browserUIEnabled = target.checked;
        if (target.checked) {
          boost.enabled = true;
          document.getElementById("hilal-boosts-enable").checked = true;
        }
      } else if (target.id === "hilal-boosts-color") {
        boost.accentColor = this._normalizeHexColor(target.value);
        boost.colorEnabled = true;
        boost.enabled = true;
        document.getElementById("hilal-boosts-enable").checked = true;
        document.getElementById("hilal-boosts-color-enable").checked = true;
        this._updateColorPickerVisuals(boost);
      } else if (target.id === "hilal-boosts-color-secondary") {
        boost.secondaryColor = this._normalizeHexColor(target.value, DEFAULT_SECONDARY_COLOR);
        boost.colorEnabled = true;
        boost.enabled = true;
        document.getElementById("hilal-boosts-enable").checked = true;
        document.getElementById("hilal-boosts-color-enable").checked = true;
        this._updateColorPickerVisuals(boost);
      } else if (target.id === "hilal-boosts-color-intensity") {
        boost.colorIntensity = this._clampNumber(target.value, 0, 100, 35);
        boost.colorEnabled = true;
        boost.enabled = true;
        document.getElementById("hilal-boosts-enable").checked = true;
        document.getElementById("hilal-boosts-color-enable").checked = true;
        document.getElementById("hilal-boosts-color-intensity-value").textContent = boost.colorIntensity + "%";
      } else if (target.id === "hilal-boosts-color-brightness") {
        boost.colorBrightness = this._clampNumber(target.value, 80, 120, 100);
        boost.colorEnabled = true;
        boost.enabled = true;
        document.getElementById("hilal-boosts-enable").checked = true;
        document.getElementById("hilal-boosts-color-enable").checked = true;
        document.getElementById("hilal-boosts-color-brightness-value").textContent = boost.colorBrightness + "%";
      } else if (target.id === "hilal-boosts-css") {
        boost.customCSS = target.value;
      }

      this.saveBoostForDomain(domain, boost);
    }

    _onColorPresetClick(event) {
      const color = event.currentTarget?.dataset?.color;
      if (!this._isHexColor(color)) return;

      const domain = this.activeDomain;
      if (!domain) return;

      const boost = this.getBoostForDomain(domain);
      boost.accentColor = color;
      boost.secondaryColor = this._rotateHexColor(color, 52);
      boost.colorEnabled = true;
      boost.enabled = true;
      document.getElementById("hilal-boosts-enable").checked = true;
      document.getElementById("hilal-boosts-color-enable").checked = true;
      document.getElementById("hilal-boosts-color").value = boost.accentColor;
      document.getElementById("hilal-boosts-color-secondary").value = boost.secondaryColor;
      this._updateColorPickerVisuals(boost);
      this.saveBoostForDomain(domain, boost);
    }

    _onColorPickerPointerDown(event) {
      if (event.button !== 0) return;

      const secondaryDot = document.getElementById("hilal-boosts-color-dot-secondary");
      const primaryDot = document.getElementById("hilal-boosts-color-dot-primary");
      
      this._dragTarget = "primary";
      if (secondaryDot && event.target === secondaryDot) {
        this._dragTarget = "secondary";
      } else if (secondaryDot && primaryDot) {
        const secRect = secondaryDot.getBoundingClientRect();
        const priRect = primaryDot.getBoundingClientRect();
        const secDist = Math.hypot(event.clientX - (secRect.left + secRect.width / 2), event.clientY - (secRect.top + secRect.height / 2));
        const priDist = Math.hypot(event.clientX - (priRect.left + priRect.width / 2), event.clientY - (priRect.top + priRect.height / 2));
        if (secDist < priDist && secDist < 25) {
          this._dragTarget = "secondary";
        }
      }

      this._draggingColor = true;
      this._updateColorFromPickerEvent(event);
    }

    _onColorPickerPointerMove(event) {
      if (!this._draggingColor) return;
      this._updateColorFromPickerEvent(event);
    }

    _updateColorFromPickerEvent(event) {
      const domain = this.activeDomain;
      if (!domain) return;

      event.preventDefault();
      const picker = document.getElementById("hilal-boosts-color-picker");
      const rect = picker.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const radius = Math.min(rect.width, rect.height) * 0.42;
      const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
      const angle = Math.atan2(dy, dx);
      const hue = (angle * 180 / Math.PI + 360) % 360;
      const saturation = Math.round(distance / radius * 100);

      const boost = this.getBoostForDomain(domain);
      if (this._dragTarget === "secondary") {
        const accentHsl = this._hexToHsl(boost.accentColor);
        boost.secondaryColor = this._hslToHex(hue, accentHsl.s, 48);
      } else {
        const prevAccentHsl = this._hexToHsl(boost.accentColor);
        const prevSecondaryHsl = this._hexToHsl(boost.secondaryColor);
        let diff = (prevSecondaryHsl.h - prevAccentHsl.h + 360) % 360;
        if (diff === 0) diff = 52;
        boost.accentColor = this._hslToHex(hue, saturation, 55);
        boost.secondaryColor = this._hslToHex((hue + diff) % 360, saturation, 48);
      }
      boost.colorEnabled = true;
      boost.enabled = true;
      document.getElementById("hilal-boosts-enable").checked = true;
      document.getElementById("hilal-boosts-color-enable").checked = true;
      document.getElementById("hilal-boosts-color").value = boost.accentColor;
      document.getElementById("hilal-boosts-color-secondary").value = boost.secondaryColor;
      this._updateColorPickerVisuals(boost);
      this.saveBoostForDomain(domain, boost);
    }

    _updateColorPickerVisuals(boost) {
      const picker = document.getElementById("hilal-boosts-color-picker");
      const dot = document.getElementById("hilal-boosts-color-dot-primary");
      const secondaryDot = document.getElementById("hilal-boosts-color-dot-secondary");
      const circle = picker?.querySelector(".hilal-boosts-picker-circle");
      const preview = document.getElementById("hilal-boosts-gradient-preview");
      if (!picker || !dot || !secondaryDot) return;

      const color = this._normalizeHexColor(boost.accentColor);
      const secondaryColor = this._normalizeHexColor(boost.secondaryColor, DEFAULT_SECONDARY_COLOR);
      picker.style.setProperty("--hilal-boosts-accent", color);
      picker.style.setProperty("--hilal-boosts-secondary", secondaryColor);
      
      this._positionColorDot(dot, color, 42);
      this._positionColorDot(secondaryDot, secondaryColor, 42);
      dot.style.backgroundColor = color;
      secondaryDot.style.backgroundColor = secondaryColor;

      if (circle) {
        const { s } = this._hexToHsl(color);
        const diameter = s * 0.84;
        circle.style.width = diameter + "%";
        circle.style.height = diameter + "%";
      }

      this._updateArcFill(picker, color, secondaryColor);

      if (preview) {
        preview.style.setProperty("--hilal-boosts-accent", color);
        preview.style.setProperty("--hilal-boosts-secondary", secondaryColor);
      }
      for (const preset of document.querySelectorAll(".hilal-boosts-swatch-circle")) {
        preset.toggleAttribute("active", preset.dataset.color === color);
      }
    }

    _positionColorDot(dot, color, radiusScale) {
      const { h, s } = this._hexToHsl(color);
      const angle = h * Math.PI / 180;
      const distance = s / 100 * radiusScale;
      dot.style.left = (50 + Math.cos(angle) * distance) + "%";
      dot.style.top = (50 + Math.sin(angle) * distance) + "%";
    }

    _initArcSVG(picker) {
      const NS = "http://www.w3.org/2000/svg";
      const w = picker.clientWidth || 170;
      const h = picker.clientHeight || 170;

      const svg = document.createElementNS(NS, "svg");
      svg.classList.add("zen-boost-color-picker-arc-svg");
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "3";

      const defs = document.createElementNS(NS, "defs");
      const grad = document.createElementNS(NS, "linearGradient");
      grad.setAttribute("id", "hilal-arc-gradient");

      const stop1 = document.createElementNS(NS, "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("id", "hilal-ag-stop1");

      const stop2 = document.createElementNS(NS, "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("id", "hilal-ag-stop2");

      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
      svg.appendChild(defs);

      const path = document.createElementNS(NS, "path");
      path.classList.add("arc-fill");
      path.setAttribute("fill", "url(#hilal-arc-gradient)");
      svg.appendChild(path);

      picker.appendChild(svg);
      return svg;
    }

    _updateArcFill(picker, color1, color2) {
      let svg = picker.querySelector(".zen-boost-color-picker-arc-svg");
      if (!svg) {
        svg = this._initArcSVG(picker);
      }
      if (!svg) return;

      const w = picker.clientWidth || 170;
      const h = picker.clientHeight || 170;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.42;

      const hsl1 = this._hexToHsl(color1);
      const hsl2 = this._hexToHsl(color2);

      const angle1 = hsl1.h;
      const angle2 = hsl2.h;
      const r = (hsl1.s / 100) * radius;
      const thickness = 2.5;

      const toXY = (deg, ra) => {
        const rad = (deg * Math.PI) / 180;
        return [cx + ra * Math.cos(rad), cy + ra * Math.sin(rad)];
      };

      const [x1, y1] = toXY(angle1, r);
      const [x2, y2] = toXY(angle2, r);

      const grad = svg.querySelector("#hilal-arc-gradient");
      if (grad) {
        grad.querySelector("#hilal-ag-stop1").setAttribute("stop-color", color1);
        grad.querySelector("#hilal-ag-stop2").setAttribute("stop-color", color2);
        grad.setAttribute("x1", x1);
        grad.setAttribute("y1", y1);
        grad.setAttribute("x2", x2);
        grad.setAttribute("y2", y2);
      }

      const outerR = r + thickness / 2;
      const innerR = Math.max(r - thickness / 2, 1);
      const delta = (angle2 - angle1 + 360) % 360;
      const large = delta > 180 ? 1 : 0;
      const [ox1, oy1] = toXY(angle1, outerR);
      const [ox2, oy2] = toXY(angle2, outerR);
      const [ix2, iy2] = toXY(angle2, innerR);
      const [ix1, iy1] = toXY(angle1, innerR);

      const d = `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z`;
      svg.querySelector(".arc-fill").setAttribute("d", d);
    }

    _normalizeBoost(boost) {
      boost.colorEnabled = boost.colorEnabled === true;
      boost.browserUIEnabled = boost.browserUIEnabled === true;
      if (boost.autoPaletteEnabled === undefined) {
        boost.autoPaletteEnabled = Services.prefs.getBoolPref("hilal.boosts.auto_palette.enabled", false);
      } else {
        boost.autoPaletteEnabled = boost.autoPaletteEnabled === true;
      }
      boost.accentColor = this._normalizeHexColor(boost.accentColor);
      boost.secondaryColor = this._normalizeHexColor(
        boost.secondaryColor,
        DEFAULT_SECONDARY_COLOR
      );
      boost.colorIntensity = this._clampNumber(boost.colorIntensity, 0, 100, 35);
      boost.colorBrightness = this._clampNumber(boost.colorBrightness, 80, 120, 100);
      if (!Array.isArray(boost.zappedSelectors)) {
        boost.zappedSelectors = [];
      }
      return boost;
    }

    _clampNumber(value, min, max, fallback) {
      const number = Number(value);
      if (!Number.isFinite(number)) {
        return fallback;
      }
      return Math.min(max, Math.max(min, Math.round(number)));
    }

    _normalizeHexColor(value, fallback = DEFAULT_ACCENT_COLOR) {
      if (this._isHexColor(value)) {
        return value.toLowerCase();
      }
      return fallback;
    }

    _isHexColor(value) {
      return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
    }

    _hexToHsl(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lightness = (max + min) / 2;
      const delta = max - min;
      let hue = 0;
      let saturation = 0;

      if (delta) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
        if (max === r) {
          hue = ((g - b) / delta) % 6;
        } else if (max === g) {
          hue = (b - r) / delta + 2;
        } else {
          hue = (r - g) / delta + 4;
        }
        hue *= 60;
        if (hue < 0) hue += 360;
      }

      return { h: hue, s: saturation * 100, l: lightness * 100 };
    }

    _adjustHexBrightness(hex, brightness) {
      const amount = (brightness - 100) / 100;
      const channels = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16));
      const adjusted = channels.map(channel => {
        if (amount >= 0) {
          return channel + (255 - channel) * amount;
        }
        return channel * (1 + amount);
      });
      return "#" + adjusted
        .map(channel => Math.round(Math.min(255, Math.max(0, channel)))
          .toString(16)
          .padStart(2, "0"))
        .join("");
    }

    _rotateHexColor(hex, degrees) {
      const { h, s, l } = this._hexToHsl(this._normalizeHexColor(hex));
      return this._hslToHex((h + degrees) % 360, Math.max(55, s), Math.max(48, l));
    }

    _hslToHex(hue, saturation, lightness) {
      const s = saturation / 100;
      const l = lightness / 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = l - c / 2;
      let r = 0;
      let g = 0;
      let b = 0;

      if (hue < 60) {
        r = c; g = x;
      } else if (hue < 120) {
        r = x; g = c;
      } else if (hue < 180) {
        g = c; b = x;
      } else if (hue < 240) {
        g = x; b = c;
      } else if (hue < 300) {
        r = x; b = c;
      } else {
        r = c; b = x;
      }

      const toHex = channel => Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Interactive element zapper trigger
    startZapMode() {
      const domain = this.activeDomain;
      if (!domain || !this._enabled) return;

      // Close the panel
      const panel = document.getElementById("hilal-boosts-panel");
      if (panel) {
        panel.hidePopup();
      }

      const browser = window.gBrowser.selectedBrowser;
      const actor = browser.browsingContext.currentWindowGlobal?.getActor("HilalBoosts");
      if (actor) {
        const boost = this.getBoostForDomain(domain);
        this._zapping = true;
        actor.sendAsyncMessage("HilalBoosts:StartZap", {
          accentColor: boost.accentColor,
          secondaryColor: boost.secondaryColor,
        });
        this._pulseContentBorder(true);
      }
    }

    _pulseContentBorder(force = false) {
      const now = Date.now();
      if (!force && now - this._lastPulseAt < 280) {
        return;
      }
      this._lastPulseAt = now;

      try {
        const domain = this.activeDomain;
        const boost = domain ? this.getBoostForDomain(domain) : null;
        const rect = this._getContentFrameRect();
        if (!rect) {
          return;
        }

        const overlay = this._ensureBrowserFrameOverlay();
        const wave = overlay.firstElementChild;
        const accentColor = boost?.accentColor || DEFAULT_ACCENT_COLOR;
        const secondaryColor = boost?.secondaryColor || DEFAULT_SECONDARY_COLOR;

        overlay.style.left = rect.left + "px";
        overlay.style.top = rect.top + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.borderColor = this._hexToRgba(accentColor, 0.54);
        overlay.style.boxShadow =
          `inset 0 0 0 1px ${this._hexToRgba(secondaryColor, 0.24)}, ` +
          `0 0 22px ${this._hexToRgba(accentColor, 0.16)}`;
        wave.style.borderColor = this._hexToRgba(accentColor, 0.64);
        wave.style.boxShadow = `0 0 12px ${this._hexToRgba(accentColor, 0.36)}`;

        overlay.getAnimations().forEach(animation => animation.cancel());
        wave.getAnimations().forEach(animation => animation.cancel());
        overlay.animate(
          [
            { opacity: 0, transform: "scale(.997)" },
            { opacity: 1, transform: "scale(1)", offset: 0.22 },
            { opacity: 0, transform: "scale(1.006)" },
          ],
          { duration: 760, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
        wave.animate(
          [
            { opacity: 0, transform: "scale(1.0)" },
            { opacity: 1, transform: "scale(1.003)", offset: 0.28 },
            { opacity: 0, transform: "scale(1.008)" },
          ],
          { duration: 760, easing: "cubic-bezier(.2,.8,.2,1)" }
        );
      } catch (e) {
        console.error("HilalBoosts: failed to pulse content border", e);
      }
    }

    _getContentFrameRect() {
      const candidates = [
        window.gBrowser?.selectedBrowser,
        document.getElementById("tabbrowser-tabbox"),
        document.getElementById("appcontent"),
        document.getElementById("browser"),
      ];

      for (const node of candidates) {
        const rect = node?.getBoundingClientRect?.();
        if (rect?.width && rect?.height) {
          return rect;
        }
      }

      if (window.innerWidth && window.innerHeight) {
        return {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }
      return null;
    }

    _ensureBrowserFrameOverlay() {
      if (this._browserFrameOverlay?.isConnected) {
        return this._browserFrameOverlay;
      }

      const overlay = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
      overlay.id = "hilal-boosts-content-frame";
      overlay.style.cssText = [
        "position: fixed",
        "pointer-events: none",
        "z-index: 2147483647",
        "border: 1px solid transparent",
        "border-radius: 10px",
        "opacity: 0",
        "box-sizing: border-box",
        "contain: layout style paint",
      ].join(";");

      const wave = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
      wave.style.cssText = [
        "position: absolute",
        "inset: -2px",
        "border: 2px solid transparent",
        "border-radius: inherit",
        "opacity: 0",
      ].join(";");
      overlay.appendChild(wave);
      document.documentElement.appendChild(overlay);
      this._browserFrameOverlay = overlay;
      return overlay;
    }

    _removeBrowserFrameOverlay() {
      this._browserFrameOverlay?.remove();
      this._browserFrameOverlay = null;
    }

    _hexToRgba(hex, alpha) {
      const color = this._normalizeHexColor(hex);
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    handleZappedElement(selector) {
      const domain = this.activeDomain;
      if (!domain || !selector || !this._enabled) return;

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

    handleZapStopped() {
      this._zapping = false;
    }

    handleExtractedThemeColor(domain, themeColor) {
      if (!domain) return;
      if (themeColor) {
        this._extractedThemeColors[domain] = themeColor;
      } else {
        delete this._extractedThemeColors[domain];
      }

      if (domain === this.activeDomain) {
        this._updateUIState();
        this._updatePanelUI();
      }
    }
  }

  function tryInit() {
    if (window.gHilalBoosts) {
      return;
    }
    if (typeof gBrowser === "undefined" || !gBrowser.tabContainer) {
      setTimeout(tryInit, 50);
      return;
    }
    window.gHilalBoosts = new HilalBoostsManager();
    window.gHilalBoosts.init();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", tryInit, { once: true });
  } else {
    tryInit();
  }

})();
