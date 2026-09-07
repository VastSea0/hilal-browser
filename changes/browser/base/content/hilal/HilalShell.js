/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global gBrowser, Services, ChromeUtils, TabContextMenu */

(function () {
  const MaterialYouTheme = {
    COLOR_MAP: {
      blue: "#37adff",
      turquoise: "#00c79a",
      green: "#51cd00",
      yellow: "#ffcb00",
      orange: "#ff9f00",
      red: "#ff613d",
      pink: "#ff4bda",
      purple: "#af51f5",
    },

    hexToRgb(hex) {
      if (!hex) return null;
      let clean = hex.trim();
      if (this.COLOR_MAP[clean.toLowerCase()]) {
        clean = this.COLOR_MAP[clean.toLowerCase()];
      }
      if (clean.startsWith("#")) {
        clean = clean.slice(1);
      }
      if (clean.length === 3) {
        clean = clean
          .split("")
          .map(c => c + c)
          .join("");
      }
      if (clean.length !== 6) return null;
      const num = parseInt(clean, 16);
      if (isNaN(num)) return null;
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    },

    srgbToOklch(r, g, b) {
      const toLinear = c => {
        c /= 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      const lr = toLinear(r);
      const lg = toLinear(g);
      const lb = toLinear(b);

      const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
      const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
      const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

      const l = Math.cbrt(l_);
      const m = Math.cbrt(m_);
      const s = Math.cbrt(s_);

      const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
      const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
      const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

      const C = Math.sqrt(a * a + b_ * b_);
      let H = Math.atan2(b_, a) * (180 / Math.PI);
      if (H < 0) H += 360;

      return { L, C, H };
    },

    _currentColor: "blue",
    _listenerAttached: false,

    isDarkMode() {
      if (document.documentElement.hasAttribute("lwtheme-brighttext")) {
        return (
          document.documentElement.getAttribute("lwtheme-brighttext") === "true"
        );
      }
      if (window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    },

    initListeners() {
      if (this._listenerAttached) return;
      this._listenerAttached = true;
      if (window.matchMedia) {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", () => {
            this.applyTheme(this._currentColor);
          });
      }
      const obs = new MutationObserver(mutations => {
        for (const m of mutations) {
          if (m.attributeName === "lwtheme-brighttext") {
            this.applyTheme(this._currentColor);
            break;
          }
        }
      });
      obs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lwtheme-brighttext"],
      });
    },

    applyTheme(colorInput) {
      if (colorInput) {
        this._currentColor = colorInput;
      }
      this.initListeners();

      const currentColor = this._currentColor || "blue";
      const rgb = this.hexToRgb(currentColor) || [175, 81, 245];
      const { C: rawChroma, H: hue } = this.srgbToOklch(rgb[0], rgb[1], rgb[2]);
      const chroma = Math.max(rawChroma, 0.14);
      const h = hue.toFixed(1);

      const rootStyle = document.documentElement.style;
      const isDark = this.isDarkMode();
      document.documentElement.setAttribute(
        "data-theme-mode",
        isDark ? "dark" : "light"
      );

      if (isDark) {
        // Material 3 Dark Scheme Dynamic Tonal Tokens
        rootStyle.setProperty(
          "--md-sys-color-primary",
          `oklch(0.82 ${chroma.toFixed(3)} ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-primary",
          `oklch(0.20 ${chroma.toFixed(3)} ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-primary-container",
          `oklch(0.32 ${(chroma * 0.85).toFixed(3)} ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-primary-container",
          `oklch(0.92 ${(chroma * 0.35).toFixed(3)} ${h})`
        );

        // Surface tinting (M3 Expressive dark tones 6, 12, 17, 22)
        rootStyle.setProperty(
          "--md-sys-color-surface",
          `oklch(0.12 0.015 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-dim",
          `oklch(0.09 0.012 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-lowest",
          `oklch(0.08 0.010 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-low",
          `oklch(0.14 0.014 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container",
          `oklch(0.17 0.018 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-high",
          `oklch(0.21 0.022 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-highest",
          `oklch(0.25 0.026 ${h})`
        );

        // Text & outline
        rootStyle.setProperty(
          "--md-sys-color-on-surface",
          `oklch(0.92 0.008 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-surface-variant",
          `oklch(0.80 0.015 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-outline",
          `oklch(0.58 0.022 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-outline-variant",
          `oklch(0.32 0.020 ${h})`
        );

        // Secondary & Tertiary
        rootStyle.setProperty(
          "--md-sys-color-secondary",
          `oklch(0.80 0.05 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-secondary-container",
          `oklch(0.30 0.05 ${h})`
        );
      } else {
        // Material 3 Light Scheme Dynamic Tonal Tokens
        rootStyle.setProperty(
          "--md-sys-color-primary",
          `oklch(0.42 ${chroma.toFixed(3)} ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-primary",
          `oklch(0.98 0.005 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-primary-container",
          `oklch(0.88 ${(chroma * 0.65).toFixed(3)} ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-primary-container",
          `oklch(0.18 ${(chroma * 0.85).toFixed(3)} ${h})`
        );

        // Surface tinting (M3 Expressive light tones 98, 96, 93, 89, 85)
        rootStyle.setProperty(
          "--md-sys-color-surface",
          `oklch(0.98 0.008 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-dim",
          `oklch(0.93 0.012 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-lowest",
          `oklch(1.00 0.000 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-low",
          `oklch(0.96 0.010 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container",
          `oklch(0.93 0.014 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-high",
          `oklch(0.89 0.018 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-surface-container-highest",
          `oklch(0.85 0.022 ${h})`
        );

        // Text & outline
        rootStyle.setProperty(
          "--md-sys-color-on-surface",
          `oklch(0.18 0.015 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-on-surface-variant",
          `oklch(0.38 0.022 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-outline",
          `oklch(0.52 0.025 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-outline-variant",
          `oklch(0.80 0.018 ${h})`
        );

        // Secondary & Tertiary
        rootStyle.setProperty(
          "--md-sys-color-secondary",
          `oklch(0.45 0.06 ${h})`
        );
        rootStyle.setProperty(
          "--md-sys-color-secondary-container",
          `oklch(0.88 0.04 ${h})`
        );
      }

      try {
        const hex = rgb
          ? `#${rgb.map(x => x.toString(16).padStart(2, "0")).join("")}`
          : "#3b82f6";
        let wsName = "";
        if (window.gHilalWorkspaces?.activeWorkspace) {
          wsName = window.gHilalWorkspaces.activeWorkspace.name;
        }
        this._lastHex = hex;
        this._lastWsName = wsName;

        if (!this._themeChannel) {
          this._themeChannel = new BroadcastChannel("hilal-theme-channel");
          this._themeChannel.onmessage = e => {
            if (e.data && e.data.action === "request-theme") {
              this.broadcastTheme();
            }
          };
        }
        this.broadcastTheme();
      } catch (e) {}
    },

    getThemeData() {
      const currentColor = this._currentColor || "purple";
      const rgb = this.hexToRgb(currentColor) || [175, 81, 245];
      const hex = rgb
        ? `#${rgb.map(x => x.toString(16).padStart(2, "0")).join("")}`
        : "#af51f5";
      const { C: rawChroma, H: hue } = this.srgbToOklch(rgb[0], rgb[1], rgb[2]);
      const chroma = Math.max(rawChroma, 0.14);
      const h = hue.toFixed(1);
      const isDark = this.isDarkMode();

      if (isDark) {
        return {
          isDark: true,
          color: hex,
          accent: hex,
          primary: `oklch(0.82 ${chroma.toFixed(3)} ${h})`,
          bg: `color-mix(in srgb, ${hex} 14%, #131217)`,
          surface: `color-mix(in srgb, ${hex} 22%, #1b1922)`,
          surfaceHover: `color-mix(in srgb, ${hex} 32%, #262330)`,
          border: `color-mix(in srgb, ${hex} 25%, rgba(255, 255, 255, 0.08))`,
          text: "#f3f4f6",
          textMuted: "#9ca3af",
        };
      } else {
        return {
          isDark: false,
          color: hex,
          accent: hex,
          primary: `oklch(0.42 ${chroma.toFixed(3)} ${h})`,
          bg: `color-mix(in srgb, ${hex} 8%, #f7f6fa)`,
          surface: "#ffffff",
          surfaceHover: `color-mix(in srgb, ${hex} 12%, #ebeaf2)`,
          border: `color-mix(in srgb, ${hex} 15%, rgba(0, 0, 0, 0.08))`,
          text: "#111827",
          textMuted: "#6b7280",
        };
      }
    },

    broadcastTheme() {
      try {
        const themeData = this.getThemeData();

        if (typeof Services !== "undefined" && Services.ppmm?.sharedData) {
          Services.ppmm.sharedData.set("hilal:activeTheme", themeData);
          Services.ppmm.sharedData.flush();
        }

        if (window.gBrowser?.tabs) {
          for (const tab of window.gBrowser.tabs) {
            try {
              const actor =
                tab.linkedBrowser?.browsingContext?.currentWindowGlobal?.getActor(
                  "HilalTahoe"
                );
              if (actor) {
                actor.sendAsyncMessage("HilalTahoe:SetNewTabTheme", themeData);
              }
            } catch (e) {}
          }
        }

        if (!this._themeChannel) {
          this._themeChannel = new BroadcastChannel("hilal-theme-channel");
          this._themeChannel.onmessage = e => {
            if (e.data && e.data.action === "request-theme") {
              this.broadcastTheme();
            }
          };
        }
        this._themeChannel.postMessage({
          action: "theme-update",
          color: themeData.accent,
          theme: themeData,
          workspaceName: this._lastWsName || "",
        });
      } catch (e) {}
    },
  };

  window.MaterialYouTheme = MaterialYouTheme;

  const HilalShell = {
    initialized: false,
    tabMode: "vertical", // "vertical" | "dual" | "horizontal"
    _draggedTab: null,
    _draggedPill: null,
    _draggedHTab: null,
    _searchDebounceTimer: null,
    _searchAbortController: null,
    _suggestions: [],
    _selectedSuggestionIndex: -1,

    init() {
      if (this.initialized) return;
      if (!window.gBrowser || !window.gBrowser.tabContainer) {
        window.addEventListener("load", () => this.init(), { once: true });
        return;
      }
      this.initialized = true;

      // Read saved tab mode preference
      if (typeof Services !== "undefined") {
        try {
          this.tabMode = Services.prefs.getStringPref(
            "hilal.tabs.layoutMode",
            "vertical"
          );
        } catch (e) {
          this.tabMode = "vertical";
        }
      }

      this.ensureTabContextMenuReady();
      this.createHeaderShell();
      this.createSidebar();
      this.setupUrlSearchAndSuggestions();
      this.mountNativeToolbarElements();
      this.bindBrowserEvents();
      this.hookWorkspaces();
      this.setTabMode(this.tabMode, false);
      this.renderWorkspaces();
      this.renderTabs();
      this.syncUrl();

      if (typeof CustomizableUI !== "undefined") {
        try {
          CustomizableUI.addListener({
            onWidgetAdded: () => this.syncExtensions(),
            onWidgetRemoved: () => this.syncExtensions(),
            onWidgetMoved: () => this.syncExtensions(),
            onAreaReset: () => this.syncExtensions(),
          });
        } catch (e) {}
      }
      const nbTarget = document.getElementById("nav-bar-customization-target");
      if (nbTarget) {
        const obs = new MutationObserver(() => this.syncExtensions());
        obs.observe(nbTarget, { childList: true });
      }
    },

    ensureTabContextMenuReady() {
      try {
        if (
          window.gBrowser &&
          typeof window.gBrowser.translateTabContextMenu === "function"
        ) {
          window.gBrowser.translateTabContextMenu();
        } else if (
          window.MozXULElement &&
          typeof window.MozXULElement.insertFTLIfNeeded === "function"
        ) {
          window.MozXULElement.insertFTLIfNeeded("browser/tabContextMenu.ftl");
        }
        const menu = document.getElementById("tabContextMenu");
        if (menu) {
          menu.querySelectorAll("[data-lazy-l10n-id]").forEach(el => {
            el.setAttribute(
              "data-l10n-id",
              el.getAttribute("data-lazy-l10n-id")
            );
            el.removeAttribute("data-lazy-l10n-id");
          });
        }
      } catch (e) {
        console.error("Hilal: Failed to translate tabContextMenu", e);
      }
    },

    createHeaderShell() {
      if (document.getElementById("hilal-header-shell")) return;

      const headerShell = document.createElement("div");
      headerShell.id = "hilal-header-shell";

      // 1. Top Bar
      const topbar = document.createElement("header");
      topbar.id = "hilal-topbar";

      // Traffic lights slot in topbar
      const topTrafficSlot = document.createElement("div");
      topTrafficSlot.id = "hilal-topbar-traffic-slot";

      // Shared macOS traffic lights container
      const spacer = document.createElement("div");
      spacer.id = "hilal-traffic-lights-spacer";

      const nativeButtons =
        document.querySelector("#TabsToolbar .titlebar-buttonbox-container") ||
        document.querySelector(".titlebar-buttonbox-container");
      if (nativeButtons) {
        spacer.appendChild(nativeButtons);
      } else {
        const boxContainer = document.createXULElement
          ? document.createXULElement("hbox")
          : document.createElement("div");
        boxContainer.className = "titlebar-buttonbox-container";
        const box = document.createXULElement
          ? document.createXULElement("hbox")
          : document.createElement("div");
        box.className = "titlebar-buttonbox";
        boxContainer.appendChild(box);
        spacer.appendChild(boxContainer);
      }
      topTrafficSlot.appendChild(spacer);
      topbar.appendChild(topTrafficSlot);

      // Nav group (Back, Forward, Reload)
      const navGroup = document.createElement("div");
      navGroup.id = "hilal-nav-group";

      const backBtn = document.createElement("button");
      backBtn.className = "hilal-btn";
      backBtn.id = "hilal-back-btn";
      backBtn.setAttribute("data-l10n-id", "navbar-tooltip-back");
      backBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
      backBtn.addEventListener("click", () => {
        if (window.gBrowser?.canGoBack) {
          window.gBrowser.goBack();
        } else if (window.gBrowser?.webNavigation?.canGoBack) {
          window.gBrowser.webNavigation.goBack();
        }
      });
      navGroup.appendChild(backBtn);

      const forwardBtn = document.createElement("button");
      forwardBtn.className = "hilal-btn";
      forwardBtn.id = "hilal-forward-btn";
      forwardBtn.setAttribute("data-l10n-id", "navbar-tooltip-forward");
      forwardBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
      forwardBtn.addEventListener("click", () => {
        if (window.gBrowser?.canGoForward) {
          window.gBrowser.goForward();
        } else if (window.gBrowser?.webNavigation?.canGoForward) {
          window.gBrowser.webNavigation.goForward();
        }
      });
      navGroup.appendChild(forwardBtn);

      const reloadBtn = document.createElement("button");
      reloadBtn.className = "hilal-btn";
      reloadBtn.id = "hilal-reload-btn";
      reloadBtn.setAttribute("data-l10n-id", "reload-button");
      reloadBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
      reloadBtn.addEventListener("click", () => {
        if (window.gBrowser) window.gBrowser.reload();
      });
      navGroup.appendChild(reloadBtn);

      topbar.appendChild(navGroup);

      // Topbar workspaces slot (used in dual and horizontal modes)
      const topWsSlot = document.createElement("div");
      topWsSlot.id = "hilal-topbar-workspaces-slot";
      topbar.appendChild(topWsSlot);

      // Material 3 URL Search Container
      const urlContainer = document.createElement("div");
      urlContainer.id = "hilal-url-container";

      const secIcon = document.createElement("div");
      secIcon.id = "hilal-url-security-icon";
      secIcon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>';
      urlContainer.appendChild(secIcon);

      const urlInput = document.createElement("input");
      urlInput.id = "hilal-url-input";
      urlInput.type = "text";
      urlInput.setAttribute("data-l10n-id", "urlbar-placeholder");
      urlInput.setAttribute("autocomplete", "off");
      urlInput.setAttribute("spellcheck", "false");
      urlContainer.appendChild(urlInput);

      // Clear button
      const clearBtn = document.createElement("button");
      clearBtn.id = "hilal-url-clear-btn";
      clearBtn.className = "hilal-btn";
      clearBtn.setAttribute("data-l10n-id", "hilal-toolbar-clear");
      clearBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      clearBtn.style.display = "none";
      clearBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        urlInput.value = "";
        clearBtn.style.display = "none";
        urlInput.focus();
        this.hideSuggestions();
      });
      urlContainer.appendChild(clearBtn);

      // Copy URL Action Button
      const copyBtn = document.createElement("button");
      copyBtn.id = "hilal-url-copy-btn";
      copyBtn.className = "hilal-btn hilal-url-action-btn";
      copyBtn.setAttribute("data-l10n-id", "hilal-toolbar-copy-url");
      copyBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
      copyBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const url = window.gBrowser?.currentURI?.spec;
        if (url && url !== "about:blank" && url !== "about:newtab") {
          navigator.clipboard.writeText(url);
          copyBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
          copyBtn.style.color = "var(--md-sys-color-primary)";
          setTimeout(() => {
            copyBtn.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
            copyBtn.style.color = "";
          }, 1200);
        }
      });
      urlContainer.appendChild(copyBtn);

      // Theme / Boosts Action Button
      const themeBtn = document.createElement("button");
      themeBtn.id = "hilal-url-theme-btn";
      themeBtn.className = "hilal-btn hilal-url-action-btn";
      themeBtn.setAttribute("data-l10n-id", "hilal-toolbar-theme");
      themeBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.17 19.59 10.54 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/><circle cx="8.5" cy="10.5" r="1.5"/><circle cx="15.5" cy="10.5" r="1.5"/><circle cx="12" cy="7.5" r="1.5"/></svg>';
      themeBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        this.openThemePicker(themeBtn, e);
      });
      urlContainer.appendChild(themeBtn);

      // Page Actions wrapper slot for native Firefox page actions (#star-button-box, reader-mode, boosts)
      const pageActionsSlot = document.createElement("div");
      pageActionsSlot.id = "hilal-page-actions-slot";
      const nativePageActions = document.getElementById("page-action-buttons");
      if (nativePageActions) {
        pageActionsSlot.appendChild(nativePageActions);
      }
      urlContainer.appendChild(pageActionsSlot);

      // Suggestions Dropdown Container (M3 Search View Specification)
      const suggestionsDropdown = document.createElement("div");
      suggestionsDropdown.id = "hilal-search-dropdown";
      urlContainer.appendChild(suggestionsDropdown);

      topbar.appendChild(urlContainer);

      // Top Right Controls (Extensions, Mode Switcher, Sidebar Toggle)
      const rightGroup = document.createElement("div");
      rightGroup.id = "hilal-top-right-group";

      // Native Extensions Slot (Pinned webextensions + Unified Extensions button)
      const extSlot = document.createElement("div");
      extSlot.id = "hilal-extensions-slot";
      rightGroup.appendChild(extSlot);

      // Tab Mode Switcher Button
      const modeBtn = document.createElement("button");
      modeBtn.className = "hilal-btn";
      modeBtn.id = "hilal-layout-mode-btn";
      modeBtn.addEventListener("click", () => this.cycleTabMode());
      modeBtn.addEventListener("contextmenu", e => {
        e.preventDefault();
        this.showModeContextMenu(modeBtn, e);
      });
      rightGroup.appendChild(modeBtn);

      // Sidebar Toggle Button
      const sidebarToggle = document.createElement("button");
      sidebarToggle.className = "hilal-btn";
      sidebarToggle.id = "hilal-sidebar-toggle-btn";
      sidebarToggle.setAttribute(
        "data-l10n-id",
        "hilal-toolbar-sidebar-toggle"
      );
      sidebarToggle.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H9v14h10z"/></svg>';
      sidebarToggle.addEventListener("click", () => {
        const sb = document.getElementById("hilal-sidebar");
        if (sb) {
          const isCollapsed = sb.getAttribute("collapsed") === "true";
          sb.setAttribute("collapsed", isCollapsed ? "false" : "true");
          sidebarToggle.classList.toggle("collapsed", !isCollapsed);
        }
      });
      rightGroup.appendChild(sidebarToggle);

      topbar.appendChild(rightGroup);
      headerShell.appendChild(topbar);

      // 2. Horizontal Tabs Strip (Dual & Horizontal Modes)
      const hTabs = document.createElement("div");
      hTabs.id = "hilal-horizontal-tabs";

      // Traffic lights slot for horizontal Chrome-style mode
      const hTrafficSlot = document.createElement("div");
      hTrafficSlot.id = "hilal-htabs-traffic-slot";
      hTabs.appendChild(hTrafficSlot);

      // Horizontal tab list container
      const hTabList = document.createElement("div");
      hTabList.id = "hilal-horizontal-tab-list";
      hTabs.appendChild(hTabList);

      // New Tab Button
      const hNewTabBtn = document.createElement("button");
      hNewTabBtn.className = "hilal-btn";
      hNewTabBtn.id = "hilal-htab-newtab-btn";
      hNewTabBtn.setAttribute("data-l10n-id", "hilal-toolbar-newtab");
      hNewTabBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
      hNewTabBtn.addEventListener("click", () => this.openNewTab());
      hTabs.appendChild(hNewTabBtn);

      headerShell.appendChild(hTabs);

      // Insert headerShell before #browser
      const browserEl = document.getElementById("browser");
      if (browserEl && browserEl.parentNode) {
        browserEl.parentNode.insertBefore(headerShell, browserEl);
      } else {
        document.body.prepend(headerShell);
      }
    },

    createSidebar() {
      if (document.getElementById("hilal-sidebar")) return;

      const sidebar = document.createElement("aside");
      sidebar.id = "hilal-sidebar";

      // Workspaces rail (Compact Icon-Only Design)
      const wsBar = document.createElement("div");
      wsBar.id = "hilal-workspaces-bar";
      sidebar.appendChild(wsBar);

      // Tabs header (+ New Tab)
      const tabsHeader = document.createElement("div");
      tabsHeader.id = "hilal-tabs-bar-header";

      const label = document.createElement("span");
      label.className = "hilal-tabs-label";
      label.setAttribute("data-l10n-id", "urlbar-search-mode-tabs");
      tabsHeader.appendChild(label);

      const newTabBtn = document.createElement("button");
      newTabBtn.className = "hilal-btn";
      newTabBtn.id = "hilal-newtab-btn";
      newTabBtn.setAttribute("data-l10n-id", "hilal-toolbar-newtab");
      newTabBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
      newTabBtn.addEventListener("click", () => this.openNewTab());
      tabsHeader.appendChild(newTabBtn);

      sidebar.appendChild(tabsHeader);

      // Vertical tab list
      const tabList = document.createElement("div");
      tabList.id = "hilal-tab-list";
      sidebar.appendChild(tabList);

      // Sidebar Footer (Settings)
      const footer = document.createElement("div");
      footer.id = "hilal-sidebar-footer";

      const settingsBtn = document.createElement("button");
      settingsBtn.className = "hilal-btn";
      settingsBtn.id = "hilal-settings-btn";
      settingsBtn.setAttribute("data-l10n-id", "hilal-toolbar-settings");
      settingsBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
      settingsBtn.addEventListener("click", () => {
        if (typeof window.openPreferences === "function") {
          window.openPreferences();
        } else {
          this.navigate("about:preferences");
        }
      });
      footer.appendChild(settingsBtn);

      sidebar.appendChild(footer);

      // Insert sidebar as first child of #browser
      const browserEl = document.getElementById("browser");
      if (browserEl) {
        browserEl.insertBefore(sidebar, browserEl.firstElementChild);
      }
    },

    setTabMode(mode, persist = true) {
      this.tabMode = mode;
      document.documentElement.setAttribute("data-tab-mode", mode);
      if (persist && typeof Services !== "undefined") {
        try {
          Services.prefs.setStringPref("hilal.tabs.layoutMode", mode);
        } catch (e) {}
      }

      const wsBar = document.getElementById("hilal-workspaces-bar");
      const sidebar = document.getElementById("hilal-sidebar");
      const topWsSlot = document.getElementById("hilal-topbar-workspaces-slot");
      const trafficLights = document.getElementById(
        "hilal-traffic-lights-spacer"
      );
      const topTrafficSlot = document.getElementById(
        "hilal-topbar-traffic-slot"
      );
      const hTrafficSlot = document.getElementById("hilal-htabs-traffic-slot");

      if (mode === "vertical") {
        // Vertical Only: Workspaces in sidebar, traffic lights in topbar
        if (wsBar && sidebar) {
          sidebar.insertBefore(wsBar, sidebar.firstChild);
        }
        if (trafficLights && topTrafficSlot) {
          topTrafficSlot.appendChild(trafficLights);
        }
      } else if (mode === "dual") {
        // Dual (Safari-style): Workspaces moved to topbar, vertical tabs have full sidebar
        if (wsBar && topWsSlot) {
          topWsSlot.appendChild(wsBar);
        }
        if (trafficLights && topTrafficSlot) {
          topTrafficSlot.appendChild(trafficLights);
        }
      } else if (mode === "horizontal") {
        // Horizontal (Chrome-style): Workspaces in topbar, traffic lights on top tab strip
        if (wsBar && topWsSlot) {
          topWsSlot.appendChild(wsBar);
        }
        if (trafficLights && hTrafficSlot) {
          hTrafficSlot.appendChild(trafficLights);
        }
      }

      this.updateModeButton();
      this.renderWorkspaces();
      this.renderTabs();
    },

    cycleTabMode() {
      const modes = ["vertical", "dual", "horizontal"];
      const nextIdx = (modes.indexOf(this.tabMode) + 1) % modes.length;
      this.setTabMode(modes[nextIdx]);
    },

    MODE_ICONS: {
      vertical:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="5.5" y1="7" x2="6.5" y2="7"/><line x1="5.5" y1="11" x2="6.5" y2="11"/></svg>',
      dual: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="9" y1="9" x2="21" y2="9"/></svg>',
      horizontal:
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="8.5" x2="21" y2="8.5"/><line x1="9" y1="3" x2="9" y2="8.5"/><line x1="15" y1="3" x2="15" y2="8.5"/></svg>',
    },

    updateModeButton() {
      const btn = document.getElementById("hilal-layout-mode-btn");
      if (!btn) return;

      if (this.tabMode === "vertical") {
        btn.title = "Tab Layout: Vertical Only (Click to switch)";
        btn.innerHTML = this.MODE_ICONS.vertical;
      } else if (this.tabMode === "dual") {
        btn.title =
          "Tab Layout: Dual Mode (Safari Style: Horizontal & Vertical, Click to switch)";
        btn.innerHTML = this.MODE_ICONS.dual;
      } else {
        btn.title =
          "Tab Layout: Horizontal Only (Chrome Style, Click to switch)";
        btn.innerHTML = this.MODE_ICONS.horizontal;
      }
    },

    showModeContextMenu(anchor, event) {
      let menu = document.getElementById("hilal-mode-context-menu");
      if (!menu) {
        menu = document.createElement("div");
        menu.id = "hilal-mode-context-menu";
        menu.className = "hilal-dropdown-menu";
        document.body.appendChild(menu);

        const options = [
          {
            id: "vertical",
            label: "Vertical Sidebar Tabs",
            icon: this.MODE_ICONS.vertical,
          },
          {
            id: "dual",
            label: "Dual Tabs (Safari Style)",
            icon: this.MODE_ICONS.dual,
          },
          {
            id: "horizontal",
            label: "Horizontal Tabs (Chrome Style)",
            icon: this.MODE_ICONS.horizontal,
          },
        ];

        options.forEach(opt => {
          const item = document.createElement("button");
          item.className = "hilal-dropdown-item";
          item.dataset.mode = opt.id;
          item.innerHTML = `<span class="hilal-dropdown-icon">${opt.icon}</span><span class="hilal-dropdown-label">${opt.label}</span>`;
          item.addEventListener("click", () => {
            this.setTabMode(opt.id);
            menu.style.display = "none";
          });
          menu.appendChild(item);
        });

        document.addEventListener("mousedown", e => {
          if (
            menu.style.display !== "none" &&
            !menu.contains(e.target) &&
            !anchor.contains(e.target)
          ) {
            menu.style.display = "none";
          }
        });
      }

      const rect = anchor.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;
      menu.style.display = "flex";

      menu.querySelectorAll(".hilal-dropdown-item").forEach(el => {
        el.classList.toggle("active", el.dataset.mode === this.tabMode);
      });
    },

    // Material 3 Expressive Search & Autocomplete
    setupUrlSearchAndSuggestions() {
      const input = document.getElementById("hilal-url-input");
      const clearBtn = document.getElementById("hilal-url-clear-btn");
      const dropdown = document.getElementById("hilal-search-dropdown");
      const container = document.getElementById("hilal-url-container");
      if (!input || !dropdown) return;

      const updateClearBtn = () => {
        if (clearBtn) {
          clearBtn.style.display =
            document.activeElement === input && input.value.trim().length > 0
              ? "inline-flex"
              : "none";
        }
      };

      input.addEventListener("input", () => {
        updateClearBtn();
        clearTimeout(this._searchDebounceTimer);
        this._searchDebounceTimer = setTimeout(() => {
          this.fetchAndRenderSuggestions(input.value.trim());
        }, 120);
      });

      input.addEventListener("focus", () => {
        updateClearBtn();
        input.select();
        this.fetchAndRenderSuggestions(input.value.trim());
      });

      input.addEventListener("blur", () => {
        setTimeout(() => {
          if (clearBtn && document.activeElement !== input) {
            clearBtn.style.display = "none";
          }
        }, 150);
      });

      input.addEventListener("keydown", e => {
        if (dropdown.style.display === "flex" && this._suggestions.length > 0) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            this._selectedSuggestionIndex =
              (this._selectedSuggestionIndex + 1) % this._suggestions.length;
            this.highlightSuggestion(this._selectedSuggestionIndex);
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            this._selectedSuggestionIndex =
              this._selectedSuggestionIndex <= 0
                ? this._suggestions.length - 1
                : this._selectedSuggestionIndex - 1;
            this.highlightSuggestion(this._selectedSuggestionIndex);
            return;
          }
          if (e.key === "Escape") {
            e.preventDefault();
            this.hideSuggestions();
            return;
          }
        }

        if (e.key === "Enter") {
          e.preventDefault();
          if (
            this._selectedSuggestionIndex >= 0 &&
            this._suggestions[this._selectedSuggestionIndex]
          ) {
            this.executeSuggestion(
              this._suggestions[this._selectedSuggestionIndex]
            );
          } else {
            this.navigate(input.value);
          }
          this.hideSuggestions();
          input.blur();
        }
      });

      document.addEventListener("mousedown", e => {
        if (!container.contains(e.target) && !dropdown.contains(e.target)) {
          this.hideSuggestions();
        }
      });
    },

    async fetchAndRenderSuggestions(query) {
      const dropdown = document.getElementById("hilal-search-dropdown");
      if (!dropdown) return;

      if (this._searchAbortController) {
        this._searchAbortController.abort();
      }
      this._searchAbortController = new AbortController();

      const items = [];
      const trimmed = (query || "").trim();

      if (trimmed) {
        // 1. Direct Search Query Item
        items.push({
          type: "search",
          label: trimmed,
          sub: "Search with Google",
          query: trimmed,
        });

        // 2. Direct Website URL (if looks like URL or domain)
        if (
          (trimmed.includes(".") && !trimmed.includes(" ")) ||
          trimmed.startsWith("http://") ||
          trimmed.startsWith("https://")
        ) {
          const directUrl = trimmed.startsWith("http")
            ? trimmed
            : `https://${trimmed}`;
          items.push({
            type: "url",
            label: directUrl,
            sub: "Visit website",
            url: directUrl,
          });
        }

        // 3. Open Tabs matching query
        const matchingTabs = this.getMatchingOpenTabs(trimmed);
        matchingTabs.forEach(t => items.push(t));

        // 4. Places History from SQLite database
        try {
          const placesHistory = await this.queryPlacesHistory(trimmed);
          placesHistory.forEach(h => items.push(h));
        } catch (e) {}

        // 5. Live Search Suggestions (Google/Firefox suggestions API)
        try {
          const webSuggestions = await this.fetchLiveSearchSuggestions(
            trimmed,
            this._searchAbortController.signal
          );
          webSuggestions.forEach(s => items.push(s));
        } catch (e) {}
      } else {
        // When input is blank, suggest top open tabs
        const tabs = Array.from(window.gBrowser?.tabs || [])
          .filter(t => !t.hidden)
          .slice(0, 4);
        tabs.forEach(tab => {
          items.push({
            type: "tab",
            label: tab.label || "Tab",
            sub: tab.linkedBrowser?.currentURI?.spec || "",
            tab,
          });
        });
      }

      this._suggestions = items;
      this._selectedSuggestionIndex = -1;

      if (items.length === 0) {
        this.hideSuggestions();
        return;
      }

      this.renderSuggestionsDropdown(items);
    },

    renderSuggestionsDropdown(items) {
      const dropdown = document.getElementById("hilal-search-dropdown");
      if (!dropdown) return;
      dropdown.replaceChildren();

      const header = document.createElement("div");
      header.className = "hilal-search-header";
      header.textContent = "Results";
      dropdown.appendChild(header);

      const list = document.createElement("div");
      list.className = "hilal-search-list";

      items.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "hilal-search-item";
        row.dataset.index = index;

        // Icon container
        const iconDiv = document.createElement("div");
        iconDiv.className = "hilal-search-item-icon";
        if (item.type === "search" || item.type === "suggestion") {
          iconDiv.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>';
        } else if (item.type === "url") {
          iconDiv.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
        } else if (item.type === "tab") {
          iconDiv.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>';
        } else if (item.type === "history") {
          iconDiv.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';
        }
        row.appendChild(iconDiv);

        // Content
        const contentDiv = document.createElement("div");
        contentDiv.className = "hilal-search-item-content";

        const labelSpan = document.createElement("span");
        labelSpan.className = "hilal-search-item-label";
        labelSpan.textContent = item.label;
        contentDiv.appendChild(labelSpan);

        const subSpan = document.createElement("span");
        subSpan.className = "hilal-search-item-sub";
        subSpan.textContent = item.sub;
        contentDiv.appendChild(subSpan);

        row.appendChild(contentDiv);

        // Trailing chip
        if (item.type === "tab") {
          const trail = document.createElement("span");
          trail.className = "hilal-search-item-trailing";
          trail.textContent = "SWITCH TO TAB";
          row.appendChild(trail);
        } else if (item.type === "search" || item.type === "suggestion") {
          const trail = document.createElement("span");
          trail.className = "hilal-search-item-trailing-icon";
          trail.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 19h14V5H5v14zm10-10l-6 6-1.41-1.41L12.17 9H8V7h8v8h-2v-4.17z"/></svg>';
          row.appendChild(trail);
        }

        row.addEventListener("mouseenter", () => {
          this._selectedSuggestionIndex = index;
          this.highlightSuggestion(index);
        });

        row.addEventListener("click", () => {
          this.executeSuggestion(item);
          this.hideSuggestions();
          const input = document.getElementById("hilal-url-input");
          if (input) input.blur();
        });

        list.appendChild(row);
      });

      dropdown.appendChild(list);
      dropdown.style.display = "flex";
    },

    highlightSuggestion(index) {
      const dropdown = document.getElementById("hilal-search-dropdown");
      if (!dropdown) return;
      const items = dropdown.querySelectorAll(".hilal-search-item");
      items.forEach((item, i) => {
        item.classList.toggle("selected", i === index);
        if (i === index) {
          item.scrollIntoView({ block: "nearest" });
        }
      });
    },

    executeSuggestion(item) {
      if (!item) return;
      if (item.type === "tab" && item.tab) {
        window.gBrowser.selectedTab = item.tab;
      } else if (item.type === "url" || item.type === "history") {
        this.navigate(item.url);
      } else if (item.type === "search" || item.type === "suggestion") {
        this.navigate(item.query || item.label);
      }
    },

    hideSuggestions() {
      const dropdown = document.getElementById("hilal-search-dropdown");
      if (dropdown) {
        dropdown.style.display = "none";
      }
      this._suggestions = [];
      this._selectedSuggestionIndex = -1;
    },

    getMatchingOpenTabs(query) {
      if (!window.gBrowser || !window.gBrowser.tabs) return [];
      const term = query.toLowerCase();
      const results = [];
      for (const tab of window.gBrowser.tabs) {
        if (tab.hidden) continue;
        const title = tab.label || tab.getAttribute("label") || "";
        const uri = tab.linkedBrowser?.currentURI?.spec || "";
        if (
          title.toLowerCase().includes(term) ||
          uri.toLowerCase().includes(term)
        ) {
          results.push({
            type: "tab",
            label: title,
            sub: uri,
            tab,
          });
          if (results.length >= 3) break;
        }
      }
      return results;
    },

    async queryPlacesHistory(query) {
      try {
        const { PlacesUtils } = ChromeUtils.importESModule(
          "resource://gre/modules/PlacesUtils.sys.mjs"
        );
        const db = await PlacesUtils.promiseLargeCacheDBConnection();
        if (!db) return [];

        const results = [];
        const term = `%${query}%`;
        await db.executeCached(
          `SELECT url, title FROM moz_places 
           WHERE (url LIKE :term OR title LIKE :term) AND hidden = 0 
           ORDER BY frecency DESC LIMIT 4`,
          { term },
          (row, cancel) => {
            try {
              const url = row.getResultByName("url");
              const title = row.getResultByName("title") || url;
              results.push({
                type: "history",
                label: title,
                sub: url,
                url,
              });
              if (results.length >= 4) cancel();
            } catch (e) {}
          }
        );
        return results;
      } catch (e) {
        return [];
      }
    },

    async fetchLiveSearchSuggestions(query, signal) {
      try {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { signal });
        if (!res.ok) return [];
        const data = await res.json();
        const queries = Array.isArray(data[1]) ? data[1] : [];
        return queries.slice(0, 3).map(q => ({
          type: "suggestion",
          label: q,
          sub: "Search suggestion",
          query: q,
        }));
      } catch (e) {
        return [];
      }
    },

    hookWorkspaces() {
      const sync = () => {
        const manager = window.gHilalWorkspaces;
        if (!manager) return;

        if (!this._workspacesHooked) {
          this._workspacesHooked = true;

          const origSwitchTo = manager.switchTo.bind(manager);
          manager.switchTo = id => {
            const ws = manager._workspaces?.find(w => w.id === id);
            if (ws?.color) {
              MaterialYouTheme.applyTheme(ws.color);
            }
            origSwitchTo(id);
            this.renderWorkspaces();
            this.renderTabs();
          };

          const origCreate = manager.create.bind(manager);
          manager.create = (...args) => {
            origCreate(...args);
            this.renderWorkspaces();
            this.renderTabs();
          };

          if (manager.remove) {
            const origRemove = manager.remove.bind(manager);
            manager.remove = (...args) => {
              origRemove(...args);
              this.renderWorkspaces();
              this.renderTabs();
            };
          }

          if (manager.rename) {
            const origRename = manager.rename.bind(manager);
            manager.rename = (...args) => {
              origRename(...args);
              this.renderWorkspaces();
              this.renderTabs();
            };
          }

          const origApply = manager._apply.bind(manager);
          manager._apply = (...args) => {
            origApply(...args);
            this.renderTabs();
          };
        }

        this.renderWorkspaces();
        this.renderTabs();
      };

      if (window.gHilalWorkspaces) {
        sync();
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.gHilalWorkspaces) {
            clearInterval(interval);
            sync();
          } else if (attempts > 30) {
            clearInterval(interval);
          }
        }, 100);
      }
    },

    renderWorkspaces() {
      const wsBar = document.getElementById("hilal-workspaces-bar");
      if (!wsBar) return;
      wsBar.replaceChildren();

      const manager = window.gHilalWorkspaces;
      let workspaces = manager?._workspaces;

      if (
        (!workspaces || workspaces.length === 0) &&
        typeof Services !== "undefined"
      ) {
        try {
          const raw = Services.prefs.getStringPref(
            "hilal.workspaces.data",
            "[]"
          );
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            workspaces = parsed;
          }
        } catch (e) {}
      }

      if (!workspaces || workspaces.length === 0) {
        workspaces = [
          {
            id: "default",
            name: "Personal",
            emoji: "\u{1F4BC}",
            color: "blue",
          },
        ];
      }

      const activeId =
        manager?._activeId ||
        (typeof Services !== "undefined"
          ? Services.prefs.getStringPref(
              "hilal.workspaces.active",
              workspaces[0].id
            )
          : workspaces[0].id);

      const activeWs = workspaces.find(w => w.id === activeId) || workspaces[0];
      if (activeWs?.color) {
        MaterialYouTheme.applyTheme(activeWs.color);
      }

      // In horizontal Chrome mode, render a compact active workspace pill to prevent topbar overflow
      if (this.tabMode === "horizontal") {
        const pill = document.createElement("button");
        pill.className = "hilal-ws-pill-btn";
        pill.id = "hilal-ws-dropdown-pill";
        pill.title = `Current Workspace: ${activeWs.name || activeWs.id} (Click to switch)`;
        pill.innerHTML = `
          <span class="hilal-ws-pill-emoji">${activeWs.emoji || "\u{1F4C1}"}</span>
          <span class="hilal-ws-pill-name">${activeWs.name || activeWs.id}</span>
          <svg class="hilal-ws-pill-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        `;
        pill.addEventListener("click", e => {
          e.stopPropagation();
          this.showWorkspacesDropdown(pill, workspaces, activeId);
        });
        pill.addEventListener("contextmenu", e => {
          e.preventDefault();
          if (manager && typeof manager._showRenameDialog === "function") {
            manager._showRenameDialog(activeWs);
          }
        });
        wsBar.appendChild(pill);
        return;
      }

      workspaces.forEach(ws => {
        const chip = document.createElement("button");
        chip.className =
          "hilal-ws-chip" + (ws.id === activeId ? " active" : "");
        chip.textContent = ws.emoji || "\u{1F5C2}";
        chip.title = `${ws.name || ws.id} (Right click to edit)`;
        chip.setAttribute("aria-label", ws.name || ws.id);
        chip.dataset.workspaceId = ws.id;

        chip.addEventListener("click", () => {
          if (ws.color) {
            MaterialYouTheme.applyTheme(ws.color);
          }
          if (manager && typeof manager.switchTo === "function") {
            manager.switchTo(ws.id);
          } else if (typeof Services !== "undefined") {
            Services.prefs.setStringPref("hilal.workspaces.active", ws.id);
          }
          this.renderWorkspaces();
          this.renderTabs();
        });

        chip.addEventListener("contextmenu", e => {
          e.preventDefault();
          if (manager && typeof manager._showRenameDialog === "function") {
            manager._showRenameDialog(ws);
          }
        });

        wsBar.appendChild(chip);
      });

      const addWsBtn = document.createElement("button");
      addWsBtn.className = "hilal-ws-chip hilal-ws-add";
      addWsBtn.title = "New Workspace";
      addWsBtn.textContent = "+";
      addWsBtn.addEventListener("click", () => {
        if (manager && typeof manager._showCreateDialog === "function") {
          manager._showCreateDialog();
        } else {
          const name = prompt("Enter Workspace Name:", "Work");
          if (name) {
            if (manager && typeof manager.create === "function") {
              manager.create(name);
            } else if (typeof Services !== "undefined") {
              const newId = "ws-" + Date.now();
              workspaces.push({
                id: newId,
                name,
                emoji: "\u{1F4C1}",
                color: "purple",
                containerId: 0,
              });
              Services.prefs.setStringPref(
                "hilal.workspaces.data",
                JSON.stringify(workspaces)
              );
              Services.prefs.setStringPref("hilal.workspaces.active", newId);
            }
            this.renderWorkspaces();
            this.renderTabs();
          }
        }
      });
      wsBar.appendChild(addWsBtn);
    },

    showWorkspacesDropdown(anchor, workspaces, activeId) {
      let menu = document.getElementById("hilal-workspaces-dropdown-menu");
      if (menu) {
        if (menu.style.display !== "none") {
          menu.style.display = "none";
          return;
        }
        menu.replaceChildren();
      } else {
        menu = document.createElement("div");
        menu.id = "hilal-workspaces-dropdown-menu";
        menu.className = "hilal-dropdown-menu hilal-ws-dropdown-menu";
        document.body.appendChild(menu);

        document.addEventListener("mousedown", e => {
          if (
            menu.style.display !== "none" &&
            !menu.contains(e.target) &&
            !anchor.contains(e.target)
          ) {
            menu.style.display = "none";
          }
        });
      }

      const manager = window.gHilalWorkspaces;

      // Header
      const header = document.createElement("div");
      header.className = "hilal-dropdown-header";
      header.textContent = "WORKSPACES";
      menu.appendChild(header);

      workspaces.forEach(ws => {
        const item = document.createElement("button");
        const isActive = ws.id === activeId;
        item.className = "hilal-dropdown-item" + (isActive ? " active" : "");
        item.innerHTML = `
          <span class="hilal-dropdown-icon">${ws.emoji || "\u{1F4C1}"}</span>
          <span class="hilal-dropdown-label">${ws.name || ws.id}</span>
          ${isActive ? '<span class="hilal-ws-check-indicator">✓</span>' : ""}
        `;

        item.addEventListener("click", () => {
          if (ws.color) {
            MaterialYouTheme.applyTheme(ws.color);
          }
          if (manager && typeof manager.switchTo === "function") {
            manager.switchTo(ws.id);
          } else if (typeof Services !== "undefined") {
            Services.prefs.setStringPref("hilal.workspaces.active", ws.id);
          }
          menu.style.display = "none";
          this.renderWorkspaces();
          this.renderTabs();
        });

        item.addEventListener("contextmenu", e => {
          e.preventDefault();
          menu.style.display = "none";
          if (manager && typeof manager._showRenameDialog === "function") {
            manager._showRenameDialog(ws);
          }
        });

        menu.appendChild(item);
      });

      const sep = document.createElement("div");
      sep.className = "hilal-dropdown-divider";
      menu.appendChild(sep);

      const addBtn = document.createElement("button");
      addBtn.className = "hilal-dropdown-item hilal-dropdown-item-add";
      addBtn.innerHTML = `
        <span class="hilal-dropdown-icon">+</span>
        <span class="hilal-dropdown-label">New Workspace</span>
      `;
      addBtn.addEventListener("click", () => {
        menu.style.display = "none";
        if (manager && typeof manager._showCreateDialog === "function") {
          manager._showCreateDialog();
        } else {
          const name = prompt("Enter Workspace Name:", "Work");
          if (name) {
            if (manager && typeof manager.create === "function") {
              manager.create(name);
            } else if (typeof Services !== "undefined") {
              const newId = "ws-" + Date.now();
              workspaces.push({
                id: newId,
                name,
                emoji: "\u{1F4C1}",
                color: "purple",
                containerId: 0,
              });
              Services.prefs.setStringPref(
                "hilal.workspaces.data",
                JSON.stringify(workspaces)
              );
              Services.prefs.setStringPref("hilal.workspaces.active", newId);
            }
            this.renderWorkspaces();
            this.renderTabs();
          }
        }
      });
      menu.appendChild(addBtn);

      const rect = anchor.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.left = `${rect.left}px`;
      menu.style.display = "flex";
    },

    openThemePicker(anchor, event) {
      const existing = document.getElementById("hilal-theme-menu");
      if (existing) {
        existing.remove();
        return;
      }

      const menu = document.createElement("div");
      menu.id = "hilal-theme-menu";
      menu.className = "hilal-m3-menu";

      const title = document.createElement("div");
      title.className = "hilal-theme-menu-title";
      title.textContent = "Material You Color";
      menu.appendChild(title);

      const swatchesRow = document.createElement("div");
      swatchesRow.className = "hilal-theme-swatches-row";

      const colors = [
        { name: "blue", hex: "#37adff" },
        { name: "turquoise", hex: "#00c79a" },
        { name: "green", hex: "#51cd00" },
        { name: "yellow", hex: "#ffcb00" },
        { name: "orange", hex: "#ff9f00" },
        { name: "red", hex: "#ff613d" },
        { name: "pink", hex: "#ff4bda" },
        { name: "purple", hex: "#af51f5" },
      ];

      const currentActiveColor = MaterialYouTheme._currentColor || "blue";

      colors.forEach(({ name, hex }) => {
        const swatch = document.createElement("button");
        swatch.className = "hilal-theme-swatch";
        if (name === currentActiveColor) {
          swatch.classList.add("active");
        }
        swatch.style.backgroundColor = hex;
        swatch.title = name.charAt(0).toUpperCase() + name.slice(1);
        swatch.addEventListener("click", e => {
          e.stopPropagation();
          MaterialYouTheme.applyTheme(name);
          if (typeof Services !== "undefined") {
            try {
              const raw = Services.prefs.getStringPref(
                "hilal.workspaces.data",
                "[]"
              );
              const workspaces = JSON.parse(raw);
              const activeId = Services.prefs.getStringPref(
                "hilal.workspaces.active",
                workspaces[0]?.id
              );
              const activeWs = workspaces.find(w => w.id === activeId);
              if (activeWs) {
                activeWs.color = name;
                Services.prefs.setStringPref(
                  "hilal.workspaces.data",
                  JSON.stringify(workspaces)
                );
              }
            } catch (err) {}
          }
          this.renderWorkspaces();
          this.renderTabs();
          menu.remove();
        });
        swatchesRow.appendChild(swatch);
      });
      menu.appendChild(swatchesRow);

      if (window.gHilalBoosts?.togglePanel) {
        const boostsBtn = document.createElement("button");
        boostsBtn.className = "hilal-m3-menu-item";
        boostsBtn.textContent = "Customize Site Boosts";
        boostsBtn.addEventListener("click", e => {
          e.stopPropagation();
          menu.remove();
          window.gHilalBoosts.togglePanel(e);
        });
        menu.appendChild(boostsBtn);
      }

      const rect = anchor.getBoundingClientRect();
      menu.style.position = "fixed";
      menu.style.top = `${rect.bottom + 6}px`;
      menu.style.right = `${window.innerWidth - rect.right}px`;
      menu.style.display = "flex";
      document.body.appendChild(menu);

      const onDocClick = e => {
        if (!menu.contains(e.target) && !anchor.contains(e.target)) {
          menu.remove();
          document.removeEventListener("mousedown", onDocClick);
        }
      };
      setTimeout(() => document.addEventListener("mousedown", onDocClick), 0);
    },

    mountNativeToolbarElements() {
      // 1. Mount #page-action-buttons into #hilal-page-actions-slot
      const slot = document.getElementById("hilal-page-actions-slot");
      const nativePageActions = document.getElementById("page-action-buttons");
      if (slot && nativePageActions) {
        if (nativePageActions.parentNode !== slot) {
          slot.appendChild(nativePageActions);
        }

        if (!nativePageActions._hilalListenerAttached) {
          nativePageActions._hilalListenerAttached = true;
          nativePageActions.addEventListener("click", event => {
            const isLeftClick = event.button === 0;
            const btn = event.target.closest(
              ".urlbar-page-action, [role='button'], toolbarbutton"
            );
            if (!btn) return;

            if (
              btn.id === "star-button-box" ||
              btn.closest("#star-button-box")
            ) {
              event.preventDefault();
              event.stopPropagation();
              if (
                typeof PlacesCommandHook !== "undefined" &&
                PlacesCommandHook.bookmarkPage
              ) {
                PlacesCommandHook.bookmarkPage();
              } else if (
                typeof BookmarkingUI !== "undefined" &&
                BookmarkingUI.onStarCommand
              ) {
                BookmarkingUI.onStarCommand(event);
              }
            } else if (
              btn.id === "reader-mode-button" ||
              btn.closest("#reader-mode-button")
            ) {
              if (isLeftClick && typeof AboutReaderParent !== "undefined") {
                event.preventDefault();
                event.stopPropagation();
                AboutReaderParent.toggleReaderMode(event);
              }
            } else if (
              btn.id === "urlbar-zoom-button" ||
              btn.closest("#urlbar-zoom-button")
            ) {
              if (isLeftClick && typeof FullZoom !== "undefined") {
                event.preventDefault();
                event.stopPropagation();
                FullZoom.resetFromURLBar();
              }
            } else if (
              btn.id === "hilal-boosts-button" ||
              btn.closest("#hilal-boosts-button")
            ) {
              event.preventDefault();
              event.stopPropagation();
              window.gHilalBoosts?.togglePanel(event);
            }
          });
        }
      }

      // 2. Sync extensions into #hilal-extensions-slot
      this.syncExtensions();
    },

    syncExtensions() {
      const extSlot = document.getElementById("hilal-extensions-slot");
      if (!extSlot) return;

      const ueb = document.getElementById("unified-extensions-button");
      if (ueb) {
        if (ueb.parentNode !== extSlot) {
          extSlot.appendChild(ueb);
        }
        ueb.removeAttribute("hidden");
      }

      // Query pinned extensions in nav-bar
      if (typeof CustomizableUI !== "undefined") {
        try {
          const widgetIds = CustomizableUI.getWidgetIdsInArea("nav-bar");
          const validPinnedSet = new Set();

          for (const id of widgetIds) {
            // Only mount actual extension buttons; explicitly exclude customizableui-special (springs/separators)
            if (
              (id.includes("-browser-action") || id.includes("webext")) &&
              !id.includes("customizableui-special")
            ) {
              validPinnedSet.add(id);
              const node =
                document.getElementById(id) ||
                CustomizableUI.getWidgetNode(id, window)?.[1];
              if (
                node &&
                node.localName !== "toolbarspring" &&
                node.localName !== "toolbarseparator" &&
                node.parentNode !== extSlot
              ) {
                if (ueb) {
                  extSlot.insertBefore(node, ueb);
                } else {
                  extSlot.appendChild(node);
                }
              }
            }
          }

          // Clean up any nodes in extSlot that are no longer pinned extensions or are spacers
          for (const child of Array.from(extSlot.children)) {
            if (child === ueb) continue;
            if (
              !validPinnedSet.has(child.id) ||
              child.localName === "toolbarspring" ||
              child.localName === "toolbarseparator" ||
              child.id.includes("customizableui-special")
            ) {
              child.remove();
            }
          }
        } catch (e) {
          console.warn("Hilal: syncExtensions error", e);
        }
      }
    },

    navigate(rawUrl) {
      if (!rawUrl || !window.gBrowser) return;
      let url = rawUrl.trim();
      if (!url) return;

      if (
        !url.includes("://") &&
        !url.startsWith("about:") &&
        !url.startsWith("chrome:")
      ) {
        if (url.includes(".") && !url.includes(" ")) {
          url = "https://" + url;
        } else {
          url = "https://www.google.com/search?q=" + encodeURIComponent(url);
        }
      }

      try {
        const principal = Services.scriptSecurityManager.getSystemPrincipal();
        const uri = Services.io.newURI(url);
        if (typeof window.gBrowser.loadURI === "function") {
          window.gBrowser.loadURI(uri, { triggeringPrincipal: principal });
        } else if (window.gBrowser.selectedBrowser?.loadURI) {
          window.gBrowser.selectedBrowser.loadURI(uri, {
            triggeringPrincipal: principal,
          });
        }
      } catch (e) {
        console.error("Hilal navigation failed:", e);
      }
    },

    focusUrlInput(select = true) {
      const input = document.getElementById("hilal-url-input");
      if (input) {
        input.focus();
        if (select) {
          input.select();
        }
      }
    },

    openNewTab(url = "about:newtab") {
      if (!window.gBrowser) return;
      try {
        const principal = Services.scriptSecurityManager.getSystemPrincipal();
        const tab = window.gBrowser.addTab(url, {
          triggeringPrincipal: principal,
          inBackground: false,
        });

        const manager = window.gHilalWorkspaces;
        if (manager && manager._activeId && tab) {
          manager._setTabWorkspace(tab, manager._activeId);
        }

        window.gBrowser.selectedTab = tab;
        this.renderTabs();
        this.syncUrl();
        MaterialYouTheme.broadcastTheme();
        setTimeout(() => {
          this.focusUrlInput(false);
          MaterialYouTheme.broadcastTheme();
        }, 30);
      } catch (e) {
        console.error("Hilal openNewTab failed:", e);
      }
    },

    // Horizontal Tab DOM Creator
    createHorizontalTab(tab) {
      const htab = document.createElement("div");
      htab.className = "hilal-htab";
      htab._tab = tab;
      htab.tab = tab;
      htab.setAttribute("draggable", "true");

      // Favicon
      const iconDiv = document.createElement("div");
      iconDiv.className = "hilal-htab-icon";
      const iconImg = document.createElement("img");
      iconDiv.appendChild(iconImg);
      htab.appendChild(iconDiv);

      // Title
      const titleSpan = document.createElement("span");
      titleSpan.className = "hilal-htab-title";
      htab.appendChild(titleSpan);

      // Sound indicator
      const soundBtn = document.createElement("button");
      soundBtn.className = "hilal-htab-sound-btn";
      soundBtn.style.display = "none";
      soundBtn.addEventListener("click", e => {
        e.stopPropagation();
        tab.toggleMuteAudio?.();
        this.renderTabs();
      });
      htab.appendChild(soundBtn);

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.className = "hilal-htab-close-btn";
      closeBtn.textContent = "\u00D7";
      closeBtn.setAttribute("data-l10n-id", "tabbrowser-menuitem-close-tab");
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        window.gBrowser.removeTab(tab);
      });
      htab.appendChild(closeBtn);

      // Click to select
      htab.addEventListener("click", () => {
        window.gBrowser.selectedTab = tab;
      });

      // Context menu
      htab.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopPropagation();
        this.openTabContextMenu(tab, htab, e);
      });

      // Drag and drop horizontal reordering
      htab.addEventListener("dragstart", e => {
        this._draggedTab = tab;
        this._draggedHTab = htab;
        htab.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "text/plain",
          tab.getAttribute("data-tab-id") || "hilal-htab"
        );
      });

      htab.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!this._draggedTab || this._draggedTab === tab) return;

        const rect = htab.getBoundingClientRect();
        const mid = rect.left + rect.width / 2;
        if (e.clientX < mid) {
          htab.classList.add("drop-before");
          htab.classList.remove("drop-after");
        } else {
          htab.classList.add("drop-after");
          htab.classList.remove("drop-before");
        }
      });

      htab.addEventListener("dragleave", () => {
        htab.classList.remove("drop-before", "drop-after");
      });

      htab.addEventListener("drop", e => {
        e.preventDefault();
        const dropAfter = htab.classList.contains("drop-after");
        htab.classList.remove("drop-before", "drop-after");

        if (!this._draggedTab || this._draggedTab === tab) return;

        const allTabs = Array.from(window.gBrowser.tabs);
        const targetIdx = allTabs.indexOf(tab);
        const draggedIdx = allTabs.indexOf(this._draggedTab);

        if (targetIdx !== -1 && draggedIdx !== -1) {
          let finalIndex = targetIdx;
          if (dropAfter && draggedIdx > targetIdx) {
            finalIndex = targetIdx + 1;
          } else if (!dropAfter && draggedIdx < targetIdx) {
            finalIndex = targetIdx - 1;
          }
          window.gBrowser.moveTabTo(this._draggedTab, {
            tabIndex: Math.max(0, finalIndex),
          });
          this.renderTabs();
        }
      });

      htab.addEventListener("dragend", () => {
        htab.classList.remove("dragging", "drop-before", "drop-after");
        this._draggedTab = null;
        this._draggedHTab = null;
      });

      return htab;
    },

    updateHorizontalTabContent(htab, tab) {
      const iconImg = htab.querySelector(".hilal-htab-icon img");
      if (iconImg) {
        const favSrc = tab.image || tab.getAttribute("image");
        const targetSrc =
          favSrc &&
          !favSrc.startsWith("chrome://browser/skin/tabbrowser/loading")
            ? favSrc
            : "chrome://global/skin/icons/defaultFavicon.svg";
        if (iconImg.src !== targetSrc) {
          iconImg.src = targetSrc;
        }
      }

      const titleSpan = htab.querySelector(".hilal-htab-title");
      if (titleSpan) {
        const newTitle = tab.label || tab.getAttribute("label") || "New Tab";
        if (titleSpan.textContent !== newTitle) {
          titleSpan.textContent = newTitle;
        }
      }

      const soundBtn = htab.querySelector(".hilal-htab-sound-btn");
      if (soundBtn) {
        if (tab.soundPlaying || tab.muted) {
          soundBtn.style.display = "flex";
          soundBtn.title = tab.muted ? "Unmute Tab" : "Mute Tab";
          soundBtn.innerHTML = tab.muted
            ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        } else {
          soundBtn.style.display = "none";
        }
      }
    },

    // Vertical Tab DOM Creator
    createTabPill(tab) {
      const pill = document.createElement("div");
      pill.className = "hilal-tab-pill";
      pill._tab = tab;
      pill.tab = tab;
      pill.setAttribute("draggable", "true");

      // Favicon container
      const iconDiv = document.createElement("div");
      iconDiv.className = "hilal-tab-icon";
      const iconImg = document.createElement("img");
      iconDiv.appendChild(iconImg);
      pill.appendChild(iconDiv);

      // Title container
      const titleSpan = document.createElement("span");
      titleSpan.className = "hilal-tab-title";
      pill.appendChild(titleSpan);

      // Close button
      const closeBtn = document.createElement("button");
      closeBtn.className = "hilal-tab-close-btn";
      closeBtn.textContent = "\u00D7";
      closeBtn.setAttribute("data-l10n-id", "tabbrowser-menuitem-close-tab");
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        window.gBrowser.removeTab(tab);
      });
      pill.appendChild(closeBtn);

      // Tab click -> Select
      pill.addEventListener("click", () => {
        window.gBrowser.selectedTab = tab;
      });

      // Tab Context Menu
      pill.addEventListener("contextmenu", e => {
        e.preventDefault();
        e.stopPropagation();
        this.openTabContextMenu(tab, pill, e);
      });

      // Drag and Drop Vertical Reordering
      pill.addEventListener("dragstart", e => {
        this._draggedTab = tab;
        this._draggedPill = pill;
        pill.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
          "text/plain",
          tab.getAttribute("data-tab-id") || "hilal-tab"
        );
      });

      pill.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!this._draggedTab || this._draggedTab === tab) return;

        const rect = pill.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (e.clientY < mid) {
          pill.classList.add("drop-before");
          pill.classList.remove("drop-after");
        } else {
          pill.classList.add("drop-after");
          pill.classList.remove("drop-before");
        }
      });

      pill.addEventListener("dragleave", () => {
        pill.classList.remove("drop-before", "drop-after");
      });

      pill.addEventListener("drop", e => {
        e.preventDefault();
        const dropAfter = pill.classList.contains("drop-after");
        pill.classList.remove("drop-before", "drop-after");

        if (!this._draggedTab || this._draggedTab === tab) return;

        const allTabs = Array.from(window.gBrowser.tabs);
        const targetIdx = allTabs.indexOf(tab);
        const draggedIdx = allTabs.indexOf(this._draggedTab);

        if (targetIdx !== -1 && draggedIdx !== -1) {
          let finalIndex = targetIdx;
          if (dropAfter && draggedIdx > targetIdx) {
            finalIndex = targetIdx + 1;
          } else if (!dropAfter && draggedIdx < targetIdx) {
            finalIndex = targetIdx - 1;
          }
          window.gBrowser.moveTabTo(this._draggedTab, {
            tabIndex: Math.max(0, finalIndex),
          });
          this.renderTabs();
        }
      });

      pill.addEventListener("dragend", () => {
        pill.classList.remove("dragging", "drop-before", "drop-after");
        this._draggedTab = null;
        this._draggedPill = null;
      });

      return pill;
    },

    updateTabPillContent(pill, tab) {
      const iconImg = pill.querySelector(".hilal-tab-icon img");
      if (iconImg) {
        const favSrc = tab.image || tab.getAttribute("image");
        const targetSrc =
          favSrc &&
          !favSrc.startsWith("chrome://browser/skin/tabbrowser/loading")
            ? favSrc
            : "chrome://global/skin/icons/defaultFavicon.svg";
        if (iconImg.src !== targetSrc) {
          iconImg.src = targetSrc;
        }
      }

      const titleSpan = pill.querySelector(".hilal-tab-title");
      if (titleSpan) {
        const newTitle = tab.label || tab.getAttribute("label") || "New Tab";
        if (titleSpan.textContent !== newTitle) {
          titleSpan.textContent = newTitle;
        }
      }
    },

    openTabContextMenu(tab, triggerEl, event) {
      this.ensureTabContextMenuReady();
      const contextMenu = document.getElementById("tabContextMenu");
      if (contextMenu) {
        triggerEl.tab = tab;
        if (typeof TabContextMenu !== "undefined") {
          TabContextMenu.contextTab = tab;
          TabContextMenu.contextTabs = [tab];
          if (typeof TabContextMenu.updateContextMenu === "function") {
            TabContextMenu.updateContextMenu(contextMenu);
          }
        }
        contextMenu.triggerNode = tab;
        if (typeof contextMenu.openPopup === "function") {
          contextMenu.openPopup(
            triggerEl,
            "after_start",
            0,
            0,
            true,
            false,
            event
          );
        }
      }
    },

    renderTabs() {
      if (!window.gBrowser) return;

      const allTabs = Array.from(window.gBrowser.tabs || []);
      const manager = window.gHilalWorkspaces;
      const activeWsId = manager?._activeId;

      // Filter tabs by active workspace
      const visibleTabs = allTabs.filter(tab => {
        if (tab.hidden) return false;
        if (manager && activeWsId) {
          const tabWs =
            typeof manager._getTabWorkspace === "function"
              ? manager._getTabWorkspace(tab)
              : tab.getAttribute("hilal-workspace");
          if (tabWs && tabWs !== activeWsId && !tab.pinned) {
            return false;
          }
        }
        return true;
      });

      // 1. Render Vertical Tab List (if vertical or dual mode)
      if (this.tabMode === "vertical" || this.tabMode === "dual") {
        this.renderVerticalTabs(visibleTabs);
      }

      // 2. Render Horizontal Tab List (if dual or horizontal mode)
      if (this.tabMode === "dual" || this.tabMode === "horizontal") {
        this.renderHorizontalTabs(visibleTabs);
      }

      this.updateNavButtons();
    },

    renderVerticalTabs(visibleTabs) {
      const container = document.getElementById("hilal-tab-list");
      if (!container) return;

      const existingPills = new Map();
      for (const child of Array.from(container.children)) {
        if (child._tab) {
          existingPills.set(child._tab, child);
        }
      }

      for (const [tab, pill] of existingPills.entries()) {
        if (!visibleTabs.includes(tab)) {
          pill.remove();
          existingPills.delete(tab);
        }
      }

      visibleTabs.forEach((tab, index) => {
        let pill = existingPills.get(tab);
        const isSelected = tab.selected || tab === window.gBrowser.selectedTab;

        if (!pill) {
          pill = this.createTabPill(tab);
          existingPills.set(tab, pill);
          pill.classList.add("hilal-tab-entering");
          pill.addEventListener(
            "animationend",
            () => {
              pill.classList.remove("hilal-tab-entering");
            },
            { once: true }
          );
        }

        pill.classList.toggle("active", isSelected);
        this.updateTabPillContent(pill, tab);

        const currentChild = container.children[index];
        if (currentChild !== pill) {
          container.insertBefore(pill, currentChild || null);
        }
      });
    },

    renderHorizontalTabs(visibleTabs) {
      const container = document.getElementById("hilal-horizontal-tab-list");
      if (!container) return;

      const existingTabs = new Map();
      for (const child of Array.from(container.children)) {
        if (child._tab) {
          existingTabs.set(child._tab, child);
        }
      }

      for (const [tab, htab] of existingTabs.entries()) {
        if (!visibleTabs.includes(tab)) {
          htab.remove();
          existingTabs.delete(tab);
        }
      }

      visibleTabs.forEach((tab, index) => {
        let htab = existingTabs.get(tab);
        const isSelected = tab.selected || tab === window.gBrowser.selectedTab;

        if (!htab) {
          htab = this.createHorizontalTab(tab);
          existingTabs.set(tab, htab);
        }

        htab.classList.toggle("active", isSelected);
        this.updateHorizontalTabContent(htab, tab);

        const currentChild = container.children[index];
        if (currentChild !== htab) {
          container.insertBefore(htab, currentChild || null);
        }
      });
    },

    syncUrl() {
      const input = document.getElementById("hilal-url-input");
      const clearBtn = document.getElementById("hilal-url-clear-btn");
      const copyBtn = document.getElementById("hilal-url-copy-btn");
      const themeBtn = document.getElementById("hilal-url-theme-btn");
      const secIcon = document.getElementById("hilal-url-security-icon");
      if (!input || !window.gBrowser) return;

      const currentUri = window.gBrowser.currentURI?.spec || "";
      const isRealWebPage =
        currentUri.startsWith("http://") || currentUri.startsWith("https://");

      if (document.activeElement !== input) {
        if (
          currentUri === "about:blank" ||
          currentUri === "about:newtab" ||
          currentUri === "about:home" ||
          currentUri.startsWith("chrome://browser/content/hilal/newtab/")
        ) {
          input.value = "";
        } else {
          input.value = currentUri;
        }
        if (clearBtn) {
          clearBtn.style.display = "none";
        }
        if (copyBtn) {
          copyBtn.style.display =
            input.value.trim().length > 0 && isRealWebPage
              ? "inline-flex"
              : "none";
        }
        if (themeBtn) {
          themeBtn.style.display =
            input.value.trim().length > 0 && isRealWebPage
              ? "inline-flex"
              : "none";
        }
      } else {
        if (clearBtn) {
          clearBtn.style.display =
            input.value.trim().length > 0 ? "inline-flex" : "none";
        }
      }

      // Ensure star button is unhidden on web pages
      const starBtn = document.getElementById("star-button-box");
      if (starBtn) {
        if (isRealWebPage) {
          starBtn.removeAttribute("hidden");
        } else if (currentUri.startsWith("about:")) {
          starBtn.setAttribute("hidden", "true");
        }
      }

      if (secIcon && window.gBrowser.currentURI) {
        const scheme = window.gBrowser.currentURI.scheme;
        if (scheme === "https") {
          secIcon.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>';
        } else {
          secIcon.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>';
        }
      }

      this.mountNativeToolbarElements();
      this.updateNavButtons();
    },

    updateNavButtons() {
      const backBtn = document.getElementById("hilal-back-btn");
      const forwardBtn = document.getElementById("hilal-forward-btn");
      if (backBtn && window.gBrowser) {
        const canBack =
          window.gBrowser.canGoBack ??
          window.gBrowser.webNavigation?.canGoBack ??
          false;
        backBtn.disabled = !canBack;
      }
      if (forwardBtn && window.gBrowser) {
        const canForward =
          window.gBrowser.canGoForward ??
          window.gBrowser.webNavigation?.canGoForward ??
          false;
        forwardBtn.disabled = !canForward;
      }
    },

    bindBrowserEvents() {
      if (!window.gBrowser) return;

      const tc = window.gBrowser.tabContainer;
      if (tc) {
        tc.addEventListener("TabOpen", event => {
          this.renderTabs();
          const tab = event.target;
          if (tab === window.gBrowser.selectedTab) {
            setTimeout(() => {
              const spec = window.gBrowser.currentURI?.spec || "";
              if (
                !spec ||
                spec === "about:blank" ||
                spec === "about:newtab" ||
                spec === "about:home" ||
                spec.startsWith("chrome://browser/content/hilal/newtab/")
              ) {
                this.focusUrlInput(false);
              }
            }, 30);
          }
        });
        tc.addEventListener("TabClose", () => this.renderTabs());
        tc.addEventListener("TabSelect", () => {
          this.renderTabs();
          this.syncUrl();
          const spec = window.gBrowser.currentURI?.spec || "";
          if (
            !spec ||
            spec === "about:blank" ||
            spec === "about:newtab" ||
            spec === "about:home" ||
            spec.startsWith("chrome://browser/content/hilal/newtab/")
          ) {
            setTimeout(() => this.focusUrlInput(false), 20);
          }
        });
        tc.addEventListener("TabAttrModified", () => this.renderTabs());
        tc.addEventListener("TabHide", () => this.renderTabs());
        tc.addEventListener("TabShow", () => this.renderTabs());
      }

      window.gBrowser.addProgressListener({
        onLocationChange: aBrowser => {
          if (aBrowser === window.gBrowser.selectedBrowser) {
            this.syncUrl();
            this.renderTabs();
          }
        },
      });

      // Keyboard shortcuts
      window.addEventListener("keydown", e => {
        const isMac =
          Services?.appinfo?.OS === "Darwin" ||
          (typeof navigator !== "undefined" &&
            (navigator.platform?.includes("Mac") ||
              navigator.userAgent?.includes("Mac")));
        const isAccel = isMac ? e.metaKey : e.ctrlKey;

        if (isAccel && e.key.toLowerCase() === "l") {
          e.preventDefault();
          const input = document.getElementById("hilal-url-input");
          if (input) {
            input.focus();
            input.select();
          }
        } else if (isAccel && e.key.toLowerCase() === "t") {
          e.preventDefault();
          this.openNewTab();
        } else if (isAccel && e.key.toLowerCase() === "w") {
          e.preventDefault();
          if (window.gBrowser?.selectedTab) {
            window.gBrowser.removeTab(window.gBrowser.selectedTab);
          }
        } else if (isAccel && e.key.toLowerCase() === "r") {
          e.preventDefault();
          if (window.gBrowser) {
            window.gBrowser.reload();
          }
        }
      });

      try {
        const newTabChannel = new BroadcastChannel("hilal-newtab-channel");
        newTabChannel.onmessage = event => {
          if (
            event.data &&
            event.data.action === "navigate" &&
            event.data.url
          ) {
            try {
              if (window.gBrowser) {
                window.gBrowser.loadURI(Services.io.newURI(event.data.url), {
                  triggeringPrincipal:
                    Services.scriptSecurityManager.getSystemPrincipal(),
                });
              }
            } catch (err) {
              console.error("Hilal newtab navigate error:", err);
            }
          }
        };
      } catch (err) {}
    },
  };

  function startShell() {
    if (
      typeof window.gBrowser !== "undefined" &&
      window.gBrowser.tabContainer
    ) {
      HilalShell.init();
    } else {
      window.addEventListener("load", () => HilalShell.init(), { once: true });
    }
  }

  if (document.readyState === "complete") {
    startShell();
  } else {
    window.addEventListener("DOMContentLoaded", startShell, { once: true });
  }

  HilalShell.getActiveThemeData = () => MaterialYouTheme.getThemeData();
  window.gHilalShell = HilalShell;
})();
