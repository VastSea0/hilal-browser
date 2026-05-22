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
        if (typeof Services !== "undefined" && Services.clearData) {
          Services.clearData.deleteDataFromOriginAttributesPattern({
            userContextId: workspace.containerId,
          });
        }
      } catch (e) {
        this._warn(`failed to clear site data for ${workspace.name}`, e);
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

      const seenPref = "hilal.welcome-screen.seen";
      if (!Services.prefs.getBoolPref(seenPref, false)) {
        Services.prefs.setBoolPref(seenPref, true);
        const welcome = new HilalWelcome(this);
        welcome.start();
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

  let SearchService;
  try {
    SearchService = ChromeUtils.importESModule(
      "moz-src:///toolkit/components/search/SearchService.sys.mjs"
    ).SearchService;
  } catch (e) {
    try {
      SearchService = ChromeUtils.importESModule(
        "resource:///modules/SearchService.sys.mjs"
      ).SearchService;
    } catch (err) {
      SearchService = window.SearchService;
    }
  }

  class HilalWelcome {
    constructor(workspacesController) {
      this._workspaces = workspacesController;
      this._stage = 0;
      this._container = null;
      this._style = null;
      this._hiddenElements = [];
      this._engines = [];
      this._selectedEngine = null;
      this._defaultBrowserSelected = false;
      this._workspacesSelected = {
        personal: true,
        work: true,
        social: true
      };
    }

    async start() {
      this._hideUI();
      this._centerWindow();
      this._injectCSS();
      await this._fetchEngines();
      this._render();
    }

    _hideUI() {
      const toolbox = document.getElementById("navigator-toolbox");
      if (toolbox) {
        toolbox.style.display = "none";
        this._hiddenElements.push(toolbox);
      }
      const sidebar = document.getElementById("sidebar-box");
      if (sidebar) {
        sidebar.style.display = "none";
        this._hiddenElements.push(sidebar);
      }
      const browser = document.getElementById("browser");
      if (browser) {
        for (const child of browser.children) {
          if (child.id !== "hilal-welcome" && child.id !== "hilal-welcome-style") {
            child.style.display = "none";
            this._hiddenElements.push(child);
          }
        }
      }
    }

    _centerWindow() {
      try {
        window.resizeTo(875, 560);
        window.focus();
        try {
          const appWin = window.docShell.treeOwner
            .QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIAppWindow);
          appWin.rollupAllPopups();
        } catch (e) {}
        const x = screen.availLeft + (screen.availWidth - 875) / 2;
        const y = screen.availTop + (screen.availHeight - 560) / 2;
        window.moveTo(x, y);
      } catch (e) {
        console.error("HilalWelcome: failed to center window", e);
      }
    }

    _injectCSS() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);

      this._style = document.createElement("style");
      this._style.id = "hilal-welcome-style";
      this._style.textContent = this._getCSS();
      document.head.appendChild(this._style);
    }

    async _fetchEngines() {
      try {
        if (SearchService) {
          const list = await SearchService.getVisibleEngines();
          this._engines = list.filter(e => {
            const n = e.name.toLowerCase();
            return !n.includes("wikipedia") && !n.includes("ebay");
          }).map(e => ({
            name: e.name,
            originalEngine: e
          }));

          const ddg = this._engines.find(e => e.name.toLowerCase().includes("duckduckgo"));
          if (ddg) {
            this._selectedEngine = ddg;
          } else if (this._engines.length > 0) {
            this._selectedEngine = this._engines[0];
          }
        }
      } catch (e) {
        console.error("HilalWelcome: failed to fetch engines", e);
      }

      if (this._engines.length === 0) {
        this._engines = [
          { name: "DuckDuckGo", originalEngine: null },
          { name: "Google", originalEngine: null },
          { name: "Bing", originalEngine: null }
        ];
        this._selectedEngine = this._engines[0];
      }
    }

    _next() {
      if (this._stage < 4) {
        this._stage++;
        this._render();
      } else {
        this._finish();
      }
    }

    _prev() {
      if (this._stage > 0) {
        this._stage--;
        this._render();
      }
    }

    async _finish() {
      if (this._workspaces) {
        if (this._workspacesSelected.personal) {
          this._workspaces.create("Ki\u{015f}isel", "\u{1F3E0}", "blue");
        }
        if (this._workspacesSelected.work) {
          this._workspaces.create("\u{0130}\u{015f}", "\u{1F4BC}", "orange");
        }
        if (this._workspacesSelected.social) {
          this._workspaces.create("Sosyal", "\u{1F4AC}", "pink");
        }
      }

      if (this._selectedEngine && this._selectedEngine.originalEngine && SearchService) {
        try {
          if (SearchService.setDefault) {
            await SearchService.setDefault(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON.UNKNOWN || 1
            );
          }
          if (SearchService.setDefaultPrivate) {
            await SearchService.setDefaultPrivate(
              this._selectedEngine.originalEngine,
              SearchService.CHANGE_REASON.UNKNOWN || 1
            );
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set search engine default", e);
        }
      }

      if (this._defaultBrowserSelected) {
        try {
          const shellSvc = window.getShellService ? window.getShellService() : null;
          if (shellSvc) {
            shellSvc.setDefaultBrowser(false);
          }
        } catch (e) {
          console.error("HilalWelcome: failed to set default browser", e);
        }
      }

      this._restoreUI();
    }

    _restoreUI() {
      for (const element of this._hiddenElements) {
        try {
          element.style.removeProperty("display");
        } catch (e) {}
      }
      this._hiddenElements = [];

      if (this._container) {
        this._container.remove();
      }
      if (this._style) {
        this._style.remove();
      }

      if (this._workspaces) {
        try {
          this._workspaces._apply();
          this._workspaces._updateUI();
        } catch (e) {}
      }

      try {
        window.maximize();
      } catch (e) {}
    }

    _render() {
      let container = document.getElementById("hilal-welcome");
      if (!container) {
        container = document.createElement("div");
        container.id = "hilal-welcome";
        document.getElementById("browser").appendChild(container);
      }
      this._container = container;

      const progressPercent = ((this._stage + 1) / 5) * 100;

      container.innerHTML = `
        <div id="hilal-welcome-card">
          <div id="hilal-welcome-progress">
            <div id="hilal-welcome-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div id="hilal-welcome-stage-container">
            ${this._getStageHTML()}
          </div>
          <div id="hilal-welcome-footer">
            ${this._getFooterHTML()}
          </div>
        </div>
      `;

      this._setupListeners();
    }

    _getStageHTML() {
      switch (this._stage) {
        case 0:
          return `
            <div class="hilal-welcome-content text-center">
              <div class="hilal-welcome-logo">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.2384 20.9056 10.4988 20.728 9.792C19.824 10.536 18.666 11 17.4 11C14.0863 11 11.4 8.31371 11.4 5C11.4 4.2384 11.5416 3.51 11.802 2.844C11.868 2.88 11.934 2.916 12 3Z" fill="url(#hilal-logo-grad)" />
                  <defs>
                    <linearGradient id="hilal-logo-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#37adff" />
                      <stop offset="1" stop-color="#af51f5" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1>Hilal Browser'a Ho\u{015f} Geldiniz</h1>
              <p class="hilal-welcome-desc">Gizlilik odakl\u{0131}, h\u{0131}zl\u{0131} ve tamamen size \u{00f6}zel yeni nesil internet taray\u{0131}c\u{0131}n\u{0131}z.</p>
              <div class="text-center" style="margin-top: 20px;">
                <button class="hilal-btn-primary" id="btn-start">
                  <span>Ba\u{015f}layal\u{0131}m</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          `;
        case 1:
          return `
            <div class="hilal-welcome-content">
              <h1>Ayarlar\u{0131}n\u{0131}z\u{0131} \u{00d6}zelle\u{015f}tirin</h1>
              <p class="hilal-welcome-desc text-center">Tercihlerinizi yap\u{0131}land\u{0131}rarak Hilal Browser'\u{0131} hemen kullanmaya ba\u{015f}lay\u{0131}n.</p>
              
              <div class="hilal-card-list">
                <div class="hilal-settings-card">
                  <div class="hilal-card-info">
                    <span class="hilal-card-title">Varsay\u{0131}lan Taray\u{0131}c\u{0131} Yap</span>
                    <span class="hilal-card-desc">Hilal Browser'\u{0131} internetteki birincil kap\u{0131}n\u{0131}z haline getirin.</span>
                  </div>
                  <label class="hilal-switch">
                    <input type="checkbox" id="toggle-default-browser" ${this._defaultBrowserSelected ? "checked" : ""}>
                    <span class="hilal-slider"></span>
                  </label>
                </div>

                <div class="hilal-settings-card">
                  <div class="hilal-card-info">
                    <span class="hilal-card-title">Verileri \u{0130}\u{00e7}e Aktar</span>
                    <span class="hilal-card-desc">Yer imlerinizi, ge\u{00e7}mi\u{015f}inizi ve \u{015fifrelerinizi kolayca Hilal'e ta\u{015f}\u{0131}y\u{0131}n.</span>
                  </div>
                  <button class="hilal-btn-secondary" id="btn-import-data">\u{0130}\u{00e7}e Aktar</button>
                </div>
              </div>
            </div>
          `;
        case 2:
          return `
            <div class="hilal-welcome-content">
              <h1>Arama Motorunuzu Se\u{00e7}in</h1>
              <p class="hilal-welcome-desc text-center">Hilal, gizlili\u{011f}inizi korumak i\u{00e7}in varsay\u{0131}lan olarak DuckDuckGo aramalar\u{0131}n\u{0131} kullan\u{0131}r.</p>
              
              <div class="hilal-engine-grid">
                ${this._engines.map((engine, idx) => {
                  const isActive = this._selectedEngine && this._selectedEngine.name === engine.name;
                  const isDdg = engine.name.toLowerCase().includes("duckduckgo");
                  return `
                    <div class="hilal-engine-card ${isActive ? "active" : ""}" data-idx="${idx}">
                      ${isDdg ? `<span class="hilal-badge">\u{00d6}nerilen</span>` : ""}
                      <div class="hilal-engine-icon-container">
                        ${this._getEngineIconSVG(engine.name)}
                      </div>
                      <span class="hilal-engine-name">${engine.name}</span>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `;
        case 3:
          return `
            <div class="hilal-welcome-content">
              <h1>\u{00c7}al\u{0131}\u{015f}ma Alanlar\u{0131}n\u{0131}z\u{0131} Haz\u{0131}rlay\u{0131}n</h1>
              <p class="hilal-welcome-desc text-center">Hilal Workspaces ile sekmelerinizi izole edin. \u{0130}\u{015f}, ki\u{015f}isel ve sosyal hayat\u{0131}n\u{0131}z\u{0131} birbirinden ay\u{0131}r\u{0131}n.</p>
              
              <div class="hilal-ws-grid">
                <div class="hilal-ws-card ${this._workspacesSelected.personal ? "active-personal" : ""}" id="ws-card-personal">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-personal" ${this._workspacesSelected.personal ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #37adff; background: rgba(55, 173, 255, 0.1);">\u{1F3E0}</div>
                  <span class="hilal-ws-card-title">Ki\u{015f}isel</span>
                </div>

                <div class="hilal-ws-card ${this._workspacesSelected.work ? "active-work" : ""}" id="ws-card-work">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-work" ${this._workspacesSelected.work ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #ff9f00; background: rgba(255, 159, 0, 0.1);">\u{1F4BC}</div>
                  <span class="hilal-ws-card-title">\u{0130}\u{015f}</span>
                </div>

                <div class="hilal-ws-card ${this._workspacesSelected.social ? "active-social" : ""}" id="ws-card-social">
                  <input type="checkbox" class="hilal-ws-checkbox" id="chk-social" ${this._workspacesSelected.social ? "checked" : ""}>
                  <div class="hilal-ws-icon-wrap" style="color: #ff4bda; background: rgba(255, 75, 218, 0.1);">\u{1F4AC}</div>
                  <span class="hilal-ws-card-title">Sosyal</span>
                </div>
              </div>
            </div>
          `;
        case 4:
          return `
            <div class="hilal-welcome-content text-center">
              <div class="hilal-welcome-logo">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="url(#hilal-success-grad)" />
                  <defs>
                    <linearGradient id="hilal-success-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#00c79a" />
                      <stop offset="1" stop-color="#37adff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1>Her \u{015e}ey Haz\u{0131}r!</h1>
              <p class="hilal-welcome-desc">Hilal Browser ile güvenli, h\u{0131}zl\u{0131} ve izole bir internet deneyimi sizi bekliyor.</p>
              <div class="text-center" style="margin-top: 20px;">
                <button class="hilal-btn-primary" id="btn-finish">
                  <span>G\u{00f6}z Atmaya Ba\u{015f}la</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          `;
      }
    }

    _getFooterHTML() {
      if (this._stage === 0 || this._stage === 4) {
        return "";
      }
      return `
        <button class="hilal-btn-secondary" id="btn-prev">Geri</button>
        <button class="hilal-btn-primary" id="btn-next">
          <span>Devam Et</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;
    }

    _getEngineIconSVG(name) {
      const n = name.toLowerCase();
      if (n.includes("duckduckgo")) {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#de5833"/>
            <path d="M12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5ZM11.66 8.18C11.89 8.18 12.11 8.35 12.15 8.58L12.44 10.22C12.76 10.36 13.06 10.55 13.33 10.78L14.88 10.22C15.1 10.14 15.35 10.24 15.46 10.45L16.21 11.75C16.32 11.96 16.26 12.22 16.08 12.37L14.79 13.38C14.84 13.58 14.86 13.79 14.86 14C14.86 14.21 14.84 14.42 14.79 14.62L16.08 15.63C16.26 15.78 16.32 16.04 16.21 16.25L15.46 17.55C15.35 17.76 15.1 17.86 14.88 17.78L13.33 17.22C13.06 17.45 12.76 17.64 12.44 17.78L12.15 19.42C12.11 19.65 11.89 19.82 11.66 19.82H10.16C9.93 19.82 9.71 19.65 9.67 19.42L9.38 17.78C9.06 17.64 8.76 17.45 8.49 17.22L6.94 17.78C6.72 17.86 6.47 17.76 6.36 17.55L5.61 16.25C5.5 16.04 5.56 15.78 5.74 15.63L7.03 14.62C6.98 14.42 6.96 14.21 6.96 14C6.96 13.79 6.98 13.58 7.03 13.38L5.74 12.37C5.56 12.22 5.5 11.96 5.61 11.75L6.36 10.45C6.47 10.24 6.72 10.14 6.94 10.22L8.49 10.78C8.76 10.55 9.06 10.36 9.38 10.22L9.67 8.58C9.71 8.35 9.93 8.18 10.16 8.18H11.66Z" fill="white"/>
          </svg>
        `;
      } else if (n.includes("google")) {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#4285f4"/>
            <path d="M12.24 10.285V13.715H17.89C17.64 15.015 16.48 17.525 12.24 17.525C8.58 17.525 5.6 14.535 5.6 10.885C5.6 7.235 8.58 4.245 12.24 4.245C14.33 4.245 15.73 5.125 16.53 5.885L19.24 3.235C17.49 1.625 15.1 0.655 12.24 0.655C6.34 0.655 1.55 5.145 1.55 10.885C1.55 16.625 6.34 21.115 12.24 21.115C18.4 21.115 22.49 16.825 22.49 10.885C22.49 10.215 22.41 9.715 22.3 9.285H12.24Z" fill="white" transform="scale(0.8) translate(3, 3)"/>
          </svg>
        `;
      } else {
        return `
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="12" fill="#0c8484"/>
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 16H11V10H13V16ZM13 8H11V6H13V8Z" fill="white"/>
          </svg>
        `;
      }
    }

    _setupListeners() {
      const btnPrev = document.getElementById("btn-prev");
      if (btnPrev) {
        btnPrev.addEventListener("click", () => this._prev());
      }

      const btnNext = document.getElementById("btn-next");
      if (btnNext) {
        btnNext.addEventListener("click", () => this._next());
      }

      const btnStart = document.getElementById("btn-start");
      if (btnStart) {
        btnStart.addEventListener("click", () => this._next());
      }

      const btnFinish = document.getElementById("btn-finish");
      if (btnFinish) {
        btnFinish.addEventListener("click", () => this._finish());
      }

      const chkDefaultBrowser = document.getElementById("toggle-default-browser");
      if (chkDefaultBrowser) {
        chkDefaultBrowser.addEventListener("change", (e) => {
          this._defaultBrowserSelected = e.target.checked;
        });
      }

      const btnImport = document.getElementById("btn-import-data");
      if (btnImport) {
        btnImport.addEventListener("click", async () => {
          try {
            if (MigrationUtils && MigrationUtils.showMigrationWizard) {
              MigrationUtils.showMigrationWizard(window, { isStartupMigration: true });
              btnImport.textContent = "Veriler \u{0130}\u{00e7}e Aktar\u{0131}ld\u{0131}";
              btnImport.classList.add("disabled");
              btnImport.disabled = true;
            }
          } catch (e) {
            console.error("HilalWelcome: failed to open migration wizard", e);
          }
        });
      }

      const cards = this._container.querySelectorAll(".hilal-engine-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const idx = parseInt(card.dataset.idx, 10);
          this._selectedEngine = this._engines[idx];
          cards.forEach(c => c.classList.remove("active"));
          card.classList.add("active");
        });
      });

      const setupWsCard = (id, key) => {
        const card = document.getElementById(`ws-card-${id}`);
        const chk = document.getElementById(`chk-${id}`);
        if (card && chk) {
          const updateVisual = () => {
            if (this._workspacesSelected[key]) {
              card.classList.add(`active-${id}`);
            } else {
              card.classList.remove(`active-${id}`);
            }
            chk.checked = this._workspacesSelected[key];
          };

          card.addEventListener("click", (e) => {
            if (e.target !== chk) {
              this._workspacesSelected[key] = !this._workspacesSelected[key];
              updateVisual();
            }
          });

          chk.addEventListener("change", (e) => {
            this._workspacesSelected[key] = e.target.checked;
            updateVisual();
          });
        }
      };

      setupWsCard("personal", "personal");
      setupWsCard("work", "work");
      setupWsCard("social", "social");
    }

    _getCSS() {
      return `
        #hilal-welcome {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #0e0720 0%, #04010b 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          z-index: 2999999999;
          color: #ffffff;
          overflow: hidden;
          -moz-window-dragging: drag;
        }

        #hilal-welcome-card {
          width: 560px;
          height: 460px;
          background: rgba(20, 12, 40, 0.45);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          position: relative;
          -moz-window-dragging: no-drag;
          box-sizing: border-box;
        }

        #hilal-welcome-progress {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
        }

        #hilal-welcome-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #37adff, #af51f5);
          transition: width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        #hilal-welcome-stage-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          min-height: 0;
        }

        .hilal-welcome-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          animation: fadeInStage 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        @keyframes fadeInStage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .text-center {
          text-align: center;
        }

        .hilal-welcome-logo {
          margin-bottom: 24px;
          filter: drop-shadow(0 0 15px rgba(175, 81, 245, 0.4));
          animation: floatLogo 4s ease-in-out infinite;
        }

        @keyframes floatLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        #hilal-welcome h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 10px 0;
          background: linear-gradient(135deg, #ffffff 50%, #e0c8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
          letter-spacing: -0.5px;
        }

        .hilal-welcome-desc {
          font-size: 0.9rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          margin: 0 0 20px 0;
          max-width: 90%;
        }

        .hilal-card-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-top: 10px;
        }

        .hilal-settings-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .hilal-card-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .hilal-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .hilal-card-desc {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.45);
          line-height: 1.4;
          text-align: left;
        }

        .hilal-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .hilal-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .hilal-slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .3s;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hilal-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }

        .hilal-switch input:checked + .hilal-slider {
          background: linear-gradient(90deg, #37adff, #af51f5);
        }

        .hilal-switch input:checked + .hilal-slider:before {
          transform: translateX(20px);
        }

        .hilal-engine-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          margin-top: 15px;
          box-sizing: border-box;
        }

        .hilal-engine-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-sizing: border-box;
        }

        .hilal-engine-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
        }

        .hilal-engine-card.active {
          background: rgba(175, 81, 245, 0.08);
          border-color: #af51f5;
          box-shadow: 0 0 15px rgba(175, 81, 245, 0.15);
        }

        .hilal-engine-icon-container {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hilal-engine-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .hilal-badge {
          position: absolute;
          top: -9px;
          background: linear-gradient(90deg, #37adff, #af51f5);
          color: #ffffff;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .hilal-ws-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 100%;
          margin-top: 15px;
          box-sizing: border-box;
        }

        .hilal-ws-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 24px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          box-sizing: border-box;
        }

        .hilal-ws-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .hilal-ws-card.active-personal {
          background: rgba(55, 173, 255, 0.06);
          border-color: #37adff;
          box-shadow: 0 0 15px rgba(55, 173, 255, 0.12);
        }

        .hilal-ws-card.active-work {
          background: rgba(255, 159, 0, 0.06);
          border-color: #ff9f00;
          box-shadow: 0 0 15px rgba(255, 159, 0, 0.12);
        }

        .hilal-ws-card.active-social {
          background: rgba(255, 75, 218, 0.06);
          border-color: #ff4bda;
          box-shadow: 0 0 15px rgba(255, 75, 218, 0.12);
        }

        .hilal-ws-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hilal-ws-card-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
        }

        .hilal-ws-checkbox {
          position: absolute;
          top: 12px;
          right: 12px;
          cursor: pointer;
          accent-color: #af51f5;
        }

        #hilal-welcome-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hilal-btn-primary {
          background: linear-gradient(90deg, #af51f5, #7a22cc);
          border: none;
          border-radius: 10px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 10px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(175, 81, 245, 0.25);
        }

        .hilal-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(175, 81, 245, 0.35);
        }

        .hilal-btn-primary:active {
          transform: translateY(0);
        }

        .hilal-btn-secondary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          font-weight: 500;
          padding: 10px 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .hilal-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .hilal-btn-secondary.disabled,
        .hilal-btn-secondary[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.04);
        }
      `;
    }
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
