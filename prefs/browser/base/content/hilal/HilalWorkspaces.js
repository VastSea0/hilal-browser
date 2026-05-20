/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global ContextualIdentityService, gBrowser, SessionStore */

(function () {
  "use strict";

  const PREF_DATA = "hilal.workspaces.data";
  const PREF_ACTIVE = "hilal.workspaces.active";
  const PREF_ENABLED = "hilal.workspaces.enabled";
  const STORE_KEY = "hilalWorkspace";
  const PINNED_KEY = "hilalWorkspacePinned";
  const HIDDEN_BY = "hilal-workspace";
  const TAB_DROP_TYPE = "application/x-moz-tabbrowser-tab";
  const DEFAULT_WORKSPACE_ID = "default";
  const DEFAULT_WORKSPACE_NAME = "Default";
  const DEFAULT_EMOJI = "\u{1F5C2}";
  const DEFAULT_COLOR = "purple";
  const CONTAINER_NAME_PREFIX = "Hilal Workspace";
  const INIT_MAX_RETRIES = 80;
  const MAX_NAME_LENGTH = 64;

  const EMOJIS = [
    "\u{1F5C2}", "\u{1F3E0}", "\u{1F4BC}", "\u{1F3A8}", "\u{1F4DA}", "\u{1F6E0}", "\u{1F3B5}", "\u{1F310}", "\u{1F4A1}", "\u{1F52C}",
    "\u{1F3AE}", "\u{1F4DD}", "\u{1F3AF}", "\u{1F680}", "\u{1F319}", "\u{2615}", "\u{1F34E}", "\u{1F30D}", "\u{1F512}", "\u{26A1}",
    "\u{1F525}", "\u{2744}\u{FE0F}", "\u{1F33F}", "\u{1F431}", "\u{1F436}", "\u{1F98A}", "\u{1F981}", "\u{1F427}", "\u{1F984}", "\u{1F308}",
    "\u{2B50}", "\u{1F31F}", "\u{1F48E}", "\u{1F381}", "\u{1F380}", "\u{1F3C6}", "\u{1F947}", "\u{1F396}", "\u{1F3C5}", "\u{1F6A9}",
    "\u{1F4CC}", "\u{1F4CE}", "\u{1F4D0}", "\u{1F527}", "\u{1F528}", "\u{2699}\u{FE0F}", "\u{1F48A}", "\u{1F9EA}", "\u{1F9EC}", "\u{1F9EE}"
  ];

  const WORKSPACE_COLORS = [
    "purple",
    "blue",
    "turquoise",
    "green",
    "yellow",
    "orange",
    "red",
    "pink",
  ];

  const COLOR_VALUES = {
    blue: "#37adff",
    turquoise: "#00c79a",
    green: "#51cd00",
    yellow: "#ffcb00",
    orange: "#ff9f00",
    red: "#ff613d",
    pink: "#ff4bda",
    purple: "#af51f5",
  };

  class HilalWorkspaces {
    constructor() {
      this._workspaces = [];
      this._activeId = "";
      this._enabled = true;
      this._container = null;
      this._addBtn = null;
      this._shadowRoot = null;
      this._tabOpenHandler = null;
      this._tabRestoreHandler = null;
      this._tabPinnedHandler = null;
      this._keyDownHandler = null;
      this._prefDataObserver = null;
      this._prefActiveObserver = null;
      this._prefEnabledObserver = null;
      this._savingData = false;
      this._savingActive = false;
      this._retargetingTabs = new WeakSet();
    }

    _warn(message, error = null) {
      if (error) {
        console.warn(`HilalWorkspaces: ${message}`, error);
      } else {
        console.warn(`HilalWorkspaces: ${message}`);
      }
    }

    _uuid() {
      try {
        return `ws-${Services.uuid.generateUUID().toString().slice(1, -1)}`;
      } catch (e) {
        return `ws-${Math.random().toString(36).slice(2, 9)}${Date.now()
          .toString(36)
          .slice(-4)}`;
      }
    }

    get _pinnedIsPublic() {
      return Services.prefs.getBoolPref("hilal.workspaces.pinned.public", false);
    }

    get _groupsIsPublic() {
      return Services.prefs.getBoolPref("hilal.workspaces.groups.public", false);
    }

    _normalizeName(name, fallback) {
      const normalized = String(name || fallback || "Workspace")
        .replace(/\s+/g, " ")
        .trim();
      return (normalized || fallback || "Workspace").slice(0, MAX_NAME_LENGTH);
    }

    _normalizeChoice(value, choices, fallback) {
      return choices.includes(value) ? value : fallback;
    }

    _defaultEmoji(index) {
      return EMOJIS[index % EMOJIS.length];
    }

    _defaultColor(index) {
      return WORKSPACE_COLORS[index % WORKSPACE_COLORS.length];
    }

    _normalizeWorkspace(raw, index, seenIds) {
      if (!raw || typeof raw !== "object") {
        return null;
      }

      const id =
        typeof raw.id === "string" && raw.id.trim()
          ? raw.id.trim()
          : this._uuid();
      if (seenIds.has(id)) {
        return null;
      }
      seenIds.add(id);

      const fallbackName =
        id === DEFAULT_WORKSPACE_ID ? DEFAULT_WORKSPACE_NAME : "Workspace";
      const emojiFallback = this._defaultEmoji(index);
      const colorFallback = this._defaultColor(index);
      const containerId = Number.isInteger(raw.containerId)
        ? raw.containerId
        : Number.parseInt(raw.containerId, 10) || 0;

      let emoji = typeof raw.emoji === "string" && raw.emoji.trim()
        ? raw.emoji.trim()
        : "";
      if (!emoji && typeof raw.icon === "string" && raw.icon.trim()) {
        const potentialEmoji = raw.icon.trim();
        if (EMOJIS.includes(potentialEmoji)) {
          emoji = potentialEmoji;
        }
      }

      return {
        id,
        name: this._normalizeName(raw.name, fallbackName),
        emoji: this._normalizeChoice(emoji, EMOJIS, emojiFallback),
        color: this._normalizeChoice(
          raw.color,
          WORKSPACE_COLORS,
          colorFallback
        ),
        containerId,
      };
    }

    _defaultWorkspace() {
      return {
        id: DEFAULT_WORKSPACE_ID,
        name: DEFAULT_WORKSPACE_NAME,
        emoji: DEFAULT_EMOJI,
        color: DEFAULT_COLOR,
        containerId: 0,
      };
    }

    _loadData() {
      const rawPref = Services.prefs.getStringPref(PREF_DATA, "[]");
      let parsed = [];

      try {
        parsed = JSON.parse(rawPref);
        if (!Array.isArray(parsed)) {
          throw new Error("Workspace pref is not an array");
        }
      } catch (e) {
        this._warn("invalid workspace data pref; resetting to defaults", e);
      }

      const seenIds = new Set();
      this._workspaces = parsed
        .map((raw, index) => this._normalizeWorkspace(raw, index, seenIds))
        .filter(Boolean);

      if (!this._workspaces.length) {
        this._workspaces.push(this._defaultWorkspace());
      }

      let changed = rawPref !== JSON.stringify(this._workspaces);
      changed = this._ensureWorkspaceContainers() || changed;
      if (changed) {
        this._saveData();
      }

      this._activeId = Services.prefs.getStringPref(
        PREF_ACTIVE,
        this._workspaces[0].id
      );
      if (!this._getWorkspaceById(this._activeId)) {
        this._activeId = this._workspaces[0].id;
        this._saveActive();
      }
    }

    _saveData() {
      this._savingData = true;
      try {
        Services.prefs.setStringPref(
          PREF_DATA,
          JSON.stringify(this._workspaces)
        );
      } catch (e) {
        this._warn("failed to persist workspace data", e);
      } finally {
        this._savingData = false;
      }
    }

    _saveActive() {
      this._savingActive = true;
      try {
        Services.prefs.setStringPref(PREF_ACTIVE, this._activeId);
      } catch (e) {
        this._warn("failed to persist active workspace", e);
      } finally {
        this._savingActive = false;
      }
    }

    _getWorkspaceById(id) {
      return this._workspaces.find(workspace => workspace.id === id);
    }

    _workspaceContainerName(workspace) {
      return `${CONTAINER_NAME_PREFIX} - ${workspace.name}`;
    }

    _getIdentity(userContextId) {
      if (!userContextId || typeof ContextualIdentityService === "undefined") {
        return null;
      }
      try {
        return ContextualIdentityService.getPublicIdentityFromId(userContextId);
      } catch (e) {
        this._warn(`failed to read container ${userContextId}`, e);
        return null;
      }
    }

    _ensureWorkspaceContainers() {
      if (typeof ContextualIdentityService === "undefined") {
        this._warn("ContextualIdentityService is unavailable");
        return false;
      }

      let changed = false;
      for (const workspace of this._workspaces) {
        let identity = this._getIdentity(workspace.containerId);
        if (!identity) {
          try {
            identity = ContextualIdentityService.create(
              this._workspaceContainerName(workspace),
              "circle",
              workspace.color
            );
            workspace.containerId = identity.userContextId;
            changed = true;
          } catch (e) {
            workspace.containerId = 0;
            this._warn(`failed to create container for ${workspace.name}`, e);
            continue;
          }
        }

        const name = this._workspaceContainerName(workspace);
        if (
          identity.name !== name ||
          identity.icon !== "circle" ||
          identity.color !== workspace.color
        ) {
          try {
            ContextualIdentityService.update(
              workspace.containerId,
              name,
              "circle",
              workspace.color
            );
          } catch (e) {
            this._warn(`failed to update container for ${workspace.name}`, e);
          }
        }
      }

      return changed;
    }

    _removeWorkspaceContainer(workspace) {
      if (
        !workspace?.containerId ||
        typeof ContextualIdentityService === "undefined"
      ) {
        return;
      }
      try {
        ContextualIdentityService.remove(workspace.containerId);
      } catch (e) {
        this._warn(`failed to remove container for ${workspace.name}`, e);
      }
    }

    init() {
      this._loadData();
      this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
      this._buildUI();
      this._hookEvents();
      this._updateUI();
      this._apply();
      if (!this._enabled && this._container) {
        this._container.hidden = true;
      }
    }

    _hookEvents() {
      this._tabOpenHandler = event => {
        if (!this._enabled) {
          return;
        }

        const tab = event.target;
        const inferredWorkspace =
          this._workspaceIdForContainer(tab.userContextId) || this._activeId;
        this._setTabWorkspace(tab, inferredWorkspace);
        this._scheduleContainerRetarget(tab, inferredWorkspace);
      };
      gBrowser.tabContainer.addEventListener("TabOpen", this._tabOpenHandler);

      this._tabRestoreHandler = event => {
        if (!this._enabled || typeof SessionStore === "undefined") {
          return;
        }

        const tab = event.target;
        const workspaceId =
          SessionStore.getCustomTabValue(tab, STORE_KEY) ||
          this._workspaceIdForContainer(tab.userContextId) ||
          this._activeId;
        this._setTabWorkspace(tab, workspaceId);
        this._scheduleContainerRetarget(tab, workspaceId);
        this._apply();
      };
      gBrowser.tabContainer.addEventListener(
        "SSTabRestored",
        this._tabRestoreHandler
      );

      this._tabPinnedHandler = event => {
        if (!this._enabled) {
          return;
        }
        const tab = event.target;
        if (!this._pinnedIsPublic && this._getTabWorkspace(tab) !== this._activeId) {
          this._rememberPinned(tab);
        }
        this._apply();
      };
      gBrowser.tabContainer.addEventListener(
        "TabPinned",
        this._tabPinnedHandler
      );

      this._keyDownHandler = event => this._handleKeyDown(event);
      window.addEventListener("keydown", this._keyDownHandler, true);

      this._prefDataObserver = () => {
        if (this._savingData) {
          return;
        }
        this._loadData();
        this._updateUI();
        this._apply();
      };
      Services.prefs.addObserver(PREF_DATA, this._prefDataObserver);

      this._prefActiveObserver = () => {
        if (this._savingActive) {
          return;
        }
        const nextActive = Services.prefs.getStringPref(
          PREF_ACTIVE,
          this._activeId
        );
        if (
          nextActive !== this._activeId &&
          this._getWorkspaceById(nextActive)
        ) {
          this._activeId = nextActive;
          this._updateUI();
          this._apply();
        }
      };
      Services.prefs.addObserver(PREF_ACTIVE, this._prefActiveObserver);

      this._prefEnabledObserver = () => {
        this._enabled = Services.prefs.getBoolPref(PREF_ENABLED, true);
        if (this._container) {
          this._container.hidden = !this._enabled;
        }
        this._apply();
      };
      Services.prefs.addObserver(PREF_ENABLED, this._prefEnabledObserver);

      this._prefPinnedPublicObserver = () => {
        this._apply();
      };
      Services.prefs.addObserver(
        "hilal.workspaces.pinned.public",
        this._prefPinnedPublicObserver
      );

      this._prefGroupsPublicObserver = () => {
        this._apply();
      };
      Services.prefs.addObserver(
        "hilal.workspaces.groups.public",
        this._prefGroupsPublicObserver
      );

      this._tabGroupedHandler = () => {
        if (this._enabled) {
          this._apply();
        }
      };
      gBrowser.tabContainer.addEventListener(
        "TabGrouped",
        this._tabGroupedHandler
      );
      gBrowser.tabContainer.addEventListener(
        "TabUngrouped",
        this._tabGroupedHandler
      );

      window.addEventListener("unload", () => this._destroy(), { once: true });
    }

    _destroy() {
      if (this._tabOpenHandler) {
        gBrowser.tabContainer.removeEventListener(
          "TabOpen",
          this._tabOpenHandler
        );
      }
      if (this._tabRestoreHandler) {
        gBrowser.tabContainer.removeEventListener(
          "SSTabRestored",
          this._tabRestoreHandler
        );
      }
      if (this._tabPinnedHandler) {
        gBrowser.tabContainer.removeEventListener(
          "TabPinned",
          this._tabPinnedHandler
        );
      }
      if (this._tabGroupedHandler) {
        gBrowser.tabContainer.removeEventListener(
          "TabGrouped",
          this._tabGroupedHandler
        );
        gBrowser.tabContainer.removeEventListener(
          "TabUngrouped",
          this._tabGroupedHandler
        );
      }
      if (this._keyDownHandler) {
        window.removeEventListener("keydown", this._keyDownHandler, true);
      }
      if (this._prefDataObserver) {
        Services.prefs.removeObserver(PREF_DATA, this._prefDataObserver);
      }
      if (this._prefActiveObserver) {
        Services.prefs.removeObserver(PREF_ACTIVE, this._prefActiveObserver);
      }
      if (this._prefEnabledObserver) {
        Services.prefs.removeObserver(PREF_ENABLED, this._prefEnabledObserver);
      }
      if (this._prefPinnedPublicObserver) {
        Services.prefs.removeObserver(
          "hilal.workspaces.pinned.public",
          this._prefPinnedPublicObserver
        );
      }
      if (this._prefGroupsPublicObserver) {
        Services.prefs.removeObserver(
          "hilal.workspaces.groups.public",
          this._prefGroupsPublicObserver
        );
      }
      this._closeOpenSurfaces();
      this._container?.remove();
      this._shadowRoot?.getElementById("hilal-workspaces-style")?.remove();
      document.getElementById("hilal-ws-dialog-style")?.remove();
    }

    _getTabWorkspace(tab) {
      let workspaceId = tab.getAttribute("hilal-workspace");
      if (!workspaceId && typeof SessionStore !== "undefined") {
        workspaceId = SessionStore.getCustomTabValue(tab, STORE_KEY);
      }
      if (!this._getWorkspaceById(workspaceId)) {
        workspaceId =
          this._workspaceIdForContainer(tab.userContextId) ||
          this._activeId ||
          DEFAULT_WORKSPACE_ID;
      }
      this._setTabWorkspace(tab, workspaceId);
      return workspaceId;
    }

    _setTabWorkspace(tab, workspaceId) {
      if (!tab || !this._getWorkspaceById(workspaceId)) {
        return;
      }
      tab.setAttribute("hilal-workspace", workspaceId);
      if (typeof SessionStore !== "undefined") {
        SessionStore.setCustomTabValue(tab, STORE_KEY, workspaceId);
      }
    }

    _workspaceIdForContainer(userContextId) {
      if (!userContextId) {
        return "";
      }
      return (
        this._workspaces.find(
          workspace => workspace.containerId === userContextId
        )?.id || ""
      );
    }

    _isHiddenByWorkspace(tab) {
      if (!tab.hidden || typeof SessionStore === "undefined") {
        return false;
      }
      return SessionStore.getCustomTabValue(tab, "hiddenBy") === HIDDEN_BY;
    }

    _showWorkspaceTab(tab) {
      if (this._isHiddenByWorkspace(tab)) {
        gBrowser.showTab(tab);
      }
      this._restorePinned(tab);
    }

    _hideWorkspaceTab(tab) {
      if (tab.selected || tab.closing) {
        return;
      }
      if (tab.pinned) {
        this._rememberPinned(tab);
        gBrowser.unpinTab(tab);
      }
      gBrowser.hideTab(tab, HIDDEN_BY);
    }

    _rememberPinned(tab) {
      if (typeof SessionStore !== "undefined") {
        SessionStore.setCustomTabValue(tab, PINNED_KEY, "true");
      }
    }

    _restorePinned(tab) {
      if (typeof SessionStore === "undefined" || tab.pinned) {
        return;
      }
      if (SessionStore.getCustomTabValue(tab, PINNED_KEY) === "true") {
        SessionStore.deleteCustomTabValue(tab, PINNED_KEY);
        gBrowser.pinTab(tab);
      }
    }

    _createWorkspaceTab(workspaceId, { select = true } = {}) {
      const workspace = this._getWorkspaceById(workspaceId);
      if (!workspace) {
        return null;
      }
      const tab = gBrowser.addTrustedTab("about:newtab", {
        allowInheritPrincipal: true,
        inBackground: !select,
        userContextId: workspace.containerId || 0,
      });
      if (tab) {
        this._setTabWorkspace(tab, workspaceId);
        if (select) {
          gBrowser.selectedTab = tab;
        }
      }
      return tab;
    }

    _needsContainerRetarget(tab, workspaceId) {
      const workspace = this._getWorkspaceById(workspaceId);
      if (
        !this._enabled ||
        !workspace?.containerId ||
        tab.userContextId === workspace.containerId ||
        tab.closing
      ) {
        return false;
      }

      // Do not retarget privileged browser pages (about:, chrome:, resource:) as they cannot load in containers
      const spec = tab.linkedBrowser?.currentURI?.spec || "";
      if (/^(about|chrome|resource):/i.test(spec)) {
        if (!/^(about:newtab|about:blank|about:home)$/i.test(spec)) {
          return false;
        }
      }

      return true;
    }

    _scheduleContainerRetarget(tab, workspaceId) {
      if (
        !this._needsContainerRetarget(tab, workspaceId) ||
        this._retargetingTabs.has(tab)
      ) {
        return;
      }

      this._retargetingTabs.add(tab);
      setTimeout(() => {
        this._retargetingTabs.delete(tab);
        if (
          tab.isConnected &&
          !tab.closing &&
          this._getTabWorkspace(tab) === workspaceId &&
          this._needsContainerRetarget(tab, workspaceId)
        ) {
          this._moveTabToWorkspace(tab, workspaceId, {
            copy: false,
            select: tab.selected,
          });
        }
      }, 0);
    }

    _moveTabToWorkspace(
      tab,
      workspaceId,
      { copy = false, select = false } = {}
    ) {
      const workspace = this._getWorkspaceById(workspaceId);
      if (!tab || !workspace || tab.closing) {
        return null;
      }

      const targetUserContextId = workspace.containerId || 0;
      const sourceWasSelected = tab === gBrowser.selectedTab;
      const sourceWasPinned =
        tab.pinned ||
        (typeof SessionStore !== "undefined" &&
          SessionStore.getCustomTabValue(tab, PINNED_KEY) === "true");

      if (!copy && tab.userContextId === targetUserContextId) {
        this._setTabWorkspace(tab, workspaceId);
        this._apply();
        return tab;
      }

      let newTab = null;
      let isFreshNewTab = false;
      let state = null;
      try {
        if (typeof SessionStore !== "undefined") {
          state = JSON.parse(SessionStore.getTabState(tab));
          const entries = state.entries || [];
          if (
            entries.length === 0 ||
            (entries.length === 1 &&
              (entries[0].url === "about:blank" ||
                entries[0].url === "about:newtab" ||
                entries[0].url === "about:home"))
          ) {
            isFreshNewTab = true;
          }
        }
      } catch (e) {
        // Ignored
      }

      if (isFreshNewTab) {
        newTab = gBrowser.addTrustedTab("about:newtab", {
          inBackground: !(select || sourceWasSelected),
          tabIndex: tab._tPos + 1,
          userContextId: targetUserContextId,
        });
        this._setTabWorkspace(newTab, workspaceId);
      } else {
        try {
          if (!state && typeof SessionStore !== "undefined") {
            state = JSON.parse(SessionStore.getTabState(tab));
          }
          if (state) {
            state.userContextId = targetUserContextId;
            state.pinned = false;
            state.hidden = false;
            delete state.groupId;
            delete state.splitViewId;
            state.extData = state.extData || {};
            state.extData[STORE_KEY] = workspaceId;
            if (sourceWasPinned) {
              state.extData[PINNED_KEY] = "true";
            } else {
              delete state.extData[PINNED_KEY];
            }

            newTab = gBrowser.addTrustedTab("about:blank", {
              inBackground: !(select || sourceWasSelected),
              skipLoad: true,
              tabIndex: tab._tPos + 1,
              userContextId: targetUserContextId,
            });
            this._setTabWorkspace(newTab, workspaceId);
            SessionStore.setTabState(newTab, JSON.stringify(state));
          } else {
            throw new Error("SessionStore unavailable or failed");
          }
        } catch (e) {
          this._warn(
            "failed to preserve tab state while moving workspace tab",
            e
          );
          const uri = tab.linkedBrowser?.currentURI?.spec || "about:newtab";
          newTab = gBrowser.addWebTab(uri, {
            inBackground: !(select || sourceWasSelected),
            tabIndex: tab._tPos + 1,
            userContextId: targetUserContextId,
          });
          this._setTabWorkspace(newTab, workspaceId);
          if (sourceWasPinned) {
            this._rememberPinned(newTab);
          }
        }
      }

      if (!newTab) {
        return null;
      }

      this._setTabWorkspace(newTab, workspaceId);
      if (select || sourceWasSelected) {
        gBrowser.selectedTab = newTab;
      }
      if (!copy && tab.isConnected && !tab.closing) {
        gBrowser.removeTab(tab, { animate: false });
      }
      this._apply();
      return newTab;
    }

    _apply() {
      if (!this._enabled) {
        for (const tab of gBrowser.tabs) {
          if (this._isHiddenByWorkspace(tab)) {
            gBrowser.showTab(tab);
          }
        }
        for (const group of gBrowser.tabGroups) {
          group.removeAttribute("collapsed");
          group.removeAttribute("hidden");
        }
        return;
      }

      this._ensureWorkspaceContainers();

      const selected = gBrowser.selectedTab;
      const selectedWorkspace = this._getTabWorkspace(selected);
      const activeTabs = [];
      const pinnedIsPublic = this._pinnedIsPublic;
      const groupsIsPublic = this._groupsIsPublic;

      for (const tab of gBrowser.tabs) {
        const workspaceId = this._getTabWorkspace(tab);
        const isPinnedSession =
          typeof SessionStore !== "undefined" &&
          SessionStore.getCustomTabValue(tab, PINNED_KEY) === "true";
        const isTabPinned = tab.pinned || isPinnedSession;
        const isTabGrouped = !!tab.group;

        if (
          workspaceId === this._activeId ||
          (pinnedIsPublic && isTabPinned) ||
          (groupsIsPublic && isTabGrouped)
        ) {
          if (!tab.hidden || this._isHiddenByWorkspace(tab)) {
            this._showWorkspaceTab(tab);
            activeTabs.push(tab);
          }
          if (pinnedIsPublic && isPinnedSession) {
            this._restorePinned(tab);
          }
          this._scheduleContainerRetarget(tab, workspaceId);
        } else if (tab.pinned) {
          this._rememberPinned(tab);
          gBrowser.unpinTab(tab);
        }
      }

      let nextSelected = activeTabs.find(tab => !tab.closing) || null;
      if (!nextSelected) {
        nextSelected = this._createWorkspaceTab(this._activeId, {
          select: false,
        });
      }

      if (
        nextSelected &&
        (selectedWorkspace !== this._activeId ||
          selected.hidden ||
          selected.closing)
      ) {
        if (!(pinnedIsPublic && selected.pinned) && !(groupsIsPublic && selected.group)) {
          gBrowser.selectedTab = nextSelected;
        }
      }

      for (const tab of gBrowser.tabs) {
        if (this._getTabWorkspace(tab) !== this._activeId) {
          if (pinnedIsPublic && tab.pinned) {
            continue;
          }
          if (groupsIsPublic && tab.group) {
            continue;
          }
          this._hideWorkspaceTab(tab);
        }
      }

      for (const group of gBrowser.tabGroups) {
        const hasVisibleTab = group.tabs.some(tab => !tab.hidden);
        if (hasVisibleTab) {
          group.removeAttribute("collapsed");
          group.removeAttribute("hidden");
        } else {
          group.setAttribute("collapsed", "true");
          group.setAttribute("hidden", "true");
        }
      }
    }

    switchTo(id) {
      if (id === this._activeId) {
        return;
      }
      if (!this._getWorkspaceById(id)) {
        return;
      }
      this._activeId = id;
      this._saveActive();
      this._updateUI();
      this._apply();
    }

    create(name, emoji, color) {
      const index = this._workspaces.length;
      const workspace = {
        id: this._uuid(),
        name: this._normalizeName(name, "Workspace"),
        emoji: this._normalizeChoice(
          emoji,
          EMOJIS,
          this._defaultEmoji(index)
        ),
        color: this._normalizeChoice(
          color,
          WORKSPACE_COLORS,
          this._defaultColor(index)
        ),
        containerId: 0,
      };
      this._workspaces.push(workspace);
      this._ensureWorkspaceContainers();
      this._saveData();
      this._updateUI();
      this.switchTo(workspace.id);
    }

    rename(id, name, emoji, color) {
      const workspace = this._getWorkspaceById(id);
      if (!workspace) {
        return;
      }
      workspace.name = this._normalizeName(name, workspace.name);
      workspace.emoji = this._normalizeChoice(
        emoji,
        EMOJIS,
        workspace.emoji
      );
      workspace.color = this._normalizeChoice(
        color,
        WORKSPACE_COLORS,
        workspace.color
      );
      this._ensureWorkspaceContainers();
      this._saveData();
      this._updateUI();
    }

    remove(id) {
      if (this._workspaces.length <= 1) {
        return;
      }

      const index = this._workspaces.findIndex(
        workspace => workspace.id === id
      );
      if (index < 0) {
        return;
      }

      const workspace = this._workspaces[index];
      const fallback = this._workspaces.find(candidate => candidate.id !== id);
      if (!fallback) {
        return;
      }

      const tabsToMove = [...gBrowser.tabs].filter(
        tab => this._getTabWorkspace(tab) === id
      );
      for (const tab of tabsToMove) {
        this._moveTabToWorkspace(tab, fallback.id, {
          copy: false,
          select: tab.selected,
        });
      }

      this._workspaces.splice(index, 1);
      if (this._activeId === id) {
        this._activeId = fallback.id;
        this._saveActive();
      }
      this._removeWorkspaceContainer(workspace);
      this._saveData();
      this._updateUI();
      this._apply();
    }

    _isEditableTarget(target) {
      if (!target) {
        return false;
      }
      const localName = target.localName;
      return (
        target.isContentEditable ||
        localName === "input" ||
        localName === "textarea" ||
        localName === "select" ||
        target.closest?.("input, textarea, select, [contenteditable='true']")
      );
    }

    _handleKeyDown(event) {
      if (!this._enabled || event.defaultPrevented) {
        return;
      }
      if (this._isEditableTarget(event.originalTarget || event.target)) {
        return;
      }

      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        /^Digit[1-9]$/.test(event.code)
      ) {
        const index = Number.parseInt(event.code.replace("Digit", ""), 10) - 1;
        const workspace = this._workspaces[index];
        if (workspace) {
          event.preventDefault();
          this.switchTo(workspace.id);
        }
      }

      if (
        event.altKey &&
        event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.code === "KeyN"
      ) {
        event.preventDefault();
        this._showCreateDialog();
      }
    }

    _makeMozBtn(label, type) {
      const button = document.createElement("moz-button");
      button.setAttribute("label", label);
      if (type) {
        button.setAttribute("type", type);
      }
      return button;
    }

    _closeOpenSurfaces() {
      document.getElementById("hilal-ws-dialog-overlay")?.remove();
      document.getElementById("hilal-ws-menu")?.remove();
    }

    _focusableElements(root) {
      return [...root.querySelectorAll("button, input, moz-button")].filter(
        element => !element.disabled && !element.hidden
      );
    }

    _trapFocus(event, root) {
      if (event.key !== "Tab") {
        return;
      }
      const focusable = this._focusableElements(root);
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    _buildDialog(titleText, initialWorkspace) {
      this._closeOpenSurfaces();

      const previousFocus = document.activeElement;
      const overlay = document.createElement("div");
      overlay.id = "hilal-ws-dialog-overlay";

      const box = document.createElement("div");
      box.id = "hilal-ws-dialog";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-modal", "true");
      box.setAttribute("aria-labelledby", "hilal-ws-dialog-title");

      const title = document.createElement("h3");
      title.id = "hilal-ws-dialog-title";
      title.textContent = titleText;
      box.appendChild(title);

      const emojiLabel = document.createElement("label");
      emojiLabel.textContent = "Emoji";
      emojiLabel.id = "hilal-ws-emoji-label";
      box.appendChild(emojiLabel);

      const emojiGrid = document.createElement("div");
      emojiGrid.id = "hilal-ws-emoji-grid";
      emojiGrid.setAttribute("role", "radiogroup");
      emojiGrid.setAttribute("aria-labelledby", emojiLabel.id);
      let selectedEmoji = initialWorkspace.emoji;
      for (const emoji of EMOJIS) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "hilal-ws-choice hilal-ws-emoji-choice";
        button.textContent = emoji;
        button.setAttribute("aria-label", emoji);
        button.setAttribute("role", "radio");
        button.setAttribute(
          "aria-checked",
          emoji === selectedEmoji ? "true" : "false"
        );
        button.dataset.emoji = emoji;
        if (emoji === selectedEmoji) {
          button.classList.add("hilal-ws-choice-selected");
        }
        button.addEventListener("click", () => {
          selectedEmoji = emoji;
          for (const choice of emojiGrid.querySelectorAll(".hilal-ws-choice")) {
            const selected = choice.dataset.emoji === emoji;
            choice.classList.toggle("hilal-ws-choice-selected", selected);
            choice.setAttribute("aria-checked", selected ? "true" : "false");
          }
        });
        emojiGrid.appendChild(button);
      }
      box.appendChild(emojiGrid);

      const colorLabel = document.createElement("label");
      colorLabel.textContent = "Color";
      colorLabel.id = "hilal-ws-color-label";
      box.appendChild(colorLabel);

      const colorGrid = document.createElement("div");
      colorGrid.id = "hilal-ws-color-grid";
      colorGrid.setAttribute("role", "radiogroup");
      colorGrid.setAttribute("aria-labelledby", colorLabel.id);
      let selectedColor = initialWorkspace.color;
      for (const color of WORKSPACE_COLORS) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `hilal-ws-choice hilal-ws-color-choice hilal-ws-color-${color}`;
        button.setAttribute("aria-label", color);
        button.setAttribute("role", "radio");
        button.setAttribute(
          "aria-checked",
          color === selectedColor ? "true" : "false"
        );
        button.dataset.color = color;
        if (color === selectedColor) {
          button.classList.add("hilal-ws-choice-selected");
        }
        button.addEventListener("click", () => {
          selectedColor = color;
          for (const choice of colorGrid.querySelectorAll(".hilal-ws-choice")) {
            const selected = choice.dataset.color === color;
            choice.classList.toggle("hilal-ws-choice-selected", selected);
            choice.setAttribute("aria-checked", selected ? "true" : "false");
          }
        });
        colorGrid.appendChild(button);
      }
      box.appendChild(colorGrid);

      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Name";
      nameLabel.htmlFor = "hilal-ws-name-input";
      box.appendChild(nameLabel);

      const nameInput = document.createElement("input");
      nameInput.id = "hilal-ws-name-input";
      nameInput.type = "text";
      nameInput.maxLength = MAX_NAME_LENGTH;
      nameInput.placeholder = "Workspace name";
      nameInput.value = initialWorkspace.name;
      box.appendChild(nameInput);

      const actions = document.createElement("div");
      actions.id = "hilal-ws-dialog-actions";
      box.appendChild(actions);
      overlay.appendChild(box);

      const close = () => {
        overlay.remove();
        previousFocus?.focus?.();
      };
      const getName = () => nameInput.value.trim();
      const getEmoji = () => selectedEmoji;
      const getColor = () => selectedColor;

      overlay.addEventListener("click", event => {
        if (event.target === overlay) {
          close();
        }
      });
      overlay.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        this._trapFocus(event, box);
      });

      document.documentElement.appendChild(overlay);
      nameInput.focus();
      nameInput.select();

      return { actions, nameInput, close, getName, getEmoji, getColor };
    }

    _showCreateDialog() {
      const index = this._workspaces.length;
      const dialog = this._buildDialog("New Workspace", {
        name: "Workspace",
        emoji: this._defaultEmoji(index),
        color: this._defaultColor(index),
      });
      const { actions, nameInput, close, getName, getEmoji, getColor } = dialog;

      const cancelBtn = this._makeMozBtn("Cancel");
      const createBtn = this._makeMozBtn("Create", "primary");
      const updateCreateState = () => {
        createBtn.disabled = !getName();
        nameInput.toggleAttribute("aria-invalid", !getName());
      };

      cancelBtn.addEventListener("click", close);
      createBtn.addEventListener("click", () => {
        if (getName()) {
          this.create(getName(), getEmoji(), getColor());
          close();
        }
      });
      nameInput.addEventListener("input", updateCreateState);
      nameInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && getName()) {
          createBtn.click();
        }
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(createBtn);
      updateCreateState();
    }

    _showRenameDialog(workspace) {
      const dialog = this._buildDialog("Edit Workspace", workspace);
      const { actions, nameInput, close, getName, getEmoji, getColor } = dialog;

      const deleteBtn = this._makeMozBtn("Delete", "destructive");
      deleteBtn.id = "hilal-ws-dialog-delete";
      deleteBtn.disabled = this._workspaces.length <= 1;
      const cancelBtn = this._makeMozBtn("Cancel");
      const saveBtn = this._makeMozBtn("Save", "primary");
      const updateSaveState = () => {
        saveBtn.disabled = !getName();
        nameInput.toggleAttribute("aria-invalid", !getName());
      };

      deleteBtn.addEventListener("click", () => {
        if (
          Services.prompt.confirm(
            window,
            "Delete Workspace",
            `Delete "${workspace.name}" and clear its isolated site data?`
          )
        ) {
          this.remove(workspace.id);
          close();
        }
      });
      cancelBtn.addEventListener("click", close);
      saveBtn.addEventListener("click", () => {
        if (getName()) {
          this.rename(workspace.id, getName(), getEmoji(), getColor());
          close();
        }
      });
      nameInput.addEventListener("input", updateSaveState);
      nameInput.addEventListener("keydown", event => {
        if (event.key === "Enter" && getName()) {
          saveBtn.click();
        }
      });

      actions.appendChild(deleteBtn);
      actions.appendChild(cancelBtn);
      actions.appendChild(saveBtn);
      updateSaveState();
    }

    _showWorkspaceMenu(workspace, anchor) {
      this._closeOpenSurfaces();

      const menu = document.createElement("div");
      menu.id = "hilal-ws-menu";
      menu.setAttribute("role", "menu");

      const addItem = (label, handler, { disabled = false } = {}) => {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent = label;
        item.setAttribute("role", "menuitem");
        item.disabled = disabled;
        item.addEventListener("click", () => {
          menu.remove();
          handler();
        });
        menu.appendChild(item);
        return item;
      };

      const currentTab = gBrowser.selectedTab;
      const currentWorkspace = this._getTabWorkspace(currentTab);
      addItem("Switch", () => this.switchTo(workspace.id), {
        disabled: workspace.id === this._activeId,
      });
      addItem(
        "Move Current Tab Here",
        () => this._moveTabToWorkspace(currentTab, workspace.id),
        { disabled: currentWorkspace === workspace.id }
      );
      addItem("Copy Current Tab Here", () =>
        this._moveTabToWorkspace(currentTab, workspace.id, { copy: true })
      );
      addItem("Edit", () => this._showRenameDialog(workspace));
      addItem(
        "Delete",
        () => {
          if (
            Services.prompt.confirm(
              window,
              "Delete Workspace",
              `Delete "${workspace.name}" and clear its isolated site data?`
            )
          ) {
            this.remove(workspace.id);
          }
        },
        { disabled: this._workspaces.length <= 1 }
      );

      const close = event => {
        if (!menu.contains(event.target)) {
          menu.remove();
          document.removeEventListener("mousedown", close, true);
        }
      };
      menu.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          event.preventDefault();
          menu.remove();
          anchor.focus();
        }
      });

      document.documentElement.appendChild(menu);
      const rect = anchor.getBoundingClientRect();
      menu.style.insetInlineStart = `${Math.round(rect.left)}px`;
      menu.style.insetBlockStart = `${Math.round(rect.bottom + 4)}px`;
      setTimeout(() => document.addEventListener("mousedown", close, true), 0);
      menu.querySelector("button:not(:disabled)")?.focus();
    }

    _getColorCSS() {
      return Object.entries(COLOR_VALUES)
        .map(
          ([color, value]) =>
            `.hilal-ws-color-${color} { --hilal-ws-accent: ${value}; }`
        )
        .join("\n");
    }

    _getCSS() {
      return `
        ${this._getColorCSS()}

        #hilal-workspace-strip {
          padding-inline: 0;
          padding-block: var(--space-xxsmall);
          border-bottom: var(--tabstrip-inner-border);
          box-sizing: border-box;
          flex-shrink: 0;
          overflow: hidden;
        }

        #hilal-ws-list {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: var(--space-xxsmall);
          align-items: center;
          padding-inline: 12px;
          padding-block: var(--space-xxsmall);
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 12px, black calc(100% - 12px), transparent);
        }

        #hilal-ws-list::-webkit-scrollbar {
          display: none;
        }

        .hilal-ws-btn,
        #hilal-ws-add {
          appearance: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--button-size-icon);
          height: var(--button-size-icon);
          border: 1px solid transparent;
          border-radius: var(--button-border-radius);
          background: var(--button-background-color-ghost);
          color: var(--toolbarbutton-icon-fill);
          cursor: pointer;
          font: inherit;
          font-size: var(--font-size-small);
          line-height: 1;
          box-sizing: border-box;
          padding: 0;
          flex-shrink: 0;
        }

        .hilal-ws-btn:hover,
        #hilal-ws-add:hover {
          background: var(--button-background-color-ghost-hover);
        }

        .hilal-ws-btn:focus-visible,
        #hilal-ws-add:focus-visible {
          outline: var(--focus-outline);
          outline-offset: var(--focus-outline-offset);
        }

        .hilal-ws-btn.hilal-ws-active {
          background: var(--button-background-color-ghost-selected);
          border-color: color-mix(in srgb, var(--hilal-ws-accent) 55%, transparent);
        }

        .hilal-ws-emoji {
          font-size: 16px;
          flex-shrink: 0;
        }

        .hilal-ws-label {
          display: none;
        }

        .hilal-ws-count {
          display: none;
        }

        .hilal-ws-btn.hilal-ws-drop-target {
          outline: var(--focus-outline);
          outline-offset: var(--focus-outline-offset);
        }

        :host(:not([expanded])) #hilal-workspace-strip {
          padding-inline: var(--space-xsmall);
        }

        :host(:not([expanded])) #hilal-ws-list {
          flex-direction: column;
          flex-wrap: nowrap;
          max-block-size: none;
          overflow: visible;
          padding-inline: 0;
          mask-image: none;
          -webkit-mask-image: none;
        }

        :host(:not([expanded])) .hilal-ws-btn,
        :host(:not([expanded])) #hilal-ws-add {
          width: var(--button-size-icon);
          height: var(--button-size-icon);
          padding: 0;
        }

        :host(:not([expanded])) .hilal-ws-label,
        :host(:not([expanded])) .hilal-ws-count {
          display: none;
        }
      `;
    }

    _getDialogCSS() {
      return `
        ${this._getColorCSS()}

        #hilal-ws-dialog-overlay {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          background: color-mix(in srgb, currentColor 30%, transparent);
        }

        #hilal-ws-dialog,
        #hilal-ws-menu {
          background: var(--panel-background-color);
          color: var(--panel-color);
          border: 1px solid var(--panel-border-color);
          border-radius: var(--panel-border-radius);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
          font: menu;
        }

        #hilal-ws-dialog {
          padding: var(--space-xlarge, 20px);
          width: 360px;
          max-width: 90vw;
          display: flex;
          flex-direction: column;
          gap: var(--space-medium, 12px);
        }

        #hilal-ws-dialog h3 {
          margin: 0;
          font-size: var(--font-size-large, 15px);
          font-weight: 600;
        }

        #hilal-ws-dialog label {
          font-size: var(--font-size-small);
          font-weight: 500;
          opacity: 0.8;
        }

        #hilal-ws-name-input {
          appearance: auto;
          padding: var(--space-small) var(--space-medium);
          border: 1px solid var(--border-color, ThreeDShadow);
          border-radius: var(--button-border-radius);
          background: Field;
          color: FieldText;
          font: inherit;
        }

        #hilal-ws-name-input:focus {
          outline: var(--focus-outline);
          outline-offset: var(--focus-outline-offset);
        }

        #hilal-ws-name-input[aria-invalid] {
          border-color: var(--red-50, #ff613d);
        }

        #hilal-ws-emoji-grid,
        #hilal-ws-color-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xxsmall);
        }

        #hilal-ws-emoji-grid {
          max-height: 130px;
          overflow-y: auto;
        }

        .hilal-ws-choice {
          appearance: none;
          border: 1px solid transparent;
          background: var(--button-background-color-ghost);
          border-radius: var(--button-border-radius);
          cursor: pointer;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hilal-ws-emoji-choice {
          font-size: 18px;
        }

        .hilal-ws-color-choice::before {
          content: "";
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--hilal-ws-accent);
        }

        .hilal-ws-choice:hover {
          background-color: var(--button-background-color-ghost-hover);
        }

        .hilal-ws-choice-selected {
          background-color: var(--button-background-color-ghost-selected);
          border-color: var(--focus-outline-color);
        }

        .hilal-ws-choice:focus-visible {
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

        #hilal-ws-menu {
          position: fixed;
          z-index: 100000;
          min-width: 220px;
          padding: var(--space-xxsmall);
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        #hilal-ws-menu > button {
          appearance: none;
          border: none;
          border-radius: var(--button-border-radius);
          background: transparent;
          color: inherit;
          padding: var(--space-small) var(--space-medium);
          text-align: start;
          font: inherit;
        }

        #hilal-ws-menu > button:hover,
        #hilal-ws-menu > button:focus-visible {
          background: var(--button-background-color-ghost-hover);
          outline: none;
        }

        #hilal-ws-menu > button:disabled {
          opacity: 0.45;
        }
      `;
    }

    _buildUI() {
      const sidebarEl = document.querySelector("sidebar-main");
      if (!sidebarEl?.shadowRoot) {
        return;
      }

      this._shadowRoot = sidebarEl.shadowRoot;
      const wrap = this._shadowRoot.querySelector(".wrapper");
      if (!wrap) {
        return;
      }

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
      list.setAttribute("role", "toolbar");
      list.setAttribute("aria-label", "Workspaces");
      this._container.appendChild(list);

      this._addBtn = document.createElement("button");
      this._addBtn.id = "hilal-ws-add";
      this._addBtn.type = "button";
      this._addBtn.title = "New workspace";
      this._addBtn.setAttribute("aria-label", "New workspace");
      this._addBtn.textContent = "+";
      this._addBtn.addEventListener("click", () => this._showCreateDialog());

      wrap.insertBefore(this._container, wrap.firstElementChild);
    }

    _countTabsForWorkspace(workspaceId) {
      let count = 0;
      for (const tab of gBrowser.tabs) {
        if (this._getTabWorkspace(tab) === workspaceId) {
          count++;
        }
      }
      return count;
    }

    _updateUI() {
      if (!this._container) {
        return;
      }
      const list = this._container.querySelector("#hilal-ws-list");
      if (!list) {
        return;
      }
      list.textContent = "";

      for (const workspace of this._workspaces) {
        const count = this._countTabsForWorkspace(workspace.id);
        const button = document.createElement("button");
        button.type = "button";
        button.className = [
          "hilal-ws-btn",
          `hilal-ws-color-${workspace.color}`,
          workspace.id === this._activeId ? "hilal-ws-active" : "",
        ]
          .filter(Boolean)
          .join(" ");
        button.dataset.wsId = workspace.id;
        button.title = `${workspace.name} (${count})`;
        button.setAttribute(
          "aria-label",
          `${workspace.name} workspace, ${count} tab${count === 1 ? "" : "s"}`
        );
        button.setAttribute(
          "aria-pressed",
          workspace.id === this._activeId ? "true" : "false"
        );
        if (workspace.id === this._activeId) {
          button.setAttribute("aria-current", "true");
        }

        const emojiSpan = document.createElement("span");
        emojiSpan.className = "hilal-ws-emoji";
        emojiSpan.setAttribute("aria-hidden", "true");
        emojiSpan.textContent = workspace.emoji || "\u{1F5C2}";
        button.appendChild(emojiSpan);

        const label = document.createElement("span");
        label.className = "hilal-ws-label";
        label.textContent = workspace.name;
        button.appendChild(label);

        const badge = document.createElement("span");
        badge.className = "hilal-ws-count";
        badge.textContent = String(count);
        badge.setAttribute("aria-hidden", "true");
        button.appendChild(badge);

        button.addEventListener("click", () => this.switchTo(workspace.id));
        button.addEventListener("dblclick", () =>
          this._showRenameDialog(workspace)
        );
        button.addEventListener("contextmenu", event => {
          event.preventDefault();
          this._showWorkspaceMenu(workspace, button);
        });
        button.addEventListener("dragover", event => {
          if (event.dataTransfer.types.includes(TAB_DROP_TYPE)) {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
            button.classList.add("hilal-ws-drop-target");
          }
        });
        button.addEventListener("dragleave", () => {
          button.classList.remove("hilal-ws-drop-target");
        });
        button.addEventListener("drop", event => {
          button.classList.remove("hilal-ws-drop-target");
          const draggedTab = event.dataTransfer.mozGetDataAt(TAB_DROP_TYPE, 0);
          if (draggedTab && gBrowser.isTab(draggedTab)) {
            event.preventDefault();
            this._moveTabToWorkspace(draggedTab, workspace.id);
          }
        });

        list.appendChild(button);
      }

      if (this._addBtn) {
        list.appendChild(this._addBtn);
      }

      const activeBtn = list.querySelector(".hilal-ws-active");
      if (activeBtn) {
        requestAnimationFrame(() => {
          activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
        });
      }
    }
  }

  function initNewTabCentering() {
    if (typeof gBrowser === "undefined") {
      return;
    }
    const progressListener = {
      onLocationChange(aWebProgress, aRequest, aLocationURI, aFlags) {
        if (!aWebProgress.isTopLevel) {
          return;
        }
        const spec = aLocationURI ? aLocationURI.spec : "";
        const isNewTab = /^(about:newtab|about:home|about:blank)$/i.test(spec);
        if (isNewTab) {
          document.documentElement.setAttribute("has-newtab-open", "true");
          if (typeof gURLBar !== "undefined") {
            gURLBar.focus();
            gURLBar.select();
          }
        } else {
          document.documentElement.removeAttribute("has-newtab-open");
        }
      },
      QueryInterface: ChromeUtils.generateQI([
        "nsIWebProgressListener",
        "nsISupportsWeakReference",
      ]),
    };
    gBrowser.addProgressListener(progressListener);
    window.addEventListener("unload", () => {
      gBrowser.removeProgressListener(progressListener);
    }, { once: true });
  }

  if (document.readyState === "complete") {
    initNewTabCentering();
  } else {
    window.addEventListener("load", initNewTabCentering, { once: true });
  }

  let retries = 0;
  function tryInit() {
    if (!Services.prefs.getBoolPref("sidebar.revamp", false)) {
      return;
    }
    const sidebarEl = document.querySelector("sidebar-main");
    const hasShadowRoot = sidebarEl?.shadowRoot?.querySelector(".wrapper");
    if (typeof gBrowser !== "undefined" && hasShadowRoot) {
      window.gHilalWorkspaces = new HilalWorkspaces();
      window.gHilalWorkspaces.init();
      return;
    }
    if (++retries < INIT_MAX_RETRIES) {
      setTimeout(tryInit, 100);
    } else {
      console.warn(
        "HilalWorkspaces: gave up waiting for sidebar-main shadow root"
      );
    }
  }

  if (document.readyState === "complete") {
    tryInit();
  } else {
    window.addEventListener("load", tryInit, { once: true });
  }
})();
