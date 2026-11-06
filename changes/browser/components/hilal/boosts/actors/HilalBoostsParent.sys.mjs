// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  AppConstants: "resource://gre/modules/AppConstants.sys.mjs",
  gHilalBoostsManager: "resource:///modules/hilal/boosts/HilalBoostsManager.sys.mjs",
});

const AUTO_MODE_PREF = "hilal.boosts.auto.mode";
const AUTO_EXCLUDED_PREF = "hilal.boosts.auto.excluded";

// Whether a domain's pages are dark on their own (a dark color scheme or a
// dark page), learned when a page finishes loading without an automatic
// boost on it. "Compatible" automatic boosts skip such sites, and only light
// pages are turned dark. Unknown domains are left as they are until known.
const ownThemeDomains = new Map();

export class HilalBoostsParent extends JSWindowActorParent {
  #zapBar = null;

  /**
   * The boost Hilal applies on its own to a site the user has not boosted,
   * or null. It follows the window's accent color, and turns light pages dark
   * while the browser is in dark mode.
   *
   * @param {string} domain
   * @param {Window} win - The browser window showing the page.
   * @returns {object|null}
   */
  static automaticBoost(domain, win) {
    const mode = Services.prefs.getStringPref(AUTO_MODE_PREF, "off");
    if (mode != "all" && mode != "compatible") {
      return null;
    }
    const excluded = Services.prefs
      .getStringPref(AUTO_EXCLUDED_PREF, "")
      .split(",")
      .map(d => d.trim())
      .filter(Boolean);
    if (excluded.some(d => domain == d || domain.endsWith("." + d))) {
      return null;
    }
    if (mode == "compatible" && ownThemeDomains.get(domain)) {
      return null;
    }
    const entry = lazy.gHilalBoostsManager.getEmptyBoostEntry();
    Object.assign(entry.boostData, {
      boostName: "Automatic",
      enableColorBoost: true,
      autoTheme: true,
      smartInvert:
        Services.prefs.getBoolPref("hilal.boosts.auto.darken", true) &&
        !!win?.MaterialYouTheme?.isDarkMode?.() &&
        ownThemeDomains.get(domain) === false,
      changeWasMade: true,
    });
    return { id: "automatic", domain, automatic: true, boostEntry: entry };
  }

  static OBSERVERS = [
    "hilal-boosts-update",
    "hilal-accent-changed",
    "hilal-boosts-disable-zap",
    "hilal-boosts-disable-picker",
  ];

  // Topics the content child is allowed to forward to the observer service.
  // Anything outside this set is rejected to prevent content-triggered
  // notifications on unrelated chrome observers.
  static ALLOWED_NOTIFY_TOPICS = new Set([
    "zap-state-update",
    "zap-list-update",
    "selector-picker-state-update",
    "selector-picker-picked",
  ]);

  /**
   * Creates a new HilalBoostsParent actor instance and sets up an observer
   * for boost update notifications.
   */
  constructor() {
    super();

    this._observe = this.observe.bind(this);
    HilalBoostsParent.OBSERVERS.forEach(observe => {
      Services.obs.addObserver(this._observe, observe);
    });
    Services.prefs.addObserver("hilal.boosts.auto.", this._observe);
  }

  /**
   * Called when the actor is destroyed. Cleans up the observer.
   */
  didDestroy() {
    HilalBoostsParent.OBSERVERS.forEach(observe => {
      Services.obs.removeObserver(this._observe, observe);
    });
    Services.prefs.removeObserver("hilal.boosts.auto.", this._observe);
    this.#setZapBarVisible(false);
  }

  /**
   * Shows or removes the zap bar in the chrome of the zapped browser.
   *
   * @param {boolean} visible - Whether the bar should be shown.
   */
  #setZapBarVisible(visible) {
    if (!visible) {
      this.#zapBar?.remove();
      this.#zapBar = null;
      return;
    }
    if (this.#zapBar) {
      return;
    }

    const browsingContext = this.browsingContext;
    const browser = browsingContext?.top.embedderElement;
    // Zap mode only runs on top-level documents.
    if (!browser || browsingContext.parent) {
      return;
    }
    const doc = browser.ownerDocument;
    // The element is defined by a module the browser window does not load
    // at startup; the bar upgrades once the module has run.
    if (
      !doc.defaultView.customElements.get("hilal-zap-bar") &&
      !doc.getElementById("hilal-zap-bar-module")
    ) {
      const script = doc.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "script"
      );
      script.id = "hilal-zap-bar-module";
      script.type = "module";
      script.src = "chrome://browser/content/hilal/boosts/HilalZapBar.mjs";
      doc.head.appendChild(script);
    }
    const bar = doc.createElement("hilal-zap-bar");
    bar.browser = browser;
    bar.actor = this;
    browser.parentNode.insertAdjacentElement("afterend", bar);
    this.#zapBar = bar;
  }

  /**
   * Observer callback that handles boost update notifications.
   * Sends a message to child actors when boosts are updated.
   *
   * @param {object} subject - The subject of the notification.
   * @param {string} topic - The topic of the notification.
   */
  observe(subject, topic) {
    switch (topic) {
      case "hilal-boosts-update":
      case "hilal-accent-changed":
      case "nsPref:changed":
        this.sendAsyncMessage("HilalBoost:BoostDataUpdated", {
          unloadStyles: true,
        });
        break;
      case "hilal-boosts-disable-zap":
        this.sendAsyncMessage("HilalBoost:DisableZapMode");
        break;
      case "hilal-boosts-disable-picker":
        this.sendAsyncMessage("HilalBoost:DisablePickerMode");
        break;
    }
  }

  /**
   * Updates the boost size override on webpage
   *
   * @param {number} sizeOverride - The size to apply on the webpage as a override
   * @param {boolean} disable - Whether to disable the override (sets override to the default 1)
   */
  updateBoostSizeOverride(sizeOverride, disable = false) {
    if (
      sizeOverride &&
      isFinite(sizeOverride) &&
      (sizeOverride !== 1 || disable)
    ) {
      const fullZoom = this.browsingContext.topChromeWindow.FullZoom;
      fullZoom.setZoom(sizeOverride, this.browsingContext.top.embedderElement);
    }
  }

  /**
   * Handles messages received from child actors.
   * Retrieves boost data for a domain when requested.
   *
   * @param {object} message - The message object containing name and data.
   * @returns {Promise<object | null>} A promise that resolves to the boost data or null.
   */
  async receiveMessage(message) {
    switch (message.name) {
      case "HilalBoost:OpenInspector": {
        const { require } = ChromeUtils.importESModule(
          "resource://devtools/shared/loader/Loader.sys.mjs"
        );

        const { gDevTools } = require("devtools/client/framework/devtools");

        let win = Services.wm.getMostRecentWindow("navigator:browser");
        let tab = win.gBrowser.selectedTab;

        let toolbox = gDevTools.getToolboxForTab(tab);

        if (toolbox) {
          await gDevTools.closeToolboxForTab(tab);
        } else {
          await gDevTools.showToolboxForTab(tab, "inspector");
        }
        break;
      }
      case "HilalBoost:Notify": {
        const { topic, msg } = message.data ?? {};
        if (!HilalBoostsParent.ALLOWED_NOTIFY_TOPICS.has(topic)) {
          console.warn(
            `[HilalBoostsParent]: Rejected notify for disallowed topic: ${topic}`
          );
          break;
        }
        Services.obs.notifyObservers(null, topic, msg);
        break;
      }
      case "HilalBoost:ZapSelector": {
        const data = message.data;

        if (!data.action) {
          break;
        }
        if (!data.selector) {
          break;
        }
        if (!data.domain) {
          break;
        }

        const mode = data.mode === "focus" ? "focus" : "zap";
        if (data.action == "add") {
          lazy.gHilalBoostsManager.addZapSelectorToActive(
            data.selector,
            data.domain,
            mode
          );
        } else if (data.action == "remove") {
          lazy.gHilalBoostsManager.removeZapSelectorToActive(
            data.selector,
            data.domain,
            mode
          );
        } else if (data.action == "clear") {
          const selectors = Array.isArray(data.selectors)
            ? data.selectors.filter(entry => typeof entry === "string")
            : null;
          lazy.gHilalBoostsManager.clearZapSelectorsForActive(
            data.domain,
            data.mode ? mode : null,
            selectors
          );
        }
        break;
      }
      case "HilalBoost:BoostAccent": {
        const color = message.data?.color;
        const browser = this.browsingContext.top.embedderElement;
        browser?.ownerDocument?.defaultView?.gHilalShell?.setBoostAccent?.(
          browser,
          /^#[0-9a-f]{6}$/i.test(color ?? "") ? color : null
        );
        break;
      }
      case "HilalBoost:GetBrowserAccent": {
        // The site's own color must not feed back into what it is told.
        const theme = this.browsingContext.topChromeWindow?.MaterialYouTheme;
        const siteColor = theme?._siteColor;
        if (theme) {
          theme._siteColor = null;
        }
        const accent = theme?.getThemeData()?.accent;
        if (theme) {
          theme._siteColor = siteColor;
        }
        return {
          version: lazy.AppConstants.MOZ_APP_VERSION_DISPLAY,
          accent: /^#[0-9a-f]{6}$/i.test(accent ?? "") ? accent : null,
        };
      }
      case "HilalBoost:SiteTheme": {
        const { domain, accent, ownTheme, boosted } = message.data ?? {};
        if (typeof domain != "string" || !domain) {
          break;
        }
        const hadOwnTheme = ownThemeDomains.get(domain);
        // A boosted page reports the boost's colors, not its own.
        if (!boosted) {
          ownThemeDomains.set(domain, !!ownTheme);
        }
        const browser = this.browsingContext.top.embedderElement;
        // A <browser>'s ownerGlobal is undefined from a window actor parent.
        const win = browser?.ownerDocument?.defaultView;
        if (browser && win?.gHilalShell?.setSiteAccent) {
          win.gHilalShell.setSiteAccent(
            browser,
            /^#[0-9a-f]{6}$/i.test(accent ?? "") ? accent : null
          );
        }
        // The first page of a site loads before Hilal knows whether it is
        // dark on its own; apply what follows from that now.
        if (
          !boosted &&
          hadOwnTheme !== !!ownTheme &&
          Services.prefs.getStringPref(AUTO_MODE_PREF, "off") != "off" &&
          !lazy.gHilalBoostsManager.registeredBoostForDomain(domain)
        ) {
          this.sendAsyncMessage("HilalBoost:BoostDataUpdated", {
            unloadStyles: true,
          });
        }
        break;
      }
      case "HilalBoost:GetBoostForDomain": {
        const domain = message.data;
        const embedder = this.browsingContext.top.embedderElement;

        if (!embedder || !domain) {
          break;
        }

        const win = this.browsingContext.topChromeWindow;
        const exists = lazy.gHilalBoostsManager.registeredBoostForDomain(domain);
        const boost = exists
          ? lazy.gHilalBoostsManager.loadActiveBoostFromStore(domain)
          : HilalBoostsParent.automaticBoost(domain, win);
        if (!boost) {
          break;
        }
        if (
          !lazy.gHilalBoostsManager.isBoostInEffect(
            boost.boostEntry.boostData,
            this.browsingContext.topChromeWindow
          )
        ) {
          break;
        }
        let workspaceGradient = [];
        if (boost.boostEntry.boostData.autoTheme) {
          // The child expects Zen's gradient format: RGB 0-255 channels.
          const accent =
            this.browsingContext.topChromeWindow.MaterialYouTheme?.getThemeData()
              ?.accent;
          const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(
            accent ?? ""
          );
          if (match) {
            workspaceGradient = [
              {
                c: match.slice(1).map(h => parseInt(h, 16)),
                isPrimary: true,
              },
            ];
          }
        }

        const styleData = boost.automatic
          ? null
          : await lazy.gHilalBoostsManager.getStyleSheetForBoost(domain);

        return {
          ...boost,
          workspaceGradient,
          styleSheet: styleData
            ? {
                uuid: styleData.uuid,
                uri: styleData.uri.spec,
              }
            : null,
        };
      }
      case "HilalBoost:UpdateBoostSize": {
        const { sizeOverride } = message.data;
        this.updateBoostSizeOverride(sizeOverride);
        break;
      }
      case "HilalBoost:ZapBarState": {
        this.#setZapBarVisible(!!message.data?.visible);
        break;
      }
      case "HilalBoost:ZapBarUpdate": {
        const entries = (message.data?.entries ?? [])
          .filter(entry => typeof entry?.selector === "string")
          .map(({ selector, count }) => ({
            selector,
            count: Number.isFinite(count) ? count : 0,
          }));
        if (this.#zapBar) {
          this.#zapBar.entries = entries;
        }
        break;
      }
      default: {
        console.warn(`[HilalBoostsParent]: Unknown message: ${message.name}`);
        break;
      }
    }

    return null;
  }
}
