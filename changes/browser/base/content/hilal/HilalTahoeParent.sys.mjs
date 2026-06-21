/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class HilalTahoeParent extends JSWindowActorParent {
  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:GetOffsets") {
      return { top: 0, left: 0 };
    }

    if (aMessage.name === "HilalTahoe:PageStyle") {
      let chromeWin = this.browsingContext.topChromeWindow;
      let browser = this.browsingContext.top.embedderElement;
      if (!chromeWin?.document || !browser) {
        return null;
      }
      let color = aMessage.data?.backgroundColor;
      chromeWin.SidebarController?.updateTahoePageBackground(color, browser);
      return null;
    }

    if (aMessage.name === "HilalTahoe:ScrollState") {
      let chromeWin = this.browsingContext.topChromeWindow;
      chromeWin?.SidebarController?.updateTahoeScrollReflection(
        aMessage.data,
        this.browsingContext
      );
      return null;
    }

    return null;
  }
}
