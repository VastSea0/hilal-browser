/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global Services, MigrationUtils, ChromeUtils */

(function () {
  "use strict";

  const { SearchService } = ChromeUtils.importESModule(
    "moz-src:///toolkit/components/search/SearchService.sys.mjs"
  );

  const HTML_NS = "http://www.w3.org/1999/xhtml";
  const CSS_HREF = "chrome://browser/content/hilal/HilalWelcome.css";
  const BRAND_LOGO_URL = "chrome://branding/content/about-logo@2x.png";
  const TIPPYTOP = "chrome://activity-stream/content/data/content/tippytop/images/";

  const PREF_SEEN = "hilal.welcome-screen.seen";
  const PREF_THEME = "layout.css.prefers-color-scheme.content-override";
  const PREF_TAB_LAYOUT = "hilal.tabs.layoutMode";
  const PREF_PRIVACY_LEVEL = "hilal.privacy.level";
  const PREF_WORKSPACES_ENABLED = "hilal.workspaces.enabled";

  // Values of layout.css.prefers-color-scheme.content-override.
  const THEMES = [
    { value: 2, key: "system", label: "System" },
    { value: 1, key: "light", label: "Light" },
    { value: 0, key: "dark", label: "Dark" },
  ];

  const TAB_LAYOUTS = [
    { value: "vertical", label: "Vertical", desc: "Tabs in a sidebar on the left" },
    { value: "horizontal", label: "Horizontal", desc: "Tabs along the top of the window" },
  ];

  const PRIVACY_LEVELS = [
    {
      value: "standard",
      label: "Balanced",
      desc: "Strict tracking protection, HTTPS-only and tracking-link cleanup. Search suggestions are off.",
    },
    {
      value: "strict",
      label: "Strict",
      desc: "Also isolates sites from each other and turns off WebRTC. Some video calls may not work.",
    },
    {
      value: "extreme",
      label: "Maximum",
      desc: "Also resists fingerprinting and blocks JavaScript, camera, microphone and location. History is not saved. Many sites will not work.",
    },
  ];

  const STARTER_WORKSPACES = [
    { key: "personal", label: "Personal", color: "blue" },
    { key: "work", label: "Work", color: "orange" },
    { key: "social", label: "Social", color: "pink" },
  ];

  const STEP_COUNT = 3;

  // Small DOM builder: h("div", { class: "x", "data-l10n-id": "y" }, child, "text").
  function h(tag, attrs = {}, ...children) {
    const el = document.createElementNS(HTML_NS, tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (value === false || value === null || value === undefined) {
        continue;
      }
      if (name.startsWith("on") && typeof value === "function") {
        el.addEventListener(name.slice(2), value);
      } else {
        el.setAttribute(name, value === true ? "" : String(value));
      }
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) {
        continue;
      }
      el.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return el;
  }

  class HilalWelcome {
    constructor(workspacesController) {
      this._workspaces = workspacesController;
      this._step = -1;
      this._overlay = null;
      this._style = null;
      this._engines = [];

      const prefs = Services.prefs;
      this._theme = prefs.getIntPref(PREF_THEME, 2);
      this._tabLayout =
        prefs.getStringPref(PREF_TAB_LAYOUT, "vertical") === "horizontal"
          ? "horizontal"
          : "vertical";
      const level = prefs.getStringPref(PREF_PRIVACY_LEVEL, "standard");
      this._privacy = PRIVACY_LEVELS.some(l => l.value === level) ? level : "standard";
      this._engine = null;
      this._createWorkspaces = true;
      this._makeDefault = false;
    }

    async start() {
      this._style = h("link", { id: "hilal-welcome-style", rel: "stylesheet", href: CSS_HREF });
      (document.head || document.documentElement).appendChild(this._style);

      this._overlay = h("div", {
        id: "hilal-welcome-overlay",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "hw-title",
      });
      (document.body || document.documentElement).appendChild(this._overlay);
      document.documentElement.setAttribute("hilal-welcome-stage", "true");

      this._applyTheme();
      this._enginesReady = this._loadEngines();
      this._render({ focus: true });
    }

    // Rendering

    _render({ focus = false } = {}) {
      const main = h("div", { class: "hw-main" }, this._stepContent());
      this._overlay.replaceChildren(...[this._header(), main, this._footer()].filter(Boolean));
      this._attachTrafficLights();
      if (focus) {
        this._overlay.querySelector(".hw-primary")?.focus();
      }
    }

    _header() {
      const progress = h(
        "div",
        { class: "hw-progress", "aria-hidden": "true" },
        Array.from({ length: STEP_COUNT }, (_, i) =>
          h("span", { class: i <= this._step ? "hw-progress-bar is-done" : "hw-progress-bar" })
        )
      );
      return h(
        "div",
        { class: "hw-header" },
        h("div", { class: "hw-traffic-slot" }),
        // Keep the middle grid cell filled so "Skip" stays on the right.
        this._step >= 0 ? progress : h("div"),
        h(
          "button",
          { type: "button", class: "hw-link", "data-l10n-id": "hilal-welcome-skip", onclick: () => this._dismiss() },
          "Skip setup"
        )
      );
    }

    _footer() {
      if (this._step < 0) {
        return null;
      }
      const last = this._step === STEP_COUNT - 1;
      return h(
        "div",
        { class: "hw-footer" },
        h(
          "div",
          { class: "hw-footer-inner" },
          h(
            "button",
            {
              type: "button",
              class: "hw-secondary",
              "data-l10n-id": "hilal-welcome-back",
              onclick: () => this._go(this._step - 1),
            },
            "Back"
          ),
          h(
            "span",
            {
              class: "hw-step-count",
              "data-l10n-id": "hilal-welcome-step",
              "data-l10n-args": JSON.stringify({ current: this._step + 1, total: STEP_COUNT }),
            },
            `Step ${this._step + 1} of ${STEP_COUNT}`
          ),
          h(
            "button",
            {
              type: "button",
              class: "hw-primary",
              "data-l10n-id": last ? "hilal-welcome-finish" : "hilal-welcome-next",
              onclick: () => (last ? this._finish() : this._go(this._step + 1)),
            },
            last ? "Start browsing" : "Continue"
          )
        )
      );
    }

    _stepContent() {
      switch (this._step) {
        case 0:
          return this._lookStep();
        case 1:
          return this._privacyStep();
        case 2:
          return this._readyStep();
        default:
          return this._introStep();
      }
    }

    _title(id, text, subId, subText) {
      return [
        h("h1", { id: "hw-title", class: "hw-title", "data-l10n-id": id }, text),
        subId ? h("p", { class: "hw-subtitle", "data-l10n-id": subId }, subText) : null,
      ];
    }

    _introStep() {
      return h(
        "div",
        { class: "hw-column hw-intro" },
        h("img", { class: "hw-logo", src: BRAND_LOGO_URL, alt: "" }),
        this._title(
          "hilal-welcome-intro-title",
          "Welcome to Hilal",
          "hilal-welcome-intro-sub",
          "A few choices and you are ready to browse."
        ),
        h(
          "button",
          { type: "button", class: "hw-primary", "data-l10n-id": "hilal-welcome-start", onclick: () => this._go(0) },
          "Get started"
        )
      );
    }

    _lookStep() {
      return h(
        "div",
        { class: "hw-column" },
        this._title(
          "hilal-welcome-look-title",
          "Choose your look",
          "hilal-welcome-look-sub",
          "You can change these later in Settings."
        ),
        this._group(
          "hilal-welcome-theme-label",
          "Theme",
          h(
            "div",
            { class: "hw-tiles hw-tiles-3", role: "radiogroup" },
            THEMES.map(theme =>
              this._tile({
                selected: this._theme === theme.value,
                preview: h("span", { class: `hw-preview hw-preview-${theme.key}` }),
                labelId: `hilal-welcome-theme-${theme.key}`,
                label: theme.label,
                onSelect: () => {
                  this._theme = theme.value;
                  this._applyTheme();
                  this._render();
                },
              })
            )
          )
        ),
        this._group(
          "hilal-welcome-tabs-label",
          "Tabs",
          h(
            "div",
            { class: "hw-tiles hw-tiles-2", role: "radiogroup" },
            TAB_LAYOUTS.map(layout =>
              this._tile({
                selected: this._tabLayout === layout.value,
                preview: h("span", { class: `hw-preview hw-preview-${layout.value}` }, h("span"), h("span")),
                labelId: `hilal-welcome-tabs-${layout.value}`,
                label: layout.label,
                descId: `hilal-welcome-tabs-${layout.value}-desc`,
                desc: layout.desc,
                onSelect: () => {
                  this._tabLayout = layout.value;
                  this._render();
                },
              })
            )
          )
        )
      );
    }

    _privacyStep() {
      const engines = this._engines.length
        ? h(
            "div",
            { class: "hw-list hw-list-grid", role: "radiogroup" },
            this._engines.map(engine =>
              this._row({
                selected: this._engine === engine,
                icon: engine.iconURL ? h("img", { class: "hw-row-icon", src: engine.iconURL, alt: "" }) : null,
                label: engine.name,
                onSelect: () => {
                  this._engine = engine;
                  this._render();
                },
              })
            )
          )
        : null;
      return h(
        "div",
        { class: "hw-column" },
        this._title(
          "hilal-welcome-privacy-title",
          "Privacy and search",
          "hilal-welcome-privacy-sub",
          "Stricter levels block more tracking but can break some sites."
        ),
        this._group(
          "hilal-welcome-privacy-label",
          "Protection level",
          h(
            "div",
            { class: "hw-list", role: "radiogroup" },
            PRIVACY_LEVELS.map(level =>
              this._row({
                selected: this._privacy === level.value,
                labelId: `hilal-welcome-privacy-${level.value}`,
                label: level.label,
                descId: `hilal-welcome-privacy-${level.value}-desc`,
                desc: level.desc,
                onSelect: () => {
                  this._privacy = level.value;
                  this._render();
                },
              })
            )
          )
        ),
        engines ? this._group("hilal-welcome-search-label", "Search engine", engines) : null
      );
    }

    _readyStep() {
      return h(
        "div",
        { class: "hw-column" },
        this._title(
          "hilal-welcome-ready-title",
          "Almost done",
          "hilal-welcome-ready-sub",
          "Set these up now or later from Settings."
        ),
        h(
          "div",
          { class: "hw-list" },
          this._switchRow({
            checked: this._createWorkspaces,
            labelId: "hilal-welcome-workspaces",
            label: "Create starter workspaces",
            descId: "hilal-welcome-workspaces-desc",
            desc: "Personal, Work and Social, each with its own cookies and logins.",
            onToggle: value => (this._createWorkspaces = value),
          }),
          this._switchRow({
            checked: this._makeDefault,
            labelId: "hilal-welcome-default",
            label: "Make Hilal your default browser",
            descId: "hilal-welcome-default-desc",
            desc: "Links from other apps will open here.",
            onToggle: value => (this._makeDefault = value),
          }),
          h(
            "div",
            { class: "hw-row hw-row-static" },
            this._rowText("hilal-welcome-import", "Import from another browser", "hilal-welcome-import-desc", "Bookmarks, history and passwords."),
            h(
              "button",
              { type: "button", class: "hw-secondary", "data-l10n-id": "hilal-welcome-import-button", onclick: () => this._import() },
              "Import"
            )
          )
        )
      );
    }

    // Controls

    _group(labelId, label, content) {
      return h(
        "div",
        { class: "hw-group" },
        h("h2", { class: "hw-group-label", "data-l10n-id": labelId }, label),
        content
      );
    }

    _rowText(labelId, label, descId, desc) {
      return h(
        "span",
        { class: "hw-row-text" },
        h("span", { class: "hw-row-label", "data-l10n-id": labelId }, label),
        desc ? h("span", { class: "hw-row-desc", "data-l10n-id": descId }, desc) : null
      );
    }

    _tile({ selected, preview, labelId, label, descId, desc, onSelect }) {
      return h(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": selected ? "true" : "false",
          class: selected ? "hw-tile is-selected" : "hw-tile",
          onclick: onSelect,
        },
        preview,
        this._rowText(labelId, label, descId, desc)
      );
    }

    _row({ selected, icon, labelId, label, descId, desc, onSelect }) {
      return h(
        "button",
        {
          type: "button",
          role: "radio",
          "aria-checked": selected ? "true" : "false",
          class: selected ? "hw-row is-selected" : "hw-row",
          onclick: onSelect,
        },
        h("span", { class: "hw-radio", "aria-hidden": "true" }),
        icon,
        labelId ? this._rowText(labelId, label, descId, desc) : h("span", { class: "hw-row-text" }, h("span", { class: "hw-row-label" }, label))
      );
    }

    _switchRow({ checked, labelId, label, descId, desc, onToggle }) {
      const row = h(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": checked ? "true" : "false",
          class: "hw-row",
        },
        this._rowText(labelId, label, descId, desc),
        h("span", { class: "hw-switch", "aria-hidden": "true" })
      );
      row.addEventListener("click", () => {
        const value = row.getAttribute("aria-checked") !== "true";
        row.setAttribute("aria-checked", value ? "true" : "false");
        onToggle(value);
      });
      return row;
    }

    // State

    async _go(step) {
      if (step < 0) {
        step = -1;
      }
      if (step === 1) {
        await this._enginesReady;
      }
      this._step = Math.min(step, STEP_COUNT - 1);
      this._render({ focus: true });
    }

    _isDark() {
      if (this._theme === 0) {
        return true;
      }
      if (this._theme === 1) {
        return false;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    _applyTheme() {
      this._overlay?.setAttribute("data-theme", this._isDark() ? "dark" : "light");
    }

    async _loadEngines() {
      try {
        const engines = await SearchService.getVisibleEngines();
        this._engines = await Promise.all(
          engines
            // Site search engines are not useful as the default.
            .filter(engine => !/wikipedia|ebay|amazon/i.test(engine.name))
            .map(async engine => ({
              name: engine.name,
              engine,
              iconURL: await this._engineIcon(engine),
            }))
        );
        const current = await SearchService.getDefault();
        this._engine =
          this._engines.find(e => e.name.toLowerCase().includes("duckduckgo")) ||
          this._engines.find(e => e.engine === current) ||
          this._engines[0] ||
          null;
      } catch (e) {
        console.error("HilalWelcome: could not load search engines", e);
      }
    }

    async _engineIcon(engine) {
      const name = engine.name.toLowerCase();
      if (name.includes("duckduckgo")) {
        return `${TIPPYTOP}duckduckgo-com@2x.svg`;
      }
      if (name.includes("google")) {
        return `${TIPPYTOP}google-com@2x.png`;
      }
      if (name.includes("bing")) {
        return `${TIPPYTOP}bing-com@2x.svg`;
      }
      try {
        const url = (await engine.getIconURL(32)) || (await engine.getIconURL());
        if (url && /^(https|data|chrome|resource|moz-extension):/.test(url)) {
          return url;
        }
      } catch (e) {}
      return "chrome://global/skin/icons/search-glass.svg";
    }

    _import() {
      try {
        MigrationUtils.showMigrationWizard(window, { isStartupMigration: true });
      } catch (e) {
        console.error("HilalWelcome: could not open the import wizard", e);
      }
    }

    async _finish() {
      const prefs = Services.prefs;
      try {
        prefs.setIntPref(PREF_THEME, this._theme);
        // The shell reads its layout pref; native sidebar.* prefs stay as the
        // branding sets them so Firefox's own sidebar never comes back.
        if (window.gHilalShell?.setTabMode) {
          window.gHilalShell.setTabMode(this._tabLayout);
        } else {
          prefs.setStringPref(PREF_TAB_LAYOUT, this._tabLayout);
        }
        prefs.setStringPref(PREF_PRIVACY_LEVEL, this._privacy);
      } catch (e) {
        console.error("HilalWelcome: could not save preferences", e);
      }

      if (this._engine?.engine) {
        try {
          const reason = SearchService.CHANGE_REASON.USER;
          await SearchService.setDefault(this._engine.engine, reason);
          await SearchService.setDefaultPrivate(this._engine.engine, reason);
        } catch (e) {
          console.error("HilalWelcome: could not set the search engine", e);
        }
      }

      if (this._createWorkspaces && this._workspaces?.ensureWorkspace) {
        try {
          prefs.setBoolPref(PREF_WORKSPACES_ENABLED, true);
          let first = null;
          for (const preset of STARTER_WORKSPACES) {
            const label =
              (await document.l10n.formatValue(`hilal-welcome-workspace-label-${preset.key}`)) ||
              preset.label;
            const workspace = this._workspaces.ensureWorkspace(label, "", preset.color);
            first ??= workspace;
          }
          if (first?.id) {
            this._workspaces.switchTo(first.id);
          }
        } catch (e) {
          console.error("HilalWelcome: could not create workspaces", e);
        }
      }

      if (this._makeDefault) {
        try {
          window.getShellService?.()?.setDefaultBrowser(false);
        } catch (e) {
          console.error("HilalWelcome: could not set the default browser", e);
        }
      }

      this._dismiss();
    }

    _dismiss() {
      try {
        Services.prefs.setBoolPref(PREF_SEEN, true);
      } catch (e) {
        console.error("HilalWelcome: could not save the seen pref", e);
      }
      this._restoreTrafficLights();
      this._overlay?.remove();
      this._overlay = null;
      this._style?.remove();
      this._style = null;
      document.documentElement.removeAttribute("hilal-welcome-stage");
      try {
        this._workspaces?._apply?.();
        this._workspaces?._updateUI?.();
      } catch (e) {
        console.error("HilalWelcome: could not refresh workspaces", e);
      }
    }

    // The overlay covers the titlebar, so the macOS window buttons are moved
    // into its header while it is shown and put back afterwards.

    _attachTrafficLights() {
      const slot = this._overlay?.querySelector(".hw-traffic-slot");
      if (!slot) {
        return;
      }
      if (!this._trafficNode) {
        const node =
          document.querySelector("#hilal-traffic-lights-spacer .titlebar-buttonbox-container") ||
          document.querySelector(".titlebar-buttonbox-container");
        if (!node) {
          return;
        }
        this._trafficNode = node;
        this._trafficParent = node.parentNode;
        this._trafficNext = node.nextSibling;
      }
      slot.appendChild(this._trafficNode);
    }

    _restoreTrafficLights() {
      const node = this._trafficNode;
      const parent = this._trafficParent;
      if (node && parent?.isConnected) {
        const next = this._trafficNext;
        parent.insertBefore(node, next?.parentNode === parent ? next : null);
      }
      this._trafficNode = this._trafficParent = this._trafficNext = null;
    }
  }

  window.HilalWelcome = HilalWelcome;
})();
