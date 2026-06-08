/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

add_task(async function test_auto_accent_from_site() {
  await SpecialPowers.pushPrefEnv({
    set: [
      ["hilal.boosts.enabled", true],
      ["hilal.boosts.data", "{}"],
      ["hilal.boosts.auto_palette.enabled", false],
    ],
  });

  // Open a test tab with example.com
  await BrowserTestUtils.withNewTab(
    "https://example.com/browser/browser/base/content/test/general/dummy_page.html",
    async (browser) => {
      await TestUtils.waitForCondition(
        () => window.gHilalBoosts,
        "Hilal Boosts manager should initialize"
      );

      // Add a meta tag dynamically in the page context
      await SpecialPowers.spawn(browser, [], async () => {
        let meta = content.document.createElement("meta");
        meta.name = "theme-color";
        meta.content = "#aabbcc";
        content.document.head.appendChild(meta);
      });

      // Wait for theme-color extraction to finish
      await TestUtils.waitForCondition(
        () => window.gHilalBoosts._extractedThemeColors["example.com"] === "#aabbcc",
        "Should extract theme-color #aabbcc from page meta"
      );

      const button = document.getElementById("hilal-boosts-button");
      const panel = document.getElementById("hilal-boosts-panel");

      ok(button, "Hilal Boosts button exists");
      ok(panel, "Hilal Boosts panel exists");

      await TestUtils.waitForCondition(
        () => !button.hidden,
        "Hilal Boosts button should be visible on web pages"
      );

      const shown = BrowserTestUtils.waitForEvent(panel, "popupshown");
      button.click();
      await shown;

      is(panel.state, "open", "Hilal Boosts panel should open");

      // Find the "Auto Accent from Site" checkbox in customizer panel
      const checkbox = document.getElementById("hilal-boosts-auto-palette-enable");
      ok(checkbox, "Auto Accent from Site checkbox exists in the Site Customizer panel");

      // Toggle it to true
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));

      // Check if UI active boost attributes are set
      await TestUtils.waitForCondition(
        () => document.documentElement.getAttribute("hilal-boosts-ui") === "true",
        "Browser UI should enable Hilal boosts styling"
      );
      is(
        document.documentElement.style.getPropertyValue("--hilal-boosts-ui-accent"),
        "#aabbcc",
        "Accent color should match the extracted theme color"
      );

      // Verify boost data for the domain has autoPaletteEnabled
      const boost = window.gHilalBoosts.getBoostForDomain("example.com");
      ok(boost.enabled, "Boost should be enabled for domain");
      ok(boost.autoPaletteEnabled, "Auto Palette should be enabled for domain");

      // Close the panel
      const hidden = BrowserTestUtils.waitForEvent(panel, "popuphidden");
      panel.hidePopup();
      await hidden;
    }
  );

  // Check about:preferences#hilal for the "Site Customizer & Dynamic Coloring" groupbox
  await BrowserTestUtils.withNewTab(
    {
      gBrowser,
      url: "about:preferences#hilal",
    },
    async (preferencesBrowser) => {
      const doc = preferencesBrowser.contentDocument;
      ok(doc, "Preferences document exists");

      // Wait for preferences page template to load and initialize paneHilal
      await TestUtils.waitForCondition(
        () => doc.getElementById("hilalBoostsGroup") && !doc.getElementById("hilalBoostsGroup").hidden,
        "Site Customizer & Dynamic Coloring groupbox should be visible"
      );

      const groupbox = doc.getElementById("hilalBoostsGroup");
      ok(groupbox, "Site Customizer groupbox exists in preferences");

      const header = groupbox.querySelector("label h2");
      ok(header, "Header inside groupbox exists");

      // Verify the header text or data-l10n-id
      is(header.getAttribute("data-l10n-id"), "hilal-boosts-header", "Header should have correct l10n ID");

      const prefCheckbox = doc.getElementById("hilalBoostsAutoPalette");
      ok(prefCheckbox, "Auto Palette checkbox exists in preferences");
      is(prefCheckbox.checked, false, "Auto Palette checkbox should be unchecked by default");

      // Toggle the checkbox
      prefCheckbox.checked = true;
      prefCheckbox.dispatchEvent(new Event("command"));

      // Verify that the global preference is updated
      is(
        Services.prefs.getBoolPref("hilal.boosts.auto_palette.enabled"),
        true,
        "Global auto-palette preference should be enabled after toggle"
      );
    }
  );

  await SpecialPowers.popPrefEnv();
});
