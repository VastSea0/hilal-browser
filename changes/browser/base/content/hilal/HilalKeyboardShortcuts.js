"use strict";

const HILAL_SHORTCUTS_FILE = "hilal-keyboard-shortcuts.json";

// Map logical keycodes to human readable formats if necessary
const KEYCODE_MAP = {
  F1: "VK_F1", F2: "VK_F2", F3: "VK_F3", F4: "VK_F4", F5: "VK_F5",
  F6: "VK_F6", F7: "VK_F7", F8: "VK_F8", F9: "VK_F9", F10: "VK_F10",
  F11: "VK_F11", F12: "VK_F12",
  TAB: "VK_TAB", ENTER: "VK_RETURN", ESCAPE: "VK_ESCAPE", SPACE: "VK_SPACE",
  ARROWLEFT: "VK_LEFT", ARROWRIGHT: "VK_RIGHT", ARROWUP: "VK_UP", ARROWDOWN: "VK_DOWN",
  DELETE: "VK_DELETE", BACKSPACE: "VK_BACK", HOME: "VK_HOME"
};

// Groups of shortcuts we want to allow users to customize
const HILAL_CUSTOMIZABLE_SHORTCUTS = {
  navigation: [
    "goBackKb",
    "goForwardKb",
    "Browser:ReloadSkipCache",
    "key_stop",
    "goHome",
    "key_privatebrowsing"
  ],
  tabs: [
    "key_newNavigatorTab",
    "key_close",
    "key_closeWindow",
    "key_undoCloseWindow",
    "key_undoCloseTab",
    "key_showAllTabs",
    "key_selectTab1",
    "key_selectLastTab"
  ],
  page: [
    "key_savePage",
    "key_print",
    "key_viewSource",
    "key_viewInfo",
    "key_search",
    "cmd_find",
    "cmd_findAgain"
  ],
  tools: [
    "key_gotoHistory",
    "key_browserConsole",
    "key_toggleToolbox"
  ]
};

class HilalShortcutModifiers {
  constructor(ctrl, alt, shift, meta, accel) {
    this.control = ctrl;
    this.alt = alt;
    this.shift = shift;
    this.meta = meta;
    this.accel = accel;
    
    if (AppConstants.platform !== "macosx") {
      this.accel = ctrl || accel;
      this.control = false;
    }
  }

  static parse(modifiersStr) {
    if (!modifiersStr) {
      return new HilalShortcutModifiers(false, false, false, false, false);
    }
    return new HilalShortcutModifiers(
      modifiersStr.includes("control"),
      modifiersStr.includes("alt"),
      modifiersStr.includes("shift"),
      modifiersStr.includes("meta"),
      modifiersStr.includes("accel")
    );
  }

  toString() {
    let parts = [];
    if (this.control) parts.push("control");
    if (this.accel) parts.push("accel");
    if (this.shift) parts.push("shift");
    if (this.alt) parts.push("alt");
    if (this.meta) parts.push("meta");
    return parts.join(",");
  }

  toDisplayString() {
    let str = "";
    const separation = AppConstants.platform === "macosx" ? " " : "+";
    if (this.control && !this.accel) str += (AppConstants.platform === "macosx" ? "⌃" : "Ctrl") + separation;
    if (this.meta) str += (AppConstants.platform === "macosx" ? "⌘" : "Win") + separation;
    if (this.accel) str += (AppConstants.platform === "macosx" ? "⌘" : "Ctrl") + separation;
    if (this.alt) str += (AppConstants.platform === "macosx" ? "⌥" : "Alt") + separation;
    if (this.shift) str += "⇧" + separation;
    return str;
  }
}

class HilalKeyboardShortcutsManager {
  constructor() {
    this.userOverrides = {};
    this.defaultShortcuts = {};
  }

  get shortcutsFile() {
    return PathUtils.join(PathUtils.profileDir, HILAL_SHORTCUTS_FILE);
  }

  async init() {
    await this.loadOverrides();
    
    // Save defaults from main window if this is a browser window
    if (document.getElementById("mainKeyset")) {
      this.cacheDefaultShortcuts();
      this.applyOverrides();
    }
  }

  async loadOverrides() {
    try {
      this.userOverrides = await IOUtils.readJSON(this.shortcutsFile);
    } catch (e) {
      this.userOverrides = {};
    }
  }

  async saveOverrides() {
    try {
      await IOUtils.writeJSON(this.shortcutsFile, this.userOverrides);
    } catch (e) {
      console.error("Failed to save Hilal shortcuts", e);
    }
  }

  cacheDefaultShortcuts() {
    const keysets = document.querySelectorAll("keyset");
    for (let keyset of keysets) {
      for (let key of keyset.children) {
        if (key.id) {
          this.defaultShortcuts[key.id] = {
            key: key.getAttribute("key"),
            keycode: key.getAttribute("keycode"),
            modifiers: key.getAttribute("modifiers")
          };
        }
      }
    }
  }

  applyOverrides() {
    const keysets = document.querySelectorAll("keyset");
    for (let keyset of keysets) {
      for (let key of keyset.children) {
        if (key.id && this.userOverrides[key.id]) {
          const override = this.userOverrides[key.id];
          
          if (override.empty) {
            // Disable the shortcut entirely
            key.setAttribute("disabled", "true");
            continue;
          }
          
          key.removeAttribute("disabled");
          key.setAttribute("modifiers", override.modifiers);
          
          if (override.keycode) {
            key.setAttribute("keycode", override.keycode);
            key.removeAttribute("key");
          } else {
            key.setAttribute("key", override.key);
            key.removeAttribute("keycode");
          }
        }
      }
    }
  }

  async setShortcut(id, keyStr, modifiersObj) {
    if (!keyStr) {
      this.userOverrides[id] = { empty: true };
    } else {
      let keycode = "";
      let key = keyStr;
      
      for (let [kc, val] of Object.entries(KEYCODE_MAP)) {
        if (kc === keyStr.toUpperCase()) {
          keycode = val;
          key = "";
          break;
        }
      }
      
      this.userOverrides[id] = {
        key: key,
        keycode: keycode,
        modifiers: modifiersObj.toString()
      };
    }
    
    await this.saveOverrides();
    
    // Broadcast to all windows to re-apply
    Services.obs.notifyObservers(null, "hilal-shortcuts-updated", null);
  }

  async resetAllShortcuts() {
    this.userOverrides = {};
    try {
      await IOUtils.remove(this.shortcutsFile);
    } catch (e) {
      // Ignore if missing
    }
    Services.obs.notifyObservers(null, "hilal-shortcuts-updated", null);
  }

  getModifiableShortcuts() {
    let result = [];
    for (const [group, ids] of Object.entries(HILAL_CUSTOMIZABLE_SHORTCUTS)) {
      for (const id of ids) {
        // Use user override if present, else default
        let source = this.userOverrides[id] || this.defaultShortcuts[id];
        if (!source) continue;
        
        const isDefault = !this.userOverrides[id];
        const isEmpty = !!this.userOverrides[id]?.empty;
        
        let displayModifiers = "";
        let displayKey = "";
        
        if (!isEmpty) {
          const modObj = HilalShortcutModifiers.parse(source.modifiers);
          displayModifiers = modObj.toDisplayString();
          
          if (source.key) {
            displayKey = source.key.toUpperCase();
          } else if (source.keycode) {
             for (let [kc, val] of Object.entries(KEYCODE_MAP)) {
                if (val === source.keycode) {
                   displayKey = kc;
                   break;
                }
             }
             if (!displayKey) displayKey = source.keycode.replace("VK_", "");
          }
        }

        result.push({
          id,
          group,
          empty: isEmpty,
          displayString: isEmpty ? "" : displayModifiers + displayKey
        });
      }
    }
    return result;
  }

  checkForConflicts(keyStr, modifiersObj, ignoreId) {
    let keycode = "";
    let key = keyStr;
    for (let [kc, val] of Object.entries(KEYCODE_MAP)) {
      if (kc === keyStr.toUpperCase()) {
        keycode = val;
        key = "";
        break;
      }
    }
    
    const modsStr = modifiersObj.toString();
    
    for (const [id, defaultDef] of Object.entries(this.defaultShortcuts)) {
      if (id === ignoreId) continue;
      
      let def = this.userOverrides[id] || defaultDef;
      if (def.empty) continue;
      
      const sameMods = def.modifiers === modsStr || (!def.modifiers && !modsStr);
      const sameKey = key && def.key && def.key.toLowerCase() === key.toLowerCase();
      const sameKeyCode = keycode && def.keycode === keycode;
      
      if (sameMods && (sameKey || sameKeyCode)) {
        return { hasConflicts: true, conflictId: id };
      }
    }
    return { hasConflicts: false };
  }
}

window.gHilalKeyboardShortcutsManager = new HilalKeyboardShortcutsManager();
window.addEventListener("DOMContentLoaded", () => {
  window.gHilalKeyboardShortcutsManager.init();
});

// Setup observer to apply updates live
if (typeof Services !== "undefined" && Services.obs) {
  Services.obs.addObserver({
    observe(subject, topic, data) {
      if (topic === "hilal-shortcuts-updated") {
        window.gHilalKeyboardShortcutsManager.loadOverrides().then(() => {
          window.gHilalKeyboardShortcutsManager.applyOverrides();
        });
      }
    }
  }, "hilal-shortcuts-updated", false);
}
