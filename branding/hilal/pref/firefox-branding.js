/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Hilal Browser branding-specific prefs.

pref("startup.homepage_override_url", "");
pref("startup.homepage_welcome_url", "");
pref("startup.homepage_welcome_url.additional", "");

// The time interval between checks for a new version (in seconds).
pref("app.update.interval", 86400); // 24 hours
// Give the user x seconds to react before showing the big UI. default=24 hours
pref("app.update.promptWaitTime", 86400);
// URL user can browse to manually if all update installation attempts fail.
pref("app.update.url.manual", "https://browser.gkdevstudio.org/download");
// "More information about this update" link in the update wizard.
pref("app.update.url.details", "https://browser.gkdevstudio.org/releases");

// The number of days a binary is permitted to be old without checking for
// an update. This assumes that app.update.checkInstallTime is true.
pref("app.update.checkInstallTime.days", 7);

// Give the user x seconds to reboot before showing a badge on the hamburger
// button. default=4 hours
pref("app.update.badgeWaitTime", 14400);

// Number of usages of the web console.
// If this is less than 5, then pasting code into the web console is disabled.
pref("devtools.selfxss.count", 5);
