/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// The app sends the site fixes of the current live update bundle over a native port and again
// whenever a new bundle arrives. Each fix becomes a dynamically registered content script.

let registered = [];
let queue = Promise.resolve();

async function apply(fixes) {
  const previous = registered;
  registered = [];
  await Promise.all(previous.map(script => script.unregister().catch(() => {})));
  for (const fix of fixes || []) {
    const options = {
      matches: fix.matches,
      runAt: fix.runAt || "document_idle",
      allFrames: false,
    };
    if (fix.css) {
      options.css = [{ code: fix.css }];
    }
    if (fix.js) {
      options.js = [{ code: fix.js }];
    }
    try {
      registered.push(await browser.contentScripts.register(options));
    } catch (e) {
      console.error(`Hilal live: site fix ${fix.id} was not applied`, e);
    }
  }
}

let retryDelay = 1000;

function connect() {
  const port = browser.runtime.connectNative("hilal");
  port.onMessage.addListener(message => {
    retryDelay = 1000;
    if (message && message.type === "siteFixes") {
      queue = queue.then(() => apply(message.fixes));
    }
  });
  port.onDisconnect.addListener(() => {
    setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 60000);
  });
}

connect();
