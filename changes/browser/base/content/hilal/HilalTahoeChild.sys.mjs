/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class HilalTahoeChild extends JSWindowActorChild {
  constructor() {
    super();
    try {
      Services.cpmm?.sharedData?.addEventListener("change", this);
    } catch (e) {}
  }

  didDestroy() {
    try {
      Services.cpmm?.sharedData?.removeEventListener("change", this);
    } catch (e) {}
  }

  handleEvent(aEvent) {
    if (aEvent.type === "change") {
      if (aEvent.changedKeys?.includes("hilal:activeTheme")) {
        try {
          const data = Services.cpmm.sharedData.get("hilal:activeTheme");
          if (data) {
            this.applyNewTabTheme(data);
          }
        } catch (e) {}
      }
      return;
    }

    if (this.browsingContext.parent !== null) {
      return;
    }

    if (aEvent.type === "scroll") {
      this.scheduleScrollStateUpdate();
      return;
    }

    if (
      aEvent.type === "DOMDocElementInserted" ||
      aEvent.type === "DOMContentLoaded" ||
      aEvent.type === "pageshow"
    ) {
      this.updatePageBackground();
      this.scheduleScrollStateUpdate();
      this.syncNewTabTheme();
    }
  }

  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:UpdateOffsets") {
      this.updatePageBackground();
      this.scheduleScrollStateUpdate();
      return;
    }
    if (aMessage.name === "HilalTahoe:SetNewTabTheme") {
      if (aMessage.data) {
        this.applyNewTabTheme(aMessage.data);
      }
      return;
    }
  }

  syncNewTabTheme() {
    let doc = this.document;
    if (!doc || !doc.documentElement) return;
    let uri = doc.documentURI || "";
    if (!uri.includes("newtab") && !uri.includes("about:home")) return;

    try {
      let cached = Services.cpmm?.sharedData?.get("hilal:activeTheme");
      if (cached) {
        this.applyNewTabTheme(cached);
      }
    } catch (e) {}

    try {
      this.sendAsyncMessage("HilalTahoe:RequestNewTabTheme", {});
    } catch (e) {}
  }

  applyNewTabTheme(theme) {
    let doc = this.document;
    if (!doc || !doc.documentElement) return;
    let uri = doc.documentURI || "";
    if (!uri.includes("newtab") && !uri.includes("about:home")) return;

    const root = doc.documentElement;
    if (theme.accent) {
      root.style.setProperty("--hilal-accent", theme.accent);
      root.style.setProperty(
        "--md-sys-color-primary",
        theme.primary || theme.accent
      );
    }
    if (theme.bg) {
      root.style.setProperty("--hilal-bg", theme.bg);
      root.style.setProperty("--md-sys-color-surface", theme.bg);
    }
    if (theme.surface) {
      root.style.setProperty("--hilal-surface", theme.surface);
      root.style.setProperty(
        "--md-sys-color-surface-container-high",
        theme.surface
      );
    }
    if (theme.surfaceHover) {
      root.style.setProperty("--hilal-surface-hover", theme.surfaceHover);
      root.style.setProperty(
        "--md-sys-color-surface-container-highest",
        theme.surfaceHover
      );
    }
    if (theme.border) {
      root.style.setProperty("--hilal-border", theme.border);
      root.style.setProperty("--md-sys-color-outline-variant", theme.border);
    }
    if (theme.text) root.style.setProperty("--hilal-text", theme.text);
    if (theme.textMuted)
      root.style.setProperty("--hilal-text-muted", theme.textMuted);

    try {
      if (this.contentWindow) {
        this.contentWindow.dispatchEvent(
          new this.contentWindow.CustomEvent("hilal-theme-applied", {
            detail: theme,
          })
        );
      }
    } catch (e) {}
  }

  async updateOffsets() {
    this.updatePageBackground();
    this.scheduleScrollStateUpdate();
  }

  updatePageBackground() {
    let doc = this.document;
    let docEl = doc?.documentElement;
    if (!docEl) {
      return;
    }

    let color = this.readVisibleBackground(docEl);
    this.sendAsyncMessage("HilalTahoe:PageStyle", {
      backgroundColor: color,
    });
  }

  scheduleScrollStateUpdate() {
    if (this._scrollStateFrame) {
      return;
    }
    this._scrollStateFrame = this.contentWindow.requestAnimationFrame(() => {
      this._scrollStateFrame = 0;
      this.updateScrollState();
    });
  }

  updateScrollState() {
    let win = this.contentWindow;
    this.sendAsyncMessage("HilalTahoe:ScrollState", {
      scrollX: win.scrollX,
      scrollY: win.scrollY,
      innerWidth: win.innerWidth,
      innerHeight: win.innerHeight,
      fullZoom: win.browsingContext.fullZoom,
      textZoom: win.browsingContext.textZoom,
    });
  }

  readVisibleBackground(docEl) {
    let win = this.contentWindow;
    let body = this.document.body;
    for (let element of [body, docEl]) {
      if (!element) {
        continue;
      }
      let color = win.getComputedStyle(element).backgroundColor;
      if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
        return color;
      }
    }
    return "";
  }
}
