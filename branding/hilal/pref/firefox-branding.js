/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Hilal Browser branding-specific prefs.

pref("startup.homepage_override_url", "");
pref("startup.homepage_welcome_url", "");
pref("startup.homepage_welcome_url.additional", "");
pref("browser.uitour.enabled", false);
pref("browser.shell.checkDefaultBrowser", false);

// The time interval between checks for a new version (in seconds).
pref("app.update.interval", 86400); // 24 hours
// Give the user x seconds to react before showing the big UI. default=24 hours
pref("app.update.promptWaitTime", 86400);
// URL user can browse to manually if all update installation attempts fail.
pref("app.update.url.manual", "https://hilal.gkdevstudio.org/download");
// "More information about this update" link in the update wizard.
pref("app.update.url.details", "https://hilal.gkdevstudio.org/releases");

// The number of days a binary is permitted to be old without checking for
// an update. This assumes that app.update.checkInstallTime is true.
pref("app.update.checkInstallTime.days", 7);

// Give the user x seconds to reboot before showing a badge on the hamburger
// button. default=4 hours
pref("app.update.badgeWaitTime", 14400);

// Number of usages of the web console.
// If this is less than 5, then pasting code into the web console is disabled.
pref("devtools.selfxss.count", 5);

// Privacy-first Hilal defaults, informed by Betterfox and arkenfox.
// These are default prefs rather than locked prefs, so users can still opt in.

// Telemetry, health reports, coverage, and usage reporting.
pref("datareporting.policy.dataSubmissionEnabled", false);
pref("datareporting.healthreport.uploadEnabled", false);
pref("datareporting.usage.uploadEnabled", false);
pref("toolkit.telemetry.unified", false);
pref("toolkit.telemetry.enabled", false);
pref("toolkit.telemetry.server", "data:,");
pref("toolkit.telemetry.archive.enabled", false);
pref("toolkit.telemetry.newProfilePing.enabled", false);
pref("toolkit.telemetry.shutdownPingSender.enabled", false);
pref("toolkit.telemetry.updatePing.enabled", false);
pref("toolkit.telemetry.bhrPing.enabled", false);
pref("toolkit.telemetry.firstShutdownPing.enabled", false);
pref("toolkit.telemetry.coverage.opt-out", true);
pref("toolkit.coverage.opt-out", true);
pref("toolkit.coverage.endpoint.base", "");
pref("toolkit.telemetry.user_characteristics_ping.opt-out", true);
pref("toolkit.telemetry.user_characteristics_ping.send-once", false);

// Tracking protection and privacy signals.
pref("browser.contentblocking.category", "strict");
pref("privacy.globalprivacycontrol.enabled", true);
pref("privacy.globalprivacycontrol.functionality.enabled", true);
pref("privacy.donottrackheader.enabled", true);
pref("privacy.donottrackheader.value", 1);
pref("privacy.antitracking.isolateContentScriptResources", true);

// Experiments, studies, rollouts, recommendations, and Mozilla promo surfaces.
pref("app.shield.optoutstudies.enabled", false);
pref("app.normandy.enabled", false);
pref("app.normandy.api_url", "");
pref("browser.discovery.enabled", false);
pref("browser.discovery.containers.enabled", false);
pref("extensions.getAddons.cache.enabled", false);
pref("extensions.getAddons.showPane", false);
pref("extensions.htmlaboutaddons.recommendations.enabled", false);
pref("permissions.manager.defaultsUrl", "");
pref("browser.preferences.moreFromMozilla", false);
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.addons", false);
pref("browser.newtabpage.activity-stream.asrouter.userprefs.cfr.features", false);
pref("browser.aboutwelcome.enabled", false);
pref("browser.startup.homepage_override.mstone", "ignore");

// Crash report submission.
pref("breakpad.reportURL", "");
pref("browser.tabs.crashReporting.sendReport", false);
pref("browser.crashReports.unsubmittedCheck.autoSubmit2", false);

// New tab telemetry, sponsored content, recommendations, and Pocket.
pref("browser.newtabpage.activity-stream.feeds.telemetry", false);
pref("browser.newtabpage.activity-stream.telemetry", false);
pref("browser.newtabpage.activity-stream.telemetry.privatePing.enabled", false);
pref("browser.newtabpage.activity-stream.showSponsored", false);
pref("browser.newtabpage.activity-stream.showSponsoredTopSites", false);
pref("browser.newtabpage.activity-stream.showSponsoredCheckboxes", false);
pref("browser.newtabpage.activity-stream.feeds.section.topstories", false);
pref("browser.newtabpage.activity-stream.feeds.system.topstories", false);
pref("browser.newtabpage.activity-stream.default.sites", "");
pref("browser.newtabpage.activity-stream.section.highlights.includePocket", false);
pref("extensions.pocket.enabled", false);

// Search and address-bar suggestions that can make unsolicited network calls.
pref("browser.search.suggest.enabled", false);
pref("browser.urlbar.suggest.searches", false);
pref("browser.urlbar.quicksuggest.enabled", false);
pref("browser.urlbar.suggest.quicksuggest.sponsored", false);
pref("browser.urlbar.suggest.quicksuggest.nonsponsored", false);
pref("browser.urlbar.trending.featureGate", false);
pref("browser.urlbar.addons.featureGate", false);
pref("browser.urlbar.amp.featureGate", false);
pref("browser.urlbar.importantDates.featureGate", false);
pref("browser.urlbar.market.featureGate", false);
pref("browser.urlbar.mdn.featureGate", false);
pref("browser.urlbar.weather.featureGate", false);
pref("browser.urlbar.wikipedia.featureGate", false);
pref("browser.urlbar.yelp.featureGate", false);
pref("browser.urlbar.yelpRealtime.featureGate", false);
pref("browser.urlbar.groupLabels.enabled", false);
pref("browser.formfill.enable", false);
pref("browser.download.manager.addToRecentDocs", false);
pref("browser.search.update", false);

// Speculative loading and prefetching.
pref("network.http.speculative-parallel-limit", 0);
pref("network.dns.disablePrefetch", true);
pref("network.dns.disablePrefetchFromHTTPS", true);
pref("network.prefetch-next", false);
pref("browser.urlbar.speculativeConnect.enabled", false);
pref("browser.places.speculativeConnect.enabled", false);

// Keep Safe Browsing's local protections, but disable remote download lookups.
pref("browser.safebrowsing.downloads.remote.enabled", false);

// Security hardening with low compatibility impact.
pref("dom.security.https_only_mode", true);
pref("dom.security.https_only_mode_error_page_user_suggestions", true);
pref("security.ssl.treat_unsafe_negotiation_as_broken", true);
pref("security.tls.enable_0rtt_data", false);
pref("security.csp.reporting.enabled", false);
pref("pdfjs.enableScripting", false);

// Captive portal and connectivity checks are background Mozilla network calls.
pref("captivedetect.canonicalURL", "");
pref("network.captive-portal-service.enabled", false);
pref("network.connectivity-service.enabled", false);

// AI/ML integration defaults.
pref("browser.ai.control.default", "blocked");
pref("browser.ml.enable", false);
pref("browser.ml.chat.enabled", false);
pref("browser.ml.chat.menu", false);
pref("browser.tabs.groups.smart.enabled", false);
pref("browser.ml.linkPreview.enabled", false);

// Permission defaults.
pref("permissions.default.desktop-notification", 2);
pref("permissions.default.geo", 2);
pref("geo.provider.network.url", "https://beacondb.net/v1/geolocate");
pref("geo.provider.ms-windows-location", false);
pref("geo.provider.use_corelocation", false);
pref("geo.provider.use_geoclue", false);
