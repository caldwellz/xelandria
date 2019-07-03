/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "main.js: Logger not loaded!"; }
if (typeof xel === 'undefined') { throw "main.js: xel engine does not exist!"; }
// ***

logger.module = "testbed";

async function testMain() {
  logger.testMode = true;

  if (typeof test_xel === 'function')
    test_xel(); //xel.initialize(), etc.

  if (typeof test_xel_MapManager === 'function')
    test_xel_MapManager();
}

testMain();