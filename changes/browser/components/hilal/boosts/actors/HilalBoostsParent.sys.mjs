// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

const lazy = {};

ChromeUtils.defineESModuleGetters(lazy, {
  gHilalBoostsManager: "resource:///modules/hilal/boosts/HilalBoostsManager.sys.mjs",
});

export class HilalBoostsParent extends JSWindowActorParent {
  #zapBar = null;

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
  }

  /**
   * Called when the actor is destroyed. Cleans up the observer.
   */
  didDestroy() {
    HilalBoostsParent.OBSERVERS.forEach(observe => {
      Services.obs.removeObserver(this._observe, observe);
    });
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
      case "HilalBoost:GetBoostForDomain": {
        const domain = message.data;
        const embedder = this.browsingContext.top.embedderElement;

        if (!embedder || !domain) {
          break;
        }

        const exists = lazy.gHilalBoostsManager.registeredBoostForDomain(domain);
        if (!exists) {
          break;
        }

        const boost = lazy.gHilalBoostsManager.loadActiveBoostFromStore(domain);
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

        const styleData =
          await lazy.gHilalBoostsManager.getStyleSheetForBoost(domain);

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
