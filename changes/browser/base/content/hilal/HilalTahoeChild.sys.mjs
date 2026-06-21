/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export class HilalTahoeChild extends JSWindowActorChild {
  handleEvent(aEvent) {
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
    }
  }

  receiveMessage(aMessage) {
    if (aMessage.name === "HilalTahoe:UpdateOffsets") {
      this.updatePageBackground();
      this.scheduleScrollStateUpdate();
    }
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
