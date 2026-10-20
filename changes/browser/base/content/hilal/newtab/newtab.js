// Hilal Browser New Tab Controller
// Zero hardcoded strings - 100% Fluent localized

(function () {
  "use strict";

  // 1. Theme Synchronization (Inherit Accent & Solid Background)
  const themeChannel = new BroadcastChannel("hilal-theme-channel");
  const newTabChannel = new BroadcastChannel("hilal-newtab-channel");

  const COLOR_MAP = {
    blue: "#37adff",
    turquoise: "#00c79a",
    green: "#51cd00",
    yellow: "#ffcb00",
    orange: "#ff9f00",
    red: "#ff613d",
    pink: "#ff4bda",
    purple: "#af51f5",
  };

  function applyTheme(themeData) {
    if (!themeData) return;
    let hex = themeData.accent || themeData.color;
    if (hex) {
      hex = hex.trim();
      if (COLOR_MAP[hex.toLowerCase()]) {
        hex = COLOR_MAP[hex.toLowerCase()];
      }
    }

    const root = document.documentElement;
    if (hex) {
      root.style.setProperty("--hilal-accent", hex);
      root.style.setProperty("--md-sys-color-primary", hex);
    }
    if (themeData.bg) {
      root.style.setProperty("--hilal-bg", themeData.bg);
      root.style.setProperty("--md-sys-color-surface", themeData.bg);
    } else if (hex) {
      root.style.setProperty(
        "--hilal-bg",
        `color-mix(in srgb, ${hex} 14%, #131217)`
      );
      root.style.setProperty(
        "--md-sys-color-surface",
        `color-mix(in srgb, ${hex} 14%, #131217)`
      );
    }
    if (themeData.surface) {
      root.style.setProperty("--hilal-surface", themeData.surface);
      root.style.setProperty(
        "--md-sys-color-surface-container-high",
        themeData.surface
      );
    } else if (hex) {
      root.style.setProperty(
        "--hilal-surface",
        `color-mix(in srgb, ${hex} 22%, #1b1922)`
      );
      root.style.setProperty(
        "--md-sys-color-surface-container-high",
        `color-mix(in srgb, ${hex} 22%, #1b1922)`
      );
    }
    if (themeData.surfaceHover) {
      root.style.setProperty("--hilal-surface-hover", themeData.surfaceHover);
      root.style.setProperty(
        "--md-sys-color-surface-container-highest",
        themeData.surfaceHover
      );
    } else if (hex) {
      root.style.setProperty(
        "--hilal-surface-hover",
        `color-mix(in srgb, ${hex} 32%, #262330)`
      );
      root.style.setProperty(
        "--md-sys-color-surface-container-highest",
        `color-mix(in srgb, ${hex} 32%, #262330)`
      );
    }
    if (themeData.border) {
      root.style.setProperty("--hilal-border", themeData.border);
      root.style.setProperty(
        "--md-sys-color-outline-variant",
        themeData.border
      );
    } else if (hex) {
      root.style.setProperty(
        "--hilal-border",
        `color-mix(in srgb, ${hex} 25%, rgba(255, 255, 255, 0.08))`
      );
      root.style.setProperty(
        "--md-sys-color-outline-variant",
        `color-mix(in srgb, ${hex} 25%, rgba(255, 255, 255, 0.08))`
      );
    }
    if (themeData.text) root.style.setProperty("--hilal-text", themeData.text);
    if (themeData.textMuted)
      root.style.setProperty("--hilal-text-muted", themeData.textMuted);

    if (hex) {
      try {
        localStorage.setItem("hilal_active_accent", hex);
      } catch (e) {}
    }
  }

  // Instant render from cache (0ms flicker)
  try {
    const cached = localStorage.getItem("hilal_active_accent");
    if (cached) {
      applyTheme({ color: cached });
    }
  } catch (e) {}

  window.addEventListener("hilal-theme-applied", event => {
    if (event.detail) {
      applyTheme(event.detail);
    }
  });

  themeChannel.onmessage = event => {
    if (event.data) {
      applyTheme(event.data.theme || event.data);
    }
  };

  // Request current theme from browser shell
  function requestTheme() {
    themeChannel.postMessage({ action: "request-theme" });
  }
  requestTheme();
  setTimeout(requestTheme, 20);
  setTimeout(requestTheme, 80);
  setTimeout(requestTheme, 250);

  // 2. Search Box Controller
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");

  if (searchInput && searchClear) {
    searchInput.addEventListener("input", () => {
      searchClear.style.display =
        searchInput.value.trim().length > 0 ? "flex" : "none";
    });

    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchClear.style.display = "none";
      searchInput.focus();
    });
  }

  function openLocation(url) {
    if (!url) return;
    if (url.startsWith("about:") || url.startsWith("chrome:")) {
      newTabChannel.postMessage({ action: "navigate", url: url });
    } else {
      window.location.href = url;
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const raw = searchInput.value.trim();
      if (!raw) return;

      let targetUrl = raw;
      if (
        !targetUrl.includes("://") &&
        !targetUrl.startsWith("about:") &&
        !targetUrl.startsWith("chrome:")
      ) {
        if (targetUrl.includes(".") && !targetUrl.includes(" ")) {
          targetUrl = "https://" + targetUrl;
        } else {
          targetUrl =
            "https://duckduckgo.com/?q=" + encodeURIComponent(targetUrl);
        }
      }
      openLocation(targetUrl);
    });
  }

  // 3. Shortcuts Management
  const DEFAULT_SHORTCUTS = [
    {
      title: "Wikipedia",
      url: "https://www.wikipedia.org",
      icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
    },
    {
      title: "YouTube",
      url: "https://www.youtube.com",
      icon: "https://www.youtube.com/favicon.ico",
    },
    {
      title: "Reddit",
      url: "https://www.reddit.com",
      icon: "https://www.redditstatic.com/shreddit/assets/favicon/192x192.png",
    },
    {
      title: "Add-ons for Firefox",
      url: "https://addons.mozilla.org",
      icon: "chrome://branding/content/icon32.png",
    },
  ];

  function getShortcuts() {
    try {
      const data = localStorage.getItem("hilal_shortcuts");
      if (data) return JSON.parse(data);
    } catch (e) {}
    return DEFAULT_SHORTCUTS;
  }

  function saveShortcuts(shortcuts) {
    try {
      localStorage.setItem("hilal_shortcuts", JSON.stringify(shortcuts));
    } catch (e) {}
  }

  // Dialog Elements
  const dialog = document.getElementById("shortcut-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogForm = document.getElementById("shortcut-dialog-form");
  const nameInput = document.getElementById("shortcut-name-input");
  const urlInput = document.getElementById("shortcut-url-input");
  const cancelBtn = document.getElementById("dialog-cancel-btn");
  const deleteBtn = document.getElementById("dialog-delete-btn");
  let currentEditIndex = -1;

  function openShortcutModal(editIndex = -1) {
    if (!dialog) return;
    currentEditIndex = editIndex;

    if (editIndex >= 0) {
      const shortcuts = getShortcuts();
      const sc = shortcuts[editIndex];
      if (nameInput) nameInput.value = sc?.title || "";
      if (urlInput) urlInput.value = sc?.url || "";
      if (dialogTitle && document.l10n) {
        document.l10n.setAttributes(
          dialogTitle,
          "hilal-newtab-dialog-edit-title"
        );
      }
      if (deleteBtn) deleteBtn.style.display = "inline-flex";
    } else {
      if (nameInput) nameInput.value = "";
      if (urlInput) urlInput.value = "";
      if (dialogTitle && document.l10n) {
        document.l10n.setAttributes(dialogTitle, "hilal-newtab-dialog-title");
      }
      if (deleteBtn) deleteBtn.style.display = "none";
    }

    dialog.showModal();
    if (nameInput) nameInput.focus();
  }

  if (cancelBtn && dialog) {
    cancelBtn.addEventListener("click", () => dialog.close());
  }

  if (deleteBtn && dialog) {
    deleteBtn.addEventListener("click", () => {
      if (currentEditIndex >= 0) {
        const shortcuts = getShortcuts();
        shortcuts.splice(currentEditIndex, 1);
        saveShortcuts(shortcuts);
        renderShortcuts();
      }
      dialog.close();
    });
  }

  if (dialogForm && dialog) {
    dialogForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = (nameInput?.value || "").trim();
      let url = (urlInput?.value || "").trim();
      if (!name || !url) return;

      if (
        !url.includes("://") &&
        !url.startsWith("about:") &&
        !url.startsWith("chrome:")
      ) {
        url = "https://" + url;
      }

      let favicon = "";
      try {
        const u = new URL(url);
        favicon =
          "https://www.google.com/s2/favicons?domain=" + u.hostname + "&sz=64";
      } catch (err) {}

      const shortcuts = getShortcuts();
      if (currentEditIndex >= 0 && currentEditIndex < shortcuts.length) {
        shortcuts[currentEditIndex] = { title: name, url: url, icon: favicon };
      } else {
        shortcuts.push({ title: name, url: url, icon: favicon });
      }

      saveShortcuts(shortcuts);
      dialog.close();
      renderShortcuts();
    });
  }

  function renderShortcuts() {
    const grid = document.getElementById("shortcuts-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const shortcuts = getShortcuts();

    shortcuts.forEach((sc, idx) => {
      const item = document.createElement("div");
      item.className = "hilal-shortcut-item";
      item.title = sc.title + (sc.url ? " (" + sc.url + ")" : "");

      const iconBox = document.createElement("div");
      iconBox.className = "hilal-shortcut-icon-box";

      if (sc.icon) {
        const img = document.createElement("img");
        img.className = "hilal-shortcut-icon";
        img.src = sc.icon;
        img.alt = sc.title || "";
        img.onerror = () => {
          img.remove();
          const initial = document.createElement("span");
          initial.className = "hilal-shortcut-initial";
          initial.textContent = (sc.title || "?").charAt(0).toUpperCase();
          iconBox.appendChild(initial);
        };
        iconBox.appendChild(img);
      } else {
        const initial = document.createElement("span");
        initial.className = "hilal-shortcut-initial";
        initial.textContent = (sc.title || "?").charAt(0).toUpperCase();
        iconBox.appendChild(initial);
      }

      const label = document.createElement("span");
      label.className = "hilal-shortcut-label";
      label.textContent = sc.title;

      const actBtn = document.createElement("button");
      actBtn.className = "hilal-shortcut-action-btn";
      if (document.l10n) {
        document.l10n.setAttributes(actBtn, "hilal-newtab-edit-shortcut");
      }
      actBtn.innerHTML =
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      actBtn.addEventListener("click", e => {
        e.stopPropagation();
        e.preventDefault();
        openShortcutModal(idx);
      });

      item.appendChild(iconBox);
      item.appendChild(label);
      item.appendChild(actBtn);

      item.addEventListener("click", () => {
        if (sc.url) openLocation(sc.url);
      });

      grid.appendChild(item);
    });

    // Add Shortcut button
    const addCard = document.createElement("div");
    addCard.className = "hilal-shortcut-item hilal-add-shortcut";

    const addIconBox = document.createElement("div");
    addIconBox.className = "hilal-shortcut-icon-box";
    addIconBox.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

    const addLabel = document.createElement("span");
    addLabel.className = "hilal-shortcut-label";
    if (document.l10n) {
      document.l10n.setAttributes(addLabel, "hilal-newtab-add-shortcut");
    }

    addCard.appendChild(addIconBox);
    addCard.appendChild(addLabel);
    addCard.addEventListener("click", () => openShortcutModal(-1));

    grid.appendChild(addCard);
  }

  renderShortcuts();
})();
