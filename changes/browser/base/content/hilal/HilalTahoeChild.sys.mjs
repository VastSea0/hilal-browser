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
        this.updateOffsets();
      }
    }
  }

  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:UpdateOffsets") {
      this.applyOffsets(aMessage.data.top, aMessage.data.left);
    }
  }

  async updateOffsets() {
    try {
      let offsets = await this.sendQuery("HilalTahoe:GetOffsets");
      this.applyOffsets(offsets.top, offsets.left);
    } catch (e) {
      // Ignore errors when browsing context or page gets unloaded
    }
  }

  applyOffsets(top, left) {
    let docEl = this.document?.documentElement;
    if (!docEl) return;
    if (top > 0) {
      docEl.style.setProperty("padding-top", `${top}px`, "important");
      docEl.style.setProperty("box-sizing", "border-box", "important");
    } else {
      docEl.style.removeProperty("padding-top");
    }
    if (left > 0) {
      docEl.style.setProperty("padding-left", `${left}px`, "important");
      docEl.style.setProperty("box-sizing", "border-box", "important");
    } else {
      docEl.style.removeProperty("padding-left");
    }
    if (top <= 0 && left <= 0) {
      docEl.style.removeProperty("box-sizing");
    }
  }
}
