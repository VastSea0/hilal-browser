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
      if (!chromeWin?.document) {
        return null;
      }
      let color = aMessage.data?.backgroundColor;
      let docEl = chromeWin.document.documentElement;
      if (color) {
        docEl.style.setProperty("--hilal-safari-page-bg", color);
      } else {
        docEl.style.removeProperty("--hilal-safari-page-bg");
      }
      return null;
    }

    return null;
  }
}
