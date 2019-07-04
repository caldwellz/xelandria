/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "Logger not loaded!"; }
if (typeof testutils === 'undefined') { throw "Testbed utils not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.initialize === 'undefined')) { throw "xel engine not loaded!"; }
// ***

function test_xel() {
  xel.initialize()
  if (!xel.initialized) {
    logger.fail("testbed/test_xel: Could not initialize xel engine");
    return;
  }
  logger.pass("testbed/test_xel: xel initialized");

  xel.destroy();
  if (xel.initialized) {
    logger.fail("testbed/test_xel: xel engine not destroyed properly (xel.initialized is true still)");
    return;
  }
  logger.pass("testbed/test_xel: xel destroyed");

  xel.reload()
  if (!xel.initialized) {
    logger.fail("testbed/test_xel: Could not reload xel engine");
    return;
  }
  logger.pass("testbed/test_xel: xel reloaded");
}
