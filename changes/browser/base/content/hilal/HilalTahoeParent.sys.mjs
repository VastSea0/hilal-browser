/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class HilalTahoeParent extends JSWindowActorParent {
  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:GetOffsets") {
      let chromeWin = this.browsingContext.topChromeWindow;
      if (!chromeWin) {
        return { top: 0, left: 0 };
      }
      
      let sidebarOpen = chromeWin.SidebarController?.isOpen && 
                        Services.prefs.getBoolPref("hilal.tahoe.enabled", true);
      if (sidebarOpen) {
        let docEl = chromeWin.document.documentElement;
        let style = chromeWin.getComputedStyle(docEl);
        let top = parseFloat(style.getPropertyValue("--hilal-safari-webview-top-underlap")) || 92;
        let left = parseFloat(style.getPropertyValue("--hilal-safari-sidebar-content-underlap")) || 84;
        return { top, left };
      }
      return { top: 0, left: 0 };
    }
    return null;
  }
}
