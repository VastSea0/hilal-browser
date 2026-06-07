export class HilalBoostsChild extends JSWindowActorChild {
  constructor() {
    super();
    this._zapping = false;
    this._hoveredEl = null;
    this._zapHost = null;
    this._zapShadow = null;

    this._onMouseMove = this.onMouseMove.bind(this);
    this._onClick = this.onClick.bind(this);
    this._onKeyDown = this.onKeyDown.bind(this);
  }

  actorCreated() {
    if (this.browsingContext.parent === null) {
      this.initBoost();
    }
  }

  async initBoost() {
    const domain = this.hostWithoutPort;
    if (!domain) return;

    try {
      const boost = await this.sendQuery("HilalBoosts:GetBoostForDomain", { domain });
      this.applyBoostToBackend(boost);
    } catch (e) {
      console.error("HilalBoostsChild: failed to init boost", e);
    }
  }

  receiveMessage(aMessage) {
    switch (aMessage.name) {
      case "HilalBoosts:StartZap":
        this.startZap(aMessage.data);
        break;
      case "HilalBoosts:StopZap":
        this.stopZap();
        break;
      case "HilalBoosts:UpdateBoost":
        this.applyBoostToBackend(aMessage.data);
        break;
      case "HilalBoosts:ClearBoost":
        this.applyBoostToBackend(null);
        break;
    }
  }

  actorDestroy() {
    this.stopZap();
  }

  startZap(data = {}) {
    if (this._zapping) {
      return;
    }
    this._zapping = true;
    this._hoveredEl = null;

    const doc = this.document;
    this._ensureZapOverlay(data.accentColor, data.secondaryColor);
    doc.addEventListener("mousemove", this._onMouseMove, true);
    doc.addEventListener("click", this._onClick, true);
    doc.addEventListener("keydown", this._onKeyDown, true);
  }

  stopZap() {
    if (!this._zapping && !this._zapHost) {
      return;
    }
    this._zapping = false;
    this._hoveredEl = null;

    const doc = this.document;
    doc.removeEventListener("mousemove", this._onMouseMove, true);
    doc.removeEventListener("click", this._onClick, true);
    doc.removeEventListener("keydown", this._onKeyDown, true);
    this._removeZapOverlay();
  }

  onMouseMove(e) {
    if (!this._zapping || this._eventHitsOverlay(e)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const el = this._elementFromEvent(e);
    if (!el || el === this._hoveredEl) {
      return;
    }

    this._hoveredEl = el;
    this._updateZapHighlight(el);
  }

  onClick(e) {
    if (!this._zapping || this._eventHitsOverlay(e)) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const el = this._elementFromEvent(e);
    const selector = this.computeSelector(el);
    if (!el || !selector) {
      return;
    }

    this._animateZap(el);
    this.sendAsyncMessage("HilalBoosts:ElementZapped", { selector });
    this.stopZap();
  }

  onKeyDown(e) {
    if (!this._zapping) {
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.stopZap();
    }
  }

  _ensureZapOverlay(accentColor = "#7c5cff", secondaryColor = "#00d4ff") {
    if (this._zapHost) {
      return;
    }

    const doc = this.document;
    const host = doc.createElement("div");
    host.setAttribute("data-hilal-boosts-zap-overlay", "true");
    host.style.setProperty("--hilal-boosts-accent", this._safeColor(accentColor, "#7c5cff"));
    host.style.setProperty("--hilal-boosts-secondary", this._safeColor(secondaryColor, "#00d4ff"));
    doc.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
          position: fixed;
          inset: 0;
          z-index: 2147483647;
          color: #f8fafc;
          font: 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          pointer-events: none;
        }
        .viewport {
          position: fixed;
          inset: 10px;
          border-radius: 18px;
          border: 1px solid color-mix(in srgb, var(--hilal-boosts-accent) 54%, transparent);
          box-shadow:
            inset 0 0 0 1px color-mix(in srgb, var(--hilal-boosts-secondary) 32%, transparent),
            0 0 40px color-mix(in srgb, var(--hilal-boosts-accent) 22%, transparent);
          animation: hilal-zap-frame-in 180ms ease-out both;
        }
        .highlight {
          position: fixed;
          left: 0;
          top: 0;
          width: 0;
          height: 0;
          border-radius: 10px;
          border: 2px solid #ffd166;
          background: color-mix(in srgb, #ffd166 13%, transparent);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.55),
            0 10px 36px color-mix(in srgb, var(--hilal-boosts-accent) 34%, transparent);
          opacity: 0;
          transition:
            left 80ms ease,
            top 80ms ease,
            width 80ms ease,
            height 80ms ease,
            opacity 80ms ease;
        }
        .controls {
          position: fixed;
          left: 50%;
          bottom: 22px;
          transform: translateX(-50%);
          min-width: min(560px, calc(100vw - 32px));
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 14px;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.14);
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--hilal-boosts-accent) 18%, transparent), color-mix(in srgb, var(--hilal-boosts-secondary) 14%, transparent)),
            rgba(18, 20, 26, .95);
          box-shadow: 0 18px 50px rgba(0,0,0,.34);
          pointer-events: auto;
          animation: hilal-zap-controls-in 180ms ease-out both;
        }
        .title {
          font-weight: 760;
          letter-spacing: 0;
          margin-bottom: 2px;
        }
        .target {
          max-width: 390px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: rgba(248,250,252,.68);
          font: 11px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        button {
          appearance: none;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 8px;
          color: #f8fafc;
          background: rgba(255,255,255,.08);
          padding: 7px 12px;
          font: 700 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          cursor: pointer;
        }
        button.primary {
          border-color: color-mix(in srgb, var(--hilal-boosts-accent) 64%, rgba(255,255,255,.2));
          background: linear-gradient(135deg, var(--hilal-boosts-accent), var(--hilal-boosts-secondary));
          box-shadow: 0 8px 22px color-mix(in srgb, var(--hilal-boosts-accent) 28%, transparent);
        }
        @keyframes hilal-zap-frame-in {
          from { opacity: 0; transform: scale(.996); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes hilal-zap-controls-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      </style>
      <div class="viewport"></div>
      <div class="highlight"></div>
      <div class="controls">
        <div>
          <div class="title">Hilal Zapper</div>
          <div class="target">Select an element to hide</div>
        </div>
        <div class="actions">
          <button type="button" data-action="cancel">Cancel</button>
          <button type="button" class="primary" data-action="done">Done</button>
        </div>
      </div>
    `;

    shadow.querySelector('[data-action="cancel"]').addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this.stopZap();
    });
    shadow.querySelector('[data-action="done"]').addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this.stopZap();
    });

    this._zapHost = host;
    this._zapShadow = shadow;
  }

  _updateZapHighlight(el) {
    const rect = el.getBoundingClientRect();
    const highlight = this._zapShadow?.querySelector(".highlight");
    const target = this._zapShadow?.querySelector(".target");
    if (!highlight || !target || !rect.width || !rect.height) {
      return;
    }

    highlight.style.left = `${Math.max(0, rect.left)}px`;
    highlight.style.top = `${Math.max(0, rect.top)}px`;
    highlight.style.width = `${Math.max(0, rect.width)}px`;
    highlight.style.height = `${Math.max(0, rect.height)}px`;
    highlight.style.opacity = "1";
    target.textContent = this.computeSelector(el);
  }

  _animateZap(el) {
    try {
      el.style.setProperty(
        "transition",
        "opacity 160ms ease, transform 160ms ease",
        "important"
      );
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("transform", "scale(.985)", "important");
      this.contentWindow.setTimeout(() => {
        el.style.setProperty("display", "none", "important");
      }, 170);
    } catch (e) {
      el.style.display = "none";
    }
  }

  _elementFromEvent(event) {
    let el = event.target;
    if (el?.nodeType !== Node.ELEMENT_NODE) {
      el = el?.parentElement;
    }
    if (!el || el === this._zapHost) {
      return null;
    }
    return el;
  }

  _eventHitsOverlay(event) {
    return event.composedPath?.().some(node => node === this._zapHost);
  }

  _removeZapOverlay() {
    this._zapHost?.remove();
    this._zapHost = null;
    this._zapShadow = null;
  }

  _safeColor(value, fallback) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  }

  computeSelector(el) {
    if (!el) return "";
    if (el.id) {
      return "#" + CSS.escape(el.id);
    }

    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let part = el.nodeName.toLowerCase();
      if (el.id) {
        part += "#" + CSS.escape(el.id);
        parts.unshift(part);
        break;
      }

      const className = el.className;
      if (typeof className === "string" && className.trim()) {
        const classes = className.trim().split(/\s+/).filter(Boolean);
        if (classes.length) {
          part += "." + classes.map(c => CSS.escape(c)).join(".");
        }
      }

      let index = 1;
      let sibling = el.previousElementSibling;
      while (sibling) {
        if (sibling.nodeName === el.nodeName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }
      part += `:nth-of-type(${index})`;
      parts.unshift(part);
      el = el.parentElement;
    }
    return parts.join(" > ");
  }

  get hostWithoutPort() {
    try {
      const host = this.contentWindow.top.location.host;
      return host?.split(":")[0];
    } catch (e) {
      try {
        const host = this.contentWindow.location.host;
        return host?.split(":")[0];
      } catch (err) {}
    }
    return null;
  }

  applyBoostToBackend(boost) {
    try {
      const domain = this.hostWithoutPort;
      if (!domain) return;

      if (boost && boost.enabled) {
        let accentInt = 0;
        if (boost.colorEnabled && boost.accentColor) {
          accentInt = this.hexToColorInt(boost.accentColor, boost.colorIntensity, boost.colorBrightness);
        }

        const complementaryRotation = boost.colorEnabled
          ? (boost.secondaryColor ? this.calculateRotationDelta(boost.accentColor, boost.secondaryColor) : 52)
          : 0;

        const inverted = boost.smartInvert ? 1 : 0;

        const notifyStr = `${domain}|${accentInt}|${complementaryRotation}|${inverted}`;
        Services.obs.notifyObservers(null, "hilal-boost-updated", notifyStr);
      } else {
        Services.obs.notifyObservers(null, "hilal-boost-updated", `${domain}|0|0|0`);
      }
    } catch (e) {
      console.error("HilalBoostsChild: failed to apply boost to backend", e);
    }
  }

  hexToColorInt(hexColor, intensity, brightness) {
    const hsl = this.hexToHsl(hexColor);
    const adjustedLightness = 0.1 + 0.9 * (brightness / 200);
    const rgb = this.hslToRgb(hsl.h / 360, hsl.s / 100, adjustedLightness);
    const contrast = Math.round(intensity * 2.55);
    return ((contrast << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;
  }

  calculateRotationDelta(accentHex, secondaryHex) {
    const accentHsl = this.hexToHsl(accentHex);
    const secondaryHsl = this.hexToHsl(secondaryHex);
    let diff = (secondaryHsl.h - accentHsl.h + 360) % 360;
    if (diff > 180) {
      diff -= 360;
    }
    return diff;
  }

  hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    let hue = 0;
    let saturation = 0;

    if (delta) {
      saturation = delta / (1 - Math.abs(2 * lightness - 1));
      if (max === r) {
        hue = ((g - b) / delta) % 6;
      } else if (max === g) {
        hue = (b - r) / delta + 2;
      } else {
        hue = (r - g) / delta + 4;
      }
      hue *= 60;
      if (hue < 0) hue += 360;
    }

    return { h: hue, s: saturation * 100, l: lightness * 100 };
  }

  hslToRgb(h, s, l) {
    const { round } = Math;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = this.hueToRgb(p, q, h + 1 / 3);
      g = this.hueToRgb(p, q, h);
      b = this.hueToRgb(p, q, h - 1 / 3);
    }

    return [round(r * 255), round(g * 255), round(b * 255)];
  }

  hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
}
