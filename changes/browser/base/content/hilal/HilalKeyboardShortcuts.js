"use strict";

const KEYCODE_MAP = {
  F1: "VK_F1",
  F2: "VK_F2",
  F3: "VK_F3",
  F4: "VK_F4",
  F5: "VK_F5",
  F6: "VK_F6",
  F7: "VK_F7",
  F8: "VK_F8",
  F9: "VK_F9",
  F10: "VK_F10",
  F11: "VK_F11",
  F12: "VK_F12",
  TAB: "VK_TAB",
  ENTER: "VK_RETURN",
  ESCAPE: "VK_ESCAPE",
  SPACE: "VK_SPACE",
  ARROWLEFT: "VK_LEFT",
  ARROWRIGHT: "VK_RIGHT",
  ARROWUP: "VK_UP",
  ARROWDOWN: "VK_DOWN",
  DELETE: "VK_DELETE",
  BACKSPACE: "VK_BACK",
  HOME: "VK_HOME",
};

class HilalKeyboardShortcutsManager {
  constructor() {
    this.userOverrides = {};
    this.defaultShortcuts = {};
  }

  async init() {
    await this.loadOverrides();

    const mainKeyset = document.getElementById("mainKeyset");
    if (mainKeyset) {
      this.cacheDefaultShortcuts();
      this.applyOverrides();

      mainKeyset.addEventListener("command", event => {
        switch (event.target.id) {
          case "key_hilalNewWorkspace":
            if (window.gHilalWorkspaces) {
              event.stopPropagation();
              window.gHilalWorkspaces._showCreateDialog();
            }
            break;
          case "key_hilalNextWorkspace":
            if (window.gHilalWorkspaces) {
              event.stopPropagation();
              const manager = window.gHilalWorkspaces;
              const currentIndex = manager._workspaces.findIndex(
                w => w.id === manager._activeId
              );
              if (currentIndex !== -1 && manager._workspaces.length > 0) {
                const nextIndex =
                  (currentIndex + 1) % manager._workspaces.length;
                manager.switchTo(manager._workspaces[nextIndex].id);
              }
            }
            break;
          case "key_hilalPrevWorkspace":
            if (window.gHilalWorkspaces) {
              event.stopPropagation();
              const manager = window.gHilalWorkspaces;
              const currentIndex = manager._workspaces.findIndex(
                w => w.id === manager._activeId
              );
              if (currentIndex !== -1 && manager._workspaces.length > 0) {
                const prevIndex =
                  (currentIndex - 1 + manager._workspaces.length) %
                  manager._workspaces.length;
                manager.switchTo(manager._workspaces[prevIndex].id);
              }
            }
            break;
          case "key_hilalToggleWorkspaces":
            event.stopPropagation();
            Services.prefs.setBoolPref(
              "hilal.workspaces.enabled",
              !Services.prefs.getBoolPref("hilal.workspaces.enabled", true)
            );
            break;
          case "key_hilalToggleCompactMode":
            if (typeof HilalCompactMode !== "undefined") {
              event.stopPropagation();
              HilalCompactMode.toggle();
            }
            break;
          case "key_toggleCompactHideToolbar": {
            event.stopPropagation();
            const pref = "hilal.compact.hide-toolbar";
            Services.prefs.setBoolPref(
              pref,
              !Services.prefs.getBoolPref(pref, false)
            );
            break;
          }
        }
      });
    }

    this._prefObserver = () => {
      this.loadOverrides().then(() => {
        this.applyOverrides();
      });
    };
    Services.prefs.addObserver(
      "hilal.keyboard.shortcuts.data",
      this._prefObserver
    );
    window.addEventListener(
      "unload",
      () => {
        Services.prefs.removeObserver(
          "hilal.keyboard.shortcuts.data",
          this._prefObserver
        );
      },
      { once: true }
    );
  }

  async loadOverrides() {
    try {
      this.userOverrides = JSON.parse(
        Services.prefs.getStringPref("hilal.keyboard.shortcuts.data", "{}")
      );
    } catch (e) {
      this.userOverrides = {};
    }
  }

  cacheDefaultShortcuts() {
    const mainKeyset = document.getElementById("mainKeyset");
    if (!mainKeyset) return;
    for (let key of mainKeyset.children) {
      if (key.id) {
        this.defaultShortcuts[key.id] = {
          key: key.getAttribute("key"),
          keycode: key.getAttribute("keycode"),
          modifiers: key.getAttribute("modifiers"),
        };
      }
    }
  }

  applyOverrides() {
    const nativeKeyIdMap = {
      key_toggleSidebar: "toggleSidebarKb",
      key_focusUrlbar: "focusURLBar",
      key_newNavigator: "key_newNavigator",
      key_newNavigatorTab: "key_newNavigatorTab",
      key_closeWindow: "key_closeWindow",
      key_close: "key_close",
      key_undoCloseTab: "key_restoreLastClosedTabOrWindowOrSession",
      key_gotoHistory: "key_gotoHistory",
      key_viewBookmarksSidebar: "viewBookmarksSidebarKb",
      // custom Hilal keys:
      key_hilalNewWorkspace: "key_hilalNewWorkspace",
      key_hilalNextWorkspace: "key_hilalNextWorkspace",
      key_hilalPrevWorkspace: "key_hilalPrevWorkspace",
      key_hilalToggleWorkspaces: "key_hilalToggleWorkspaces",
      key_hilalToggleCompactMode: "key_hilalToggleCompactMode",
      key_toggleCompactHideToolbar: "key_toggleCompactHideToolbar",
    };

    const extraNativeKeys = {
      key_focusUrlbar: "focusURLBar2",
    };

    const mainKeyset = document.getElementById("mainKeyset");
    if (!mainKeyset) return;

    const parent = mainKeyset.parentElement;
    const nextSibling = mainKeyset.nextSibling;
    mainKeyset.remove();

    // Revert all to default cached values first
    for (let settingsId in nativeKeyIdMap) {
      let nativeId = nativeKeyIdMap[settingsId];
      let keyElem = mainKeyset.querySelector(`#${nativeId}`);
      let extraKeyElem = extraNativeKeys[settingsId]
        ? mainKeyset.querySelector(`#${extraNativeKeys[settingsId]}`)
        : null;

      const revertToDefault = elem => {
        if (!elem) return;
        const cached = this.defaultShortcuts[elem.id];
        if (cached) {
          elem.removeAttribute("disabled");
          if (cached.modifiers) {
            elem.setAttribute("modifiers", cached.modifiers);
          } else {
            elem.removeAttribute("modifiers");
          }
          if (cached.keycode) {
            elem.setAttribute("keycode", cached.keycode);
            elem.removeAttribute("key");
          } else if (cached.key) {
            elem.setAttribute("key", cached.key);
            elem.removeAttribute("keycode");
          } else {
            elem.removeAttribute("key");
            elem.removeAttribute("keycode");
          }
        }
      };

      revertToDefault(keyElem);
      revertToDefault(extraKeyElem);
    }

    // Now apply overrides
    for (let settingsId in this.userOverrides) {
      let nativeId = nativeKeyIdMap[settingsId];
      if (!nativeId) continue;

      let keyElem = mainKeyset.querySelector(`#${nativeId}`);
      let extraKeyElem = extraNativeKeys[settingsId]
        ? mainKeyset.querySelector(`#${extraNativeKeys[settingsId]}`)
        : null;

      let override = this.userOverrides[settingsId];

      const applyToElem = elem => {
        if (!elem) return;
        if (!override.key && !override.modifiers) {
          elem.setAttribute("disabled", "true");
          elem.removeAttribute("key");
          elem.removeAttribute("keycode");
          elem.removeAttribute("modifiers");
        } else {
          elem.removeAttribute("disabled");
          elem.setAttribute("modifiers", override.modifiers);
          let keycode = "";
          let key = override.key;
          for (let [kc, val] of Object.entries(KEYCODE_MAP)) {
            if (kc === key.toUpperCase()) {
              keycode = val;
              key = "";
              break;
            }
          }
          if (keycode) {
            elem.setAttribute("keycode", keycode);
            elem.removeAttribute("key");
          } else {
            elem.setAttribute("key", key);
            elem.removeAttribute("keycode");
          }
        }
      };

      applyToElem(keyElem);
      applyToElem(extraKeyElem);
    }

    if (nextSibling) {
      parent.insertBefore(mainKeyset, nextSibling);
    } else {
      parent.appendChild(mainKeyset);
    }
  }
}

window.gHilalKeyboardShortcutsManager = new HilalKeyboardShortcutsManager();
window.addEventListener("DOMContentLoaded", () => {
  window.gHilalKeyboardShortcutsManager.init();
});
