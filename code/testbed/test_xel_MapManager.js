/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "Logger not loaded!"; }
if (typeof testutils === 'undefined') { throw "Testbed utils not loaded!"; }
if (typeof xel === 'undefined') { throw "xel engine does not exist!"; }
if (typeof xel.Map === 'undefined') { throw "xel.Map does not exist!"; }
if (typeof xel.MapManager === 'undefined') { throw "xel.MapManager does not exist!"; }
// ***

async function test_xel_MapManager() {
  logger.module = "testbed/test_xel_MapManager";
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

  xel.MapManager.uncache("a0m0");
  if (xel.MapManager._mapCache["a0m0"])
    logger.fail("Map still cached after uncache()");
  else
    logger.pass("Map uncached successfully");

  for (var mapName in maps) {
    xel.MapManager.load(mapName, maps[mapName]);
    await testutils.sleep(1000);
    if ((xel.MapManager._currentMap) && (xel.MapManager._currentMap.name === "a0m0"))
      logger.pass("Map loaded as current map");
    else
      logger.fail("Map not loaded as current map");
  }
}
