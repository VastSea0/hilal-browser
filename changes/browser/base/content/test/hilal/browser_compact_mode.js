/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_compact_mode_initialization() {
  await SpecialPowers.pushPrefEnv({
    set: [
      ["hilal.compact.enabled", true],
      ["hilal.compact.hide_toolbox", true]
    ],
  });

  ok(document.documentElement.hasAttribute("hilal-compact-mode"), "Root element should have hilal-compact-mode attribute");
  
  let toolbox = document.getElementById("navigator-toolbox");
  ok(toolbox, "Navigator toolbox exists");
  
  // Enter customize mode
  let customizePromise = BrowserTestUtils.waitForEvent(window, "customizationready");
  document.getElementById("cmd_CustomizeToolbars").doCommand();
  await customizePromise;
  
  ok(document.documentElement.hasAttribute("customizing"), "Should be in customizing mode");
  // Compact mode attributes might be suspended or handled differently during customize mode
  
  // Exit customize mode
  let customizeEndPromise = BrowserTestUtils.waitForEvent(window, "aftercustomization");
  document.getElementById("cmd_CustomizeToolbars").doCommand();
  await customizeEndPromise;
  
  ok(!document.documentElement.hasAttribute("customizing"), "Should have exited customizing mode");
  ok(document.documentElement.hasAttribute("hilal-compact-mode"), "Should still have compact mode attribute");
  
  await SpecialPowers.popPrefEnv();
});

add_task(async function test_compact_mode_hover_state() {
  await SpecialPowers.pushPrefEnv({
    set: [
      ["hilal.compact.enabled", true],
      ["hilal.compact.hide_toolbox", true]
    ],
  });

  let toolbox = document.getElementById("navigator-toolbox");
  
  // Simulate hover
  EventUtils.synthesizeMouse(toolbox, 10, 10, { type: "mouseenter" }, window);
  EventUtils.synthesizeMouse(toolbox, 10, 10, { type: "mousemove" }, window);
  
  // The toolbox might gain a class or attribute when hovered, wait a tick
  await new Promise(resolve => executeSoon(resolve));
  
  ok(toolbox.classList.contains("hilal-compact-visible") || document.documentElement.hasAttribute("hilal-compact-hover"), 
     "Toolbox should become visible on hover");
     
  EventUtils.synthesizeMouse(document.getElementById("tabbrowser-tabpanels"), 100, 100, { type: "mousemove" }, window);
  
  await SpecialPowers.popPrefEnv();
});
