/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

{
  const { nsHilalBoostShareDialog } = ChromeUtils.importESModule(
    "resource:///modules/hilal/boosts/HilalBoostShareDialog.mjs"
  );
  const args = window.arguments?.[0] || {};
  window.addEventListener(
    "load",
    () => {
      window.shareDialog = new nsHilalBoostShareDialog(document, window, args);
    },
    { once: true }
  );
}
