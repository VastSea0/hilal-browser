/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class HilalTahoeChild extends JSWindowActorChild {
  handleEvent(aEvent) {
    if (
      aEvent.type === "DOMDocElementInserted" ||
      aEvent.type === "DOMContentLoaded" ||
      aEvent.type === "pageshow"
    ) {
      if (this.browsingContext.parent === null) {
        this.updatePageBackground();
      }
    }
  }

  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:UpdateOffsets") {
      this.updatePageBackground();
    }
  }

  async updateOffsets() {
    this.updatePageBackground();
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
