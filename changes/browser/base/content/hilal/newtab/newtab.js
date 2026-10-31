/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// HilalNewTabChild answers the HilalNewTab:* events this page dispatches. They
// must bubble to reach the actor, which listens above the window.
(function () {
  // Theme

  const THEME_VARS = {
    accent: "--accent",
    primary: "--primary",
    bg: "--bg",
    surface: "--surface",
    surfaceHover: "--surface-high",
    border: "--outline",
    text: "--on-surface",
    textMuted: "--on-surface-variant",
  };

  function applyTheme(theme) {
    if (!theme) {
      return;
    }
    const root = document.documentElement;
    for (const [key, cssVar] of Object.entries(THEME_VARS)) {
      if (theme[key]) {
        root.style.setProperty(cssVar, theme[key]);
      }
    }
    if (typeof theme.isDark == "boolean") {
      root.style.colorScheme = theme.isDark ? "dark" : "light";
    }
    try {
      localStorage.setItem("hilal_newtab_theme", JSON.stringify(theme));
    } catch (e) {}
  }

  // Apply the last theme right away so the page does not flash.
  try {
    applyTheme(JSON.parse(localStorage.getItem("hilal_newtab_theme")));
  } catch (e) {}

  window.addEventListener("HilalNewTab:Theme", event =>
    applyTheme(event.detail)
  );
  window.dispatchEvent(
    new CustomEvent("HilalNewTab:GetTheme", { bubbles: true })
  );

  // Navigation goes through the shell so that bangs, address fixup and the
  // user's default search engine work the same as in the address bar.
  function navigate(input) {
    window.dispatchEvent(
      new CustomEvent("HilalNewTab:Navigate", { bubbles: true, detail: input })
    );
  }

  // Clock

  const hoursEl = document.getElementById("clock-hours");
  const minutesEl = document.getElementById("clock-minutes");
  const dateEl = document.getElementById("clock-date");
  const periodEl = document.getElementById("clock-period");
  const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function updateClock() {
    const now = new Date();
    const parts = timeFormat.formatToParts(now);
    const hour = parts.find(p => p.type == "hour")?.value ?? "";
    const minute = parts.find(p => p.type == "minute")?.value ?? "";
    const period = parts.find(p => p.type == "dayPeriod")?.value;
    hoursEl.textContent = hour;
    minutesEl.textContent = minute;
    periodEl.textContent = period ?? "";
    dateEl.textContent = dateFormat.format(now);
    setTimeout(updateClock, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
  }
  updateClock();

  // Search

  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");

  searchInput.addEventListener("input", () => {
    searchClear.hidden = !searchInput.value;
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchClear.hidden = true;
    searchInput.focus();
  });
  searchForm.addEventListener("submit", event => {
    event.preventDefault();
    const value = searchInput.value.trim();
    if (value) {
      navigate(value);
    }
  });

  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => navigate(chip.dataset.url));
  }

  // Shortcuts

  const DEFAULT_SHORTCUTS = [
    { title: "Wikipedia", url: "https://www.wikipedia.org/" },
    { title: "YouTube", url: "https://www.youtube.com/" },
    { title: "Reddit", url: "https://www.reddit.com/" },
    { title: "GitHub", url: "https://github.com/" },
    { title: "Add-ons", url: "https://addons.mozilla.org/" },
  ];
  const MAX_SHORTCUTS = 12;

  function loadShortcuts() {
    try {
      const stored = JSON.parse(localStorage.getItem("hilal_shortcuts"));
      if (Array.isArray(stored)) {
        return stored.map(({ title, url }) => ({ title, url }));
      }
    } catch (e) {}
    return DEFAULT_SHORTCUTS.slice();
  }

  function saveShortcuts() {
    try {
      localStorage.setItem("hilal_shortcuts", JSON.stringify(shortcuts));
    } catch (e) {}
    requestSiteIcons();
  }

  let shortcuts = loadShortcuts();

  function normalizeUrl(value) {
    const url = value.trim();
    return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
  }

  // The actor answers with Firefox's bundled large icons for popular sites;
  // other sites fall back to page-icon:, which reads Firefox's favicon cache,
  // so the page never contacts a shortcut's site just to draw its icon.
  let siteIcons = {};
  window.addEventListener("HilalNewTab:SiteIcons", event => {
    siteIcons = event.detail ?? {};
    renderShortcuts();
  });

  function requestSiteIcons() {
    window.dispatchEvent(
      new CustomEvent("HilalNewTab:GetSiteIcons", {
        bubbles: true,
        detail: shortcuts.map(shortcut => shortcut.url),
      })
    );
  }

  function createIcon(shortcut) {
    const box = document.createElement("span");
    box.className = "tile-icon";
    const letter = document.createElement("span");
    letter.className = "tile-letter";
    letter.textContent = (shortcut.title || "?").charAt(0).toUpperCase();
    const img = document.createElement("img");
    img.alt = "";
    // Sites without a cached icon get the 16px default globe, which the
    // letter looks better than.
    img.addEventListener("load", () => {
      if (img.naturalWidth > 16) {
        box.classList.add("has-image");
      }
    });
    const siteIcon = siteIcons[shortcut.url];
    // Bundled site icons are full tiles, not small glyphs.
    box.classList.toggle("rich", !!siteIcon);
    img.src = siteIcon ?? `page-icon:${shortcut.url}#size=64`;
    box.append(letter, img);
    return box;
  }

  function renderShortcuts() {
    const container = document.getElementById("shortcuts");
    container.replaceChildren();

    shortcuts.forEach((shortcut, index) => {
      const tile = document.createElement("a");
      tile.className = "tile";
      tile.href = shortcut.url;
      tile.title = shortcut.url;

      const label = document.createElement("span");
      label.className = "tile-label";
      label.textContent = shortcut.title;

      const edit = document.createElement("button");
      edit.className = "icon-button tile-edit";
      document.l10n.setAttributes(edit, "hilal-newtab-edit-shortcut");
      edit.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="18" r="1.4"/></svg>';
      edit.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openDialog(index);
      });

      tile.append(createIcon(shortcut), label, edit);
      container.append(tile);
    });

    if (shortcuts.length < MAX_SHORTCUTS) {
      const add = document.createElement("button");
      add.className = "tile tile-add";
      const icon = document.createElement("span");
      icon.className = "tile-icon";
      icon.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      const label = document.createElement("span");
      label.className = "tile-label";
      document.l10n.setAttributes(label, "hilal-newtab-add-shortcut");
      add.append(icon, label);
      add.addEventListener("click", () => openDialog(-1));
      container.append(add);
    }
  }

  // Shortcut dialog

  const dialog = document.getElementById("shortcut-dialog");
  const form = document.getElementById("shortcut-form");
  const nameInput = document.getElementById("shortcut-name");
  const urlInput = document.getElementById("shortcut-url");
  const deleteButton = document.getElementById("dialog-delete");
  let editIndex = -1;

  function openDialog(index) {
    editIndex = index;
    const shortcut = shortcuts[index];
    document.l10n.setAttributes(
      document.getElementById("dialog-title"),
      shortcut ? "hilal-newtab-dialog-edit-title" : "hilal-newtab-dialog-title"
    );
    nameInput.value = shortcut?.title ?? "";
    urlInput.value = shortcut?.url ?? "";
    deleteButton.hidden = !shortcut;
    dialog.showModal();
    nameInput.focus();
  }

  form.addEventListener("submit", () => {
    const shortcut = {
      title: nameInput.value.trim(),
      url: normalizeUrl(urlInput.value),
    };
    if (editIndex >= 0) {
      shortcuts[editIndex] = shortcut;
    } else {
      shortcuts.push(shortcut);
    }
    saveShortcuts();
    renderShortcuts();
  });
  deleteButton.addEventListener("click", () => {
    shortcuts.splice(editIndex, 1);
    saveShortcuts();
    renderShortcuts();
    dialog.close();
  });
  document
    .getElementById("dialog-cancel")
    .addEventListener("click", () => dialog.close());

  renderShortcuts();
  requestSiteIcons();
})();
