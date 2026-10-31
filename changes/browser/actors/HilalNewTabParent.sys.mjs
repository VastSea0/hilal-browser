/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Firefox ships large icons for popular sites with its own new tab page.
const TIPPYTOP_PATH = "chrome://activity-stream/content/data/content/tippytop/";
let gTippyTopIcons = null;

function getTippyTopIcons() {
  gTippyTopIcons ??= fetch(`${TIPPYTOP_PATH}top_sites.json`)
    .then(response => response.json())
    .then(sites => {
      const icons = new Map();
      for (const site of sites) {
        for (const domain of site.domains) {
          icons.set(domain, TIPPYTOP_PATH + site.image_url);
        }
      }
      return icons;
    })
    .catch(() => new Map());
  return gTippyTopIcons;
}

export class HilalNewTabParent extends JSWindowActorParent {
  async receiveMessage(message) {
    const browser = this.browsingContext.top.embedderElement;
    const win = browser?.ownerDocument.defaultView;
    if (!win) {
      return null;
    }

    switch (message.name) {
      case "GetTheme":
        return win.MaterialYouTheme?.getThemeData() ?? null;
      case "GetSiteIcons": {
        const icons = await getTippyTopIcons();
        const result = {};
        for (const url of message.data.urls) {
          const host = URL.parse(url)?.hostname.replace(/^www\./, "");
          if (icons.has(host)) {
            result[url] = icons.get(host);
          }
        }
        return result;
      }
      case "Navigate":
        // The shell loads into the selected tab, which is the one the user
        // typed in unless the tab was switched in the meantime.
        if (win.gBrowser.selectedBrowser == browser) {
          win.gHilalShell?.navigate(message.data.input);
        }
        return null;
    }
    return null;
  }
}
