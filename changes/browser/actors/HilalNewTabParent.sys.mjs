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
      case "GetTheme": {
        // The page uses the same Material tokens as the browser chrome.
        const theme = win.MaterialYouTheme?.getThemeData() ?? {};
        const style = win.document.documentElement.style;
        const tokens = {};
        for (let i = 0; i < style.length; i++) {
          if (style[i].startsWith("--") && !style[i].startsWith("--md-sys-")) {
            tokens[style[i]] = style.getPropertyValue(style[i]);
          }
        }
        return { ...theme, tokens };
      }
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
      case "Navigate": {
        const input = message.data.input;
        // The page's chips open the browser's own panels and windows.
        const actions = {
          "hilal:bookmarks": () => win.SidebarController.show("viewBookmarksSidebar"),
          "hilal:history": () => win.SidebarController.show("viewHistorySidebar"),
          "hilal:downloads": () => win.document.getElementById("Tools:Downloads")?.doCommand(),
          "hilal:settings": () => win.openPreferences(),
        };
        if (actions[input]) {
          actions[input]();
          return null;
        }
        // The shell loads into the selected tab, which is the one the user
        // typed in unless the tab was switched in the meantime.
        if (win.gBrowser.selectedBrowser == browser) {
          win.gHilalShell?.navigate(input);
        }
        return null;
      }
    }
    return null;
  }
}
