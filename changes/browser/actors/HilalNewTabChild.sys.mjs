/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Connects Hilal's new tab page to the browser window that shows it: the
// page gets that window's theme and sends typed input back to its shell.
export class HilalNewTabChild extends JSWindowActorChild {
  #onSharedDataChange = event => {
    if (event.changedKeys.includes("hilal:activeTheme")) {
      this.#sendTheme();
    }
  };

  actorCreated() {
    Services.cpmm.sharedData.addEventListener("change", this.#onSharedDataChange);
  }

  didDestroy() {
    Services.cpmm.sharedData.removeEventListener(
      "change",
      this.#onSharedDataChange
    );
  }

  handleEvent(event) {
    switch (event.type) {
      case "HilalNewTab:GetTheme":
        this.#sendTheme();
        break;
      case "HilalNewTab:GetSiteIcons":
        this.#sendSiteIcons(event.detail);
        break;
      case "HilalNewTab:Navigate":
        if (typeof event.detail == "string" && event.detail.trim()) {
          this.sendAsyncMessage("Navigate", { input: event.detail });
        }
        break;
    }
  }

  async #sendSiteIcons(urls) {
    if (!Array.isArray(urls)) {
      return;
    }
    const icons = await this.sendQuery("GetSiteIcons", {
      urls: urls.filter(url => typeof url == "string"),
    });
    const win = this.contentWindow;
    win?.dispatchEvent(
      new win.CustomEvent("HilalNewTab:SiteIcons", {
        detail: Cu.cloneInto(icons, win),
      })
    );
  }

  async #sendTheme() {
    const theme = await this.sendQuery("GetTheme");
    const win = this.contentWindow;
    if (theme && win) {
      win.dispatchEvent(
        new win.CustomEvent("HilalNewTab:Theme", {
          detail: Cu.cloneInto(theme, win),
        })
      );
    }
  }
}
