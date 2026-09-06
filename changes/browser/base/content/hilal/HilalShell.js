/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global gBrowser, Services, ChromeUtils */

(function () {
  "use strict";

  const HilalShell = {
    initialized: false,

    init() {
      if (this.initialized) return;
      if (!window.gBrowser || !window.gBrowser.tabContainer) {
        window.addEventListener("load", () => this.init(), { once: true });
        return;
      }
      this.initialized = true;

      this.createTopBar();
      this.createSidebar();
      this.bindBrowserEvents();
      this.renderWorkspaces();
      this.renderTabs();
      this.syncUrl();
    },

    createTopBar() {
      if (document.getElementById("hilal-topbar")) return;

      const topbar = document.createElement("header");
      topbar.id = "hilal-topbar";

      // Spacer and mount for macOS traffic lights
      const spacer = document.createElement("div");
      spacer.id = "hilal-traffic-lights-spacer";

      const nativeButtons =
        document.querySelector("#TabsToolbar .titlebar-buttonbox-container") ||
        document.querySelector(".titlebar-buttonbox-container");
      if (nativeButtons) {
        spacer.appendChild(nativeButtons);
      } else {
        const boxContainer = document.createXULElement
          ? document.createXULElement("hbox")
          : document.createElement("div");
        boxContainer.className = "titlebar-buttonbox-container";
        const box = document.createXULElement
          ? document.createXULElement("hbox")
          : document.createElement("div");
        box.className = "titlebar-buttonbox";
        boxContainer.appendChild(box);
        spacer.appendChild(boxContainer);
      }
      topbar.appendChild(spacer);

      // Nav group (Back, Forward, Reload)
      const navGroup = document.createElement("div");
      navGroup.id = "hilal-nav-group";

      const backBtn = document.createElement("button");
      backBtn.className = "hilal-btn";
      backBtn.id = "hilal-back-btn";
      backBtn.title = "Back";
      backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>';
      backBtn.addEventListener("click", () => {
        if (window.gBrowser?.canGoBack) {
          window.gBrowser.goBack();
        } else if (window.gBrowser?.webNavigation?.canGoBack) {
          window.gBrowser.webNavigation.goBack();
        }
      });
      navGroup.appendChild(backBtn);

      const forwardBtn = document.createElement("button");
      forwardBtn.className = "hilal-btn";
      forwardBtn.id = "hilal-forward-btn";
      forwardBtn.title = "Forward";
      forwardBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>';
      forwardBtn.addEventListener("click", () => {
        if (window.gBrowser?.canGoForward) {
          window.gBrowser.goForward();
        } else if (window.gBrowser?.webNavigation?.canGoForward) {
          window.gBrowser.webNavigation.goForward();
        }
      });
      navGroup.appendChild(forwardBtn);

      const reloadBtn = document.createElement("button");
      reloadBtn.className = "hilal-btn";
      reloadBtn.id = "hilal-reload-btn";
      reloadBtn.title = "Reload";
      reloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
      reloadBtn.addEventListener("click", () => {
        if (window.gBrowser) window.gBrowser.reload();
      });
      navGroup.appendChild(reloadBtn);

      topbar.appendChild(navGroup);

      // Material 3 URL Search Pill
      const urlContainer = document.createElement("div");
      urlContainer.id = "hilal-url-container";

      const secIcon = document.createElement("div");
      secIcon.id = "hilal-url-security-icon";
      secIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>';
      urlContainer.appendChild(secIcon);

      const urlInput = document.createElement("input");
      urlInput.id = "hilal-url-input";
      urlInput.type = "text";
      urlInput.placeholder = "Search or enter address...";
      urlInput.setAttribute("autocomplete", "off");
      urlInput.setAttribute("spellcheck", "false");

      urlInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.navigate(urlInput.value);
        }
      });
      urlInput.addEventListener("focus", () => urlInput.select());
      urlContainer.appendChild(urlInput);

      topbar.appendChild(urlContainer);

      // Top Right Controls (Sidebar Toggle)
      const rightGroup = document.createElement("div");
      rightGroup.id = "hilal-top-right-group";
      rightGroup.style.display = "flex";
      rightGroup.style.gap = "4px";

      const sidebarToggle = document.createElement("button");
      sidebarToggle.className = "hilal-btn";
      sidebarToggle.id = "hilal-sidebar-toggle-btn";
      sidebarToggle.title = "Toggle Sidebar";
      sidebarToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm16 16V5H9v14h10z"/></svg>';
      sidebarToggle.addEventListener("click", () => {
        const sb = document.getElementById("hilal-sidebar");
        if (sb) {
          const isCollapsed = sb.getAttribute("collapsed") === "true";
          sb.setAttribute("collapsed", isCollapsed ? "false" : "true");
        }
      });
      rightGroup.appendChild(sidebarToggle);

      topbar.appendChild(rightGroup);

      // Insert topbar before #browser
      const browserEl = document.getElementById("browser");
      if (browserEl && browserEl.parentNode) {
        browserEl.parentNode.insertBefore(topbar, browserEl);
      } else {
        document.body.prepend(topbar);
      }
    },

    createSidebar() {
      if (document.getElementById("hilal-sidebar")) return;

      const sidebar = document.createElement("aside");
      sidebar.id = "hilal-sidebar";

      // Workspaces rail
      const wsBar = document.createElement("div");
      wsBar.id = "hilal-workspaces-bar";
      sidebar.appendChild(wsBar);

      // Tabs header (+ New Tab)
      const tabsHeader = document.createElement("div");
      tabsHeader.id = "hilal-tabs-bar-header";

      const label = document.createElement("span");
      label.className = "hilal-tabs-label";
      label.textContent = "Tabs";
      tabsHeader.appendChild(label);

      const newTabBtn = document.createElement("button");
      newTabBtn.className = "hilal-btn";
      newTabBtn.id = "hilal-newtab-btn";
      newTabBtn.title = "New Tab (⌘T / Ctrl+T)";
      newTabBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>';
      newTabBtn.addEventListener("click", () => this.openNewTab());
      tabsHeader.appendChild(newTabBtn);

      sidebar.appendChild(tabsHeader);

      // Vertical tab list
      const tabList = document.createElement("div");
      tabList.id = "hilal-tab-list";
      sidebar.appendChild(tabList);

      // Sidebar Footer (Settings)
      const footer = document.createElement("div");
      footer.id = "hilal-sidebar-footer";

      const settingsBtn = document.createElement("button");
      settingsBtn.className = "hilal-btn";
      settingsBtn.id = "hilal-settings-btn";
      settingsBtn.title = "Settings";
      settingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
      settingsBtn.addEventListener("click", () => {
        if (typeof window.openPreferences === "function") {
          window.openPreferences();
        } else {
          this.navigate("about:preferences");
        }
      });
      footer.appendChild(settingsBtn);

      sidebar.appendChild(footer);

      // Insert sidebar as first child of #browser
      const browserEl = document.getElementById("browser");
      if (browserEl) {
        browserEl.insertBefore(sidebar, browserEl.firstElementChild);
      }
    },

    renderWorkspaces() {
      const wsBar = document.getElementById("hilal-workspaces-bar");
      if (!wsBar) return;
      wsBar.replaceChildren();

      const manager = window.gHilalWorkspaces;
      if (manager && Array.isArray(manager._workspaces) && manager._workspaces.length > 0) {
        manager._workspaces.forEach((ws) => {
          const chip = document.createElement("button");
          chip.className = "hilal-ws-chip" + (ws.id === manager._activeId ? " active" : "");
          chip.textContent = (ws.emoji ? ws.emoji + " " : "") + (ws.name || ws.id);
          chip.addEventListener("click", () => {
            if (typeof manager.switchTo === "function") {
              manager.switchTo(ws.id);
            }
            this.renderWorkspaces();
            this.renderTabs();
          });
          wsBar.appendChild(chip);
        });

        const addWsBtn = document.createElement("button");
        addWsBtn.className = "hilal-ws-chip hilal-ws-add";
        addWsBtn.title = "New Workspace";
        addWsBtn.textContent = "+";
        addWsBtn.addEventListener("click", () => {
          if (typeof manager._showCreateDialog === "function") {
            manager._showCreateDialog();
          }
        });
        wsBar.appendChild(addWsBtn);
      } else {
        const defaultChip = document.createElement("button");
        defaultChip.className = "hilal-ws-chip active";
        defaultChip.textContent = "Personal";
        wsBar.appendChild(defaultChip);
      }
    },

    navigate(rawUrl) {
      if (!rawUrl || !window.gBrowser) return;
      let url = rawUrl.trim();
      if (!url) return;

      if (!url.includes("://") && !url.startsWith("about:") && !url.startsWith("chrome:")) {
        if (url.includes(".") && !url.includes(" ")) {
          url = "https://" + url;
        } else {
          url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
        }
      }

      try {
        const principal = Services.scriptSecurityManager.getSystemPrincipal();
        const uri = Services.io.newURI(url);
        if (typeof window.gBrowser.loadURI === "function") {
          window.gBrowser.loadURI(uri, { triggeringPrincipal: principal });
        } else if (window.gBrowser.selectedBrowser?.loadURI) {
          window.gBrowser.selectedBrowser.loadURI(uri, { triggeringPrincipal: principal });
        }
      } catch (e) {
        console.error("Hilal navigation failed:", e);
      }
    },

    openNewTab(url = "about:newtab") {
      if (!window.gBrowser) return;
      try {
        const principal = Services.scriptSecurityManager.getSystemPrincipal();
        window.gBrowser.addTab(url, {
          triggeringPrincipal: principal,
          inBackground: false,
        });
      } catch (e) {
        console.error("Hilal openNewTab failed:", e);
      }
    },

    renderTabs() {
      const container = document.getElementById("hilal-tab-list");
      if (!container || !window.gBrowser) return;

      container.replaceChildren();
      const tabs = Array.from(window.gBrowser.tabs || []);

      tabs.forEach((tab) => {
        if (tab.hidden) return;

        const isSelected = tab.selected || tab === window.gBrowser.selectedTab;
        const pill = document.createElement("div");
        pill.className = "hilal-tab-pill" + (isSelected ? " active" : "");

        // Favicon
        const iconDiv = document.createElement("div");
        iconDiv.className = "hilal-tab-icon";
        const iconImg = document.createElement("img");
        const favSrc = tab.image || tab.getAttribute("image");
        iconImg.src = favSrc && !favSrc.startsWith("chrome://browser/skin/tabbrowser/loading")
          ? favSrc
          : "chrome://global/skin/icons/defaultFavicon.svg";
        iconDiv.appendChild(iconImg);
        pill.appendChild(iconDiv);

        // Title
        const titleSpan = document.createElement("span");
        titleSpan.className = "hilal-tab-title";
        titleSpan.textContent = tab.label || tab.getAttribute("label") || "New Tab";
        pill.appendChild(titleSpan);

        // Close button (pure unicode cross, XML safe)
        const closeBtn = document.createElement("button");
        closeBtn.className = "hilal-tab-close-btn";
        closeBtn.textContent = "\u00D7";
        closeBtn.title = "Close Tab";
        closeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          window.gBrowser.removeTab(tab);
        });
        pill.appendChild(closeBtn);

        // Tab click -> Select
        pill.addEventListener("click", () => {
          window.gBrowser.selectedTab = tab;
        });

        container.appendChild(pill);
      });

      this.updateNavButtons();
    },

    syncUrl() {
      const input = document.getElementById("hilal-url-input");
      if (!input || !window.gBrowser) return;
      if (document.activeElement === input) return;

      const currentUri = window.gBrowser.currentURI?.spec || "";
      if (currentUri === "about:blank" || currentUri === "about:newtab") {
        input.value = "";
      } else {
        input.value = currentUri;
      }
      this.updateNavButtons();
    },

    updateNavButtons() {
      const backBtn = document.getElementById("hilal-back-btn");
      const forwardBtn = document.getElementById("hilal-forward-btn");
      if (backBtn && window.gBrowser) {
        const canBack = window.gBrowser.canGoBack ?? window.gBrowser.webNavigation?.canGoBack ?? false;
        backBtn.disabled = !canBack;
      }
      if (forwardBtn && window.gBrowser) {
        const canForward = window.gBrowser.canGoForward ?? window.gBrowser.webNavigation?.canGoForward ?? false;
        forwardBtn.disabled = !canForward;
      }
    },

    bindBrowserEvents() {
      if (!window.gBrowser) return;

      const tc = window.gBrowser.tabContainer;
      if (tc) {
        tc.addEventListener("TabOpen", () => this.renderTabs());
        tc.addEventListener("TabClose", () => this.renderTabs());
        tc.addEventListener("TabSelect", () => {
          this.renderTabs();
          this.syncUrl();
        });
        tc.addEventListener("TabAttrModified", () => this.renderTabs());
        tc.addEventListener("TabHide", () => this.renderTabs());
        tc.addEventListener("TabShow", () => this.renderTabs());
      }

      window.gBrowser.addProgressListener({
        onLocationChange: (aBrowser) => {
          if (aBrowser === window.gBrowser.selectedBrowser) {
            this.syncUrl();
            this.renderTabs();
          }
        },
      });

      // Keyboard shortcuts
      window.addEventListener("keydown", (e) => {
        const isMac = Services?.appinfo?.OS === "Darwin" ||
          (typeof navigator !== "undefined" && (navigator.platform?.includes("Mac") || navigator.userAgent?.includes("Mac")));
        const isAccel = isMac ? e.metaKey : e.ctrlKey;

        if (isAccel && e.key.toLowerCase() === "l") {
          e.preventDefault();
          const input = document.getElementById("hilal-url-input");
          if (input) {
            input.focus();
            input.select();
          }
        } else if (isAccel && e.key.toLowerCase() === "t") {
          e.preventDefault();
          this.openNewTab();
        } else if (isAccel && e.key.toLowerCase() === "w") {
          e.preventDefault();
          if (window.gBrowser?.selectedTab) {
            window.gBrowser.removeTab(window.gBrowser.selectedTab);
          }
        } else if (isAccel && e.key.toLowerCase() === "r") {
          e.preventDefault();
          if (window.gBrowser) {
            window.gBrowser.reload();
          }
        }
      });
    },
  };

  function startShell() {
    if (typeof window.gBrowser !== "undefined" && window.gBrowser.tabContainer) {
      HilalShell.init();
    } else {
      window.addEventListener("load", () => HilalShell.init(), { once: true });
    }
  }

  if (document.readyState === "complete") {
    startShell();
  } else {
    window.addEventListener("DOMContentLoaded", startShell, { once: true });
  }

  window.gHilalShell = HilalShell;
})();
