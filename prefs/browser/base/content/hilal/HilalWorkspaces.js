/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  "use strict";

  const PREF_DATA = "hilal.workspaces.data";
  const PREF_ACTIVE = "hilal.workspaces.active";
  const PREF_ENABLED = "hilal.workspaces.enabled";
  const STORE_KEY = "hilalWorkspace";
  const INIT_MAX_RETRIES = 80;

  const EMOJIS = [
    "🗂", "🏠", "💼", "🎨", "📚", "🛠", "🎵", "🌐", "💡", "🔬",
    "🎮", "📝", "🎯", "🚀", "🌙", "☕", "🍎", "🌍", "🔒", "⚡",
    "🔥", "❄️", "🌿", "🐱", "🐶", "🦊", "🦁", "🐧", "🦄", "🌈",
    "⭐", "🌟", "💎", "🎁", "🎀", "🏆", "🥇", "🎖", "🏅", "🚩",
    "📌", "📎", "📐", "🔧", "🔨", "⚙️", "💊", "🧪", "🧬", "🧮"
  ];

  class HilalWorkspaces {
    constructor() {
      this._workspaces = [];
      this._activeId = "";
      this._container = null;
      this._addBtn = null;
      this._shadowRoot = null;
    }

    _uuid() {
      return "ws-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
    }

    _loadData() {
      try {
        this._workspaces = JSON.parse(Services.prefs.getStringPref(PREF_DATA, "[]"));
      } catch (e) {
        this._workspaces = [];
      }
      if (!this._workspaces.length) {
        this._workspaces.push({ id: "default", name: "Default", emoji: "🗂" });
        this._saveData();
      }
      for (const ws of this._workspaces) {
        if (!ws.emoji) {
          ws.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        }
      }
      try {
        this._activeId = Services.prefs.getStringPref(PREF_ACTIVE, this._workspaces[0].id);
      } catch (e) {
        this._activeId = this._workspaces[0].id;
      }
      if (!this._workspaces.find(w => w.id === this._activeId)) {
        this._activeId = this._workspaces[0].id;
      }
    }

    _saveData() {
      Services.prefs.setStringPref(PREF_DATA, JSON.stringify(this._workspaces));
    }

    init() {
      this._loadData();
      this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
      this._buildUI();
      this._apply();
      this._hookEvents();
      if (!this._enabled && this._container) {
        this._container.hidden = true;
      }
    }

    _hookEvents() {
      gBrowser.tabContainer.addEventListener("TabOpen", e => {
        const tab = e.target;
        if (!tab.hasAttribute("hilal-workspace")) {
          tab.setAttribute("hilal-workspace", this._activeId);
          if (typeof SessionStore !== "undefined") {
            SessionStore.setCustomTabValue(tab, STORE_KEY, this._activeId);
          }
        }
      });

      gBrowser.tabContainer.addEventListener("SSTabRestored", e => {
        if (typeof SessionStore === "undefined") return;
        const tab = e.target;
        const ws = SessionStore.getCustomTabValue(tab, STORE_KEY);
        if (ws) tab.setAttribute("hilal-workspace", ws);
      });

      Services.prefs.addObserver(PREF_DATA, () => {
        this._loadData();
        this._updateUI();
        this._apply();
      });

      Services.prefs.addObserver(PREF_ENABLED, () => {
        this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
        if (this._container) this._container.hidden = !this._enabled;
        this._apply();
      });
    }

    _getTabWorkspace(tab) {
      let ws = tab.getAttribute("hilal-workspace");
      if (!ws && typeof SessionStore !== "undefined") {
        ws = SessionStore.getCustomTabValue(tab, STORE_KEY);
        if (ws) tab.setAttribute("hilal-workspace", ws);
      }
      return ws || "default";
    }

    _apply() {
      if (!this._enabled) {
        for (const tab of gBrowser.tabs) {
          if (tab.hidden) gBrowser.showTab(tab);
        }
        return;
      }

      const selected = gBrowser.selectedTab;
      const selectedWs = this._getTabWorkspace(selected);
      const activeTabs = [];

      for (const tab of gBrowser.tabs) {
        const ws = this._getTabWorkspace(tab);
        if (ws === this._activeId) {
          gBrowser.showTab(tab);
          activeTabs.push(tab);
        } else if (!tab.pinned && tab !== selected) {
          gBrowser.hideTab(tab, "hilal-workspace");
        }
      }

      if (selectedWs !== this._activeId && activeTabs.length) {
        gBrowser.selectedTab = activeTabs[0];
      }
      if (selectedWs !== this._activeId) {
        gBrowser.hideTab(selected, "hilal-workspace");
      }
      if (!activeTabs.length) {
        gBrowser.addTrustedTab("about:newtab", { allowInheritPrincipal: true });
      }
    }

    switchTo(id) {
      if (id === this._activeId) return;
      this._activeId = id;
      Services.prefs.setStringPref(PREF_ACTIVE, this._activeId);
      this._updateUI();
      this._apply();
    }

    create(name, emoji) {
      const ws = { id: this._uuid(), name: name || "Workspace", emoji: emoji || "🗂" };
      this._workspaces.push(ws);
      this._saveData();
      this._updateUI();
      this.switchTo(ws.id);
    }

    rename(id, name, emoji) {
      const ws = this._workspaces.find(w => w.id === id);
      if (ws) {
        if (name) ws.name = name;
        if (emoji) ws.emoji = emoji;
        this._saveData();
        this._updateUI();
      }
    }

    remove(id) {
      if (this._workspaces.length <= 1) return;
      const idx = this._workspaces.findIndex(w => w.id === id);
      if (idx < 0) return;
      const fallback = this._workspaces[idx === 0 ? 1 : 0].id;
      if (typeof SessionStore !== "undefined") {
        for (const tab of gBrowser.tabs) {
          if (this._getTabWorkspace(tab) === id) {
            tab.setAttribute("hilal-workspace", fallback);
            SessionStore.setCustomTabValue(tab, STORE_KEY, fallback);
          }
        }
      }
      this._workspaces.splice(idx, 1);
      if (this._activeId === id) {
        this._activeId = fallback;
        Services.prefs.setStringPref(PREF_ACTIVE, this._activeId);
      }
      this._saveData();
      this._updateUI();
      this._apply();
    }

    _escapeHTML(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    _makeMozBtn(label, type) {
      const btn = document.createElement("moz-button");
      btn.setAttribute("label", label);
      if (type) btn.setAttribute("type", type);
      return btn;
    }

    _buildDialog(titleText, initialEmoji, initialName) {
      const overlay = document.createElement("div");
      overlay.id = "hilal-ws-dialog-overlay";
      overlay.addEventListener("click", e => {
        if (e.target === overlay) overlay.remove();
      });

      const box = document.createElement("div");
      box.id = "hilal-ws-dialog";

      const title = document.createElement("h3");
      title.textContent = titleText;
      box.appendChild(title);

      const emojiLabel = document.createElement("label");
      emojiLabel.textContent = "Icon";
      box.appendChild(emojiLabel);

      const emojiGrid = document.createElement("div");
      emojiGrid.id = "hilal-ws-emoji-grid";
      let selectedEmoji = initialEmoji;
      for (const emoji of EMOJIS) {
        const btn = document.createElement("button");
        btn.className = "hilal-ws-emoji-btn";
        btn.textContent = emoji;
        if (emoji === selectedEmoji) btn.classList.add("hilal-ws-emoji-selected");
        btn.addEventListener("click", () => {
          selectedEmoji = emoji;
          for (const b of emojiGrid.querySelectorAll(".hilal-ws-emoji-btn")) {
            b.classList.toggle("hilal-ws-emoji-selected", b.textContent === emoji);
          }
        });
        emojiGrid.appendChild(btn);
      }
      box.appendChild(emojiGrid);

      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Name";
      box.appendChild(nameLabel);

      const nameInput = document.createElement("input");
      nameInput.id = "hilal-ws-name-input";
      nameInput.type = "text";
      nameInput.placeholder = "Workspace name";
      nameInput.value = initialName;
      box.appendChild(nameInput);

      const actions = document.createElement("div");
      actions.id = "hilal-ws-dialog-actions";
      box.appendChild(actions);

      overlay.appendChild(box);

      const close = () => overlay.remove();
      const getName = () => nameInput.value.trim();
      const getEmoji = () => selectedEmoji;

      document.documentElement.appendChild(overlay);
      nameInput.focus();
      nameInput.select();

      return { overlay, actions, nameInput, close, getName, getEmoji };
    }

    _showCreateDialog() {
      const { overlay, actions, nameInput, close, getName, getEmoji } =
        this._buildDialog("New Workspace", "🗂", "Workspace");

      const cancelBtn = this._makeMozBtn("Cancel");
      const createBtn = this._makeMozBtn("Create", "primary");

      cancelBtn.addEventListener("click", close);
      createBtn.addEventListener("click", () => {
        const name = getName();
        if (name) this.create(name, getEmoji());
        close();
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(createBtn);

      nameInput.addEventListener("keydown", e => {
        if (e.key === "Enter") createBtn.click();
        if (e.key === "Escape") close();
      });
    }

    _showRenameDialog(ws) {
      const { overlay, actions, nameInput, close, getName, getEmoji } =
        this._buildDialog("Edit Workspace", ws.emoji || "🗂", ws.name);

      const deleteBtn = this._makeMozBtn("Delete", "destructive");
      deleteBtn.id = "hilal-ws-dialog-delete";
      const cancelBtn = this._makeMozBtn("Cancel");
      const saveBtn = this._makeMozBtn("Save", "primary");

      deleteBtn.addEventListener("click", () => {
        if (window.confirm("Delete this workspace?")) {
          this.remove(ws.id);
        }
        close();
      });
      cancelBtn.addEventListener("click", close);
      saveBtn.addEventListener("click", () => {
        const name = getName();
        if (name) this.rename(ws.id, name, getEmoji());
        close();
      });

      actions.appendChild(deleteBtn);
      actions.appendChild(cancelBtn);
      actions.appendChild(saveBtn);

      nameInput.addEventListener("keydown", e => {
        if (e.key === "Enter") saveBtn.click();
        if (e.key === "Escape") close();
      });
    }

    _getCSS() {
      return `
        #hilal-workspace-strip {
          padding-inline: var(--space-medium);
          padding-block: var(--space-xxsmall);
          border-bottom: var(--tabstrip-inner-border);
          box-sizing: border-box;
        }

        #hilal-ws-list {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: var(--space-xxsmall);
          align-items: center;
          padding-block: var(--space-xxsmall);
        }

        .hilal-ws-btn,
        #hilal-ws-add {
          appearance: none;
          display: flex;
          align-items: center;
          justify-content: center;
          width: var(--button-size-icon);
          height: var(--button-size-icon);
          min-width: var(--button-size-icon);
          padding: 0;
          border: none;
          border-radius: var(--button-border-radius);
          background: var(--button-background-color-ghost);
          color: var(--toolbarbutton-icon-fill);
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          box-sizing: border-box;
          font-family: inherit;
          flex-shrink: 0;
        }

        .hilal-ws-btn:hover,
        #hilal-ws-add:hover {
          background: var(--button-background-color-ghost-hover);
        }

        .hilal-ws-btn.hilal-ws-active {
          background: var(--button-background-color-ghost-selected);
        }

        :host(:not([expanded])) #hilal-workspace-strip {
          padding-inline: var(--space-xsmall);
          align-items: center;
        }

        :host(:not([expanded])) #hilal-ws-list {
          flex-direction: column;
          flex-wrap: nowrap;
          align-items: center;
        }
      `;
    }

    _getDialogCSS() {
      return `
        #hilal-ws-dialog-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          background: color-mix(in srgb, currentColor 30%, transparent);
        }
        #hilal-ws-dialog {
          background: var(--panel-background-color);
          color: inherit;
          border: 1px solid var(--panel-border-color);
          border-radius: var(--panel-border-radius);
          padding: var(--space-xlarge, 20px);
          width: 320px;
          max-width: 90vw;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          display: flex;
          flex-direction: column;
          gap: var(--space-medium, 12px);
          font-size: var(--font-size-small);
        }
        #hilal-ws-dialog h3 {
          margin: 0;
          font-size: var(--font-size-large, 15px);
          font-weight: 600;
        }
        #hilal-ws-dialog label {
          font-size: var(--font-size-small);
          font-weight: 500;
          opacity: 0.7;
        }
        #hilal-ws-name-input {
          appearance: auto;
          padding: var(--space-small) var(--space-medium);
          border: 1px solid var(--border-color, ThreeDShadow);
          border-radius: var(--button-border-radius);
          background: Field;
          color: FieldText;
          font: inherit;
          font-size: var(--font-size-small);
        }
        #hilal-ws-name-input:focus {
          outline: var(--focus-outline);
          outline-offset: var(--focus-outline-offset);
        }
        #hilal-ws-emoji-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xxsmall);
          max-height: 130px;
          overflow-y: auto;
        }
        .hilal-ws-emoji-btn {
          appearance: none;
          border: none;
          background: var(--button-background-color-ghost);
          border-radius: var(--button-border-radius);
          cursor: pointer;
          font-size: 18px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hilal-ws-emoji-btn:hover {
          background: var(--button-background-color-ghost-hover);
        }
        .hilal-ws-emoji-btn.hilal-ws-emoji-selected {
          background: var(--button-background-color-ghost-selected);
          outline: var(--focus-outline);
          outline-offset: var(--focus-outline-offset);
        }
        #hilal-ws-dialog-actions {
          display: flex;
          gap: var(--space-small);
          justify-content: flex-end;
          align-items: center;
        }
        #hilal-ws-dialog-delete {
          margin-inline-end: auto;
        }
      `;
    }

    _buildUI() {
      const sidebarEl = document.querySelector("sidebar-main");
      if (!sidebarEl || !sidebarEl.shadowRoot) return;

      this._shadowRoot = sidebarEl.shadowRoot;
      const wrap = this._shadowRoot.querySelector(".wrapper");
      const buttonsWrapper = wrap?.querySelector(".buttons-wrapper");
      if (!wrap || !buttonsWrapper) return;

      const style = document.createElement("style");
      style.id = "hilal-workspaces-style";
      style.textContent = this._getCSS();
      this._shadowRoot.appendChild(style);

      const dialogStyle = document.createElement("style");
      dialogStyle.id = "hilal-ws-dialog-style";
      dialogStyle.textContent = this._getDialogCSS();
      document.head.appendChild(dialogStyle);

      this._container = document.createElement("div");
      this._container.id = "hilal-workspace-strip";

      const list = document.createElement("div");
      list.id = "hilal-ws-list";
      this._container.appendChild(list);

      this._addBtn = document.createElement("button");
      this._addBtn.id = "hilal-ws-add";
      this._addBtn.title = "New workspace";
      this._addBtn.textContent = "+";
      this._addBtn.addEventListener("click", () => this._showCreateDialog());

      if (wrap && buttonsWrapper) {
        wrap.insertBefore(this._container, buttonsWrapper);
      }
      this._updateUI();
    }

    _updateUI() {
      if (!this._container) return;
      const list = this._container.querySelector("#hilal-ws-list");
      if (!list) return;
      list.textContent = "";

      for (const ws of this._workspaces) {
        const btn = document.createElement("button");
        btn.className = "hilal-ws-btn" + (ws.id === this._activeId ? " hilal-ws-active" : "");
        btn.dataset.wsId = ws.id;
        btn.title = ws.name;
        btn.textContent = ws.emoji || "🗂";
        btn.addEventListener("click", () => this.switchTo(ws.id));
        btn.addEventListener("contextmenu", e => {
          e.preventDefault();
          this._showRenameDialog(ws);
        });
        list.appendChild(btn);
      }

      if (this._addBtn) list.appendChild(this._addBtn);
    }
  }

  let retries = 0;
  function tryInit() {
    const sidebarEl = document.querySelector("sidebar-main");
    const hasShadowRoot = sidebarEl?.shadowRoot?.querySelector(".buttons-wrapper");
    if (typeof gBrowser !== "undefined" && hasShadowRoot) {
      window.gHilalWorkspaces = new HilalWorkspaces();
      window.gHilalWorkspaces.init();
      return;
    }
    if (++retries < INIT_MAX_RETRIES) {
      setTimeout(tryInit, 100);
    } else {
      console.warn("HilalWorkspaces: gave up waiting for sidebar-main shadow root");
    }
  }

  if (document.readyState === "complete") {
    tryInit();
  } else {
    window.addEventListener("load", tryInit, { once: true });
  }
})();
