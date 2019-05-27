/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "Logger not loaded!"; }
if (typeof testutils === 'undefined') { throw "Testbed utils not loaded!"; }
if (typeof xel === 'undefined') { throw "xel engine does not exist!"; }
if (typeof xel.Map === 'undefined') { throw "xel.Map does not exist!"; }
if (typeof xel.MapManager === 'undefined') { throw "xel.MapManager does not exist!"; }
// ***

async function test_xel_Map() {
  logger.module = "testbed/test_xel_Map";
  if (!xel.initialized)
    return;

  var maps = {
    "a0m0" : "assets/maps/a0m0.json"
  };

  xel.MapManager.cache(maps);
  await testutils.sleep(1000);
  if (xel.MapManager._mapCache["a0m0"]) {
    logger.pass("Map a0m0 loaded into cache");
    xel.MapManager._mapCache["a0m0"].canary = true;
    xel.MapManager.cache(maps);
    await testutils.sleep(1000);

    if(xel.MapManager._mapCache["a0m0"].canary)
      logger.pass("Map cache used (canary value retained)");
    else
      logger.fail("Map reloaded instead of cached (canary value missing)");
  }
  else {
    logger.fail("Map a0m0 not loaded into cache");
  }
}