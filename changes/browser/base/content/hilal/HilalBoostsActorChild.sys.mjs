export class HilalBoostsChild extends JSWindowActorChild {
  constructor() {
    super();
    this._zapping = false;
    this._hoveredEl = null;

    this._onMouseOver = this.onMouseOver.bind(this);
    this._onMouseOut = this.onMouseOut.bind(this);
    this._onClick = this.onClick.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
  }

  receiveMessage(aMessage) {
    switch (aMessage.name) {
      case "HilalBoosts:StartZap":
        this.startZap();
        break;
      case "HilalBoosts:StopZap":
        this.stopZap();
        break;
    }
  }

  startZap() {
    if (this._zapping) return;
    this._zapping = true;

    const doc = this.document;
    doc.addEventListener("mouseover", this._onMouseOver, true);
    doc.addEventListener("mouseout", this._onMouseOut, true);
    doc.addEventListener("click", this._onClick, true);
    doc.addEventListener("keydown", this._onKeyDown, true);
  }

  stopZap() {
    if (!this._zapping) return;
    this._zapping = false;

    const doc = this.document;
    doc.removeEventListener("mouseover", this._onMouseOver, true);
    doc.removeEventListener("mouseout", this._onMouseOut, true);
    doc.removeEventListener("click", this._onClick, true);
    doc.removeEventListener("keydown", this._onKeyDown, true);

    if (this._hoveredEl) {
      this._hoveredEl.style.outline = "";
      this._hoveredEl = null;
    }
  }

  onMouseOver(e) {
    if (!this._zapping) return;
    e.preventDefault();
    e.stopPropagation();

    if (this._hoveredEl) {
      this._hoveredEl.style.outline = "";
    }
    this._hoveredEl = e.target;
    this._hoveredEl.style.outline = "2px dashed #ff4757";
    this._hoveredEl.style.outlineOffset = "-2px";
  }

  onMouseOut(e) {
    if (!this._zapping) return;
    e.preventDefault();
    e.stopPropagation();

    if (this._hoveredEl === e.target) {
      this._hoveredEl.style.outline = "";
      this._hoveredEl = null;
    }
  }

  onClick(e) {
    if (!this._zapping) return;
    e.preventDefault();
    e.stopPropagation();

    const el = e.target;
    const selector = this.computeSelector(el);
    
    // Hide it immediately in page content for instant visual feedback
    el.style.display = "none";

    this.sendAsyncMessage("HilalBoosts:ElementZapped", { selector });
    this.stopZap();
  }

  onKeyDown(e) {
    if (!this._zapping) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.stopZap();
    }
  }

  computeSelector(el) {
    if (!el) return "";
    if (el.id) {
      // Escape ID properly for CSS selector
      return "#" + CSS.escape(el.id);
    }
    let parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let part = el.nodeName.toLowerCase();
      if (el.id) {
        part += "#" + CSS.escape(el.id);
        parts.unshift(part);
        break;
      }
      let className = el.className;
      if (typeof className === "string" && className.trim()) {
        const classes = className.trim().split(/\s+/).filter(Boolean);
        if (classes.length > 0) {
          part += "." + classes.map(c => CSS.escape(c)).join(".");
        }
      }
      let sibling = el;
      let index = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName === el.nodeName) {
          index++;
        }
      }
      part += `:nth-of-type(${index})`;
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(" > ");
  }
}
