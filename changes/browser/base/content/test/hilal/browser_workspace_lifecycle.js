/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_workspace_initialization() {
  ok(window.gHilalWorkspaces, "HilalWorkspaces should be initialized");
  ok(window.gHilalWorkspaces._workspaces.length >= 1, "Should have at least one workspace");
  let defaultWs = window.gHilalWorkspaces._workspaces[0];
  is(defaultWs.id, "default", "Default workspace should be named 'default'");
});

add_task(async function test_workspace_tab_assignment() {
  let tab = await BrowserTestUtils.openNewForegroundTab(gBrowser, "about:blank");
  
  // Verify the tab is assigned to the current active workspace
  let activeId = window.gHilalWorkspaces._activeId;
  let tabWs = window.gHilalWorkspaces._getTabWorkspace(tab);
  
  is(tabWs, activeId, "New tab should be assigned to the active workspace");
  
  BrowserTestUtils.removeTab(tab);
});

add_task(async function test_workspace_creation_and_switch() {
  // Scenario 1 & 2: Create a workspace, switch to it, and verify tab state
  let initialActiveId = window.gHilalWorkspaces._activeId;
  
  // Add a new workspace
  let newWorkspaceId = "test-ws-" + Date.now();
  window.gHilalWorkspaces._workspaces.push({
    id: newWorkspaceId,
    name: "Test Workspace",
    emoji: "🚀",
    color: "blue",
    containerId: 0,
  });
  window.gHilalWorkspaces._saveData();
  
  // Switch to new workspace
  window.gHilalWorkspaces._activeId = newWorkspaceId;
  window.gHilalWorkspaces._saveActive();
  window.gHilalWorkspaces._apply();
  
  is(window.gHilalWorkspaces._activeId, newWorkspaceId, "Active workspace should be the new one");
  
  let tab = await BrowserTestUtils.openNewForegroundTab(gBrowser, "about:blank");
  let tabWs = window.gHilalWorkspaces._getTabWorkspace(tab);
  is(tabWs, newWorkspaceId, "New tab should be assigned to the new workspace");
  
  // Switch back
  window.gHilalWorkspaces._activeId = initialActiveId;
  window.gHilalWorkspaces._saveActive();
  window.gHilalWorkspaces._apply();
  
  // The tab from the other workspace should now be hidden
  ok(tab.hidden, "Tab from inactive workspace should be hidden");
  
  // Switch to new workspace again
  window.gHilalWorkspaces._activeId = newWorkspaceId;
  window.gHilalWorkspaces._saveActive();
  window.gHilalWorkspaces._apply();
  
  ok(!tab.hidden, "Tab from active workspace should be visible again");
  
  BrowserTestUtils.removeTab(tab);
  
  // Cleanup
  window.gHilalWorkspaces._activeId = initialActiveId;
  window.gHilalWorkspaces._saveActive();
  window.gHilalWorkspaces._apply();
  window.gHilalWorkspaces._workspaces = window.gHilalWorkspaces._workspaces.filter(ws => ws.id !== newWorkspaceId);
  window.gHilalWorkspaces._saveData();
});
