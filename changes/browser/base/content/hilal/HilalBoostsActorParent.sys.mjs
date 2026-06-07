export const HilalBoostsShared = {
  activeSheetUri: null,
  activeSheetCSS: "",
};

export class HilalBoostsParent extends JSWindowActorParent {
  receiveMessage(aMessage) {
    switch (aMessage.name) {
      case "HilalBoosts:ElementZapped": {
        const window = this.browsingContext.top.embedderElement.ownerGlobal;
        if (window && window.gHilalBoosts) {
          window.gHilalBoosts.handleZappedElement(aMessage.data.selector);
        }
        break;
      }
    }
  }
}

