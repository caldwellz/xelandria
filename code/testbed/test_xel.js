/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "Logger not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.initialize === 'undefined')) { throw "xel engine not loaded!"; }
// ***

function test_xel() {
  logger.beginTest("test_xel");

  xel.initialize();
  logger.assert(xel.initialized, "Initializing xel engine");
  
  if (xel.initialized) {
    xel.destroy();
    logger.assert(!xel.initialized, "Destroying xel engine");
  }

  xel.reload()
  logger.assert(xel.initialized, "Reloading xel engine");
}
