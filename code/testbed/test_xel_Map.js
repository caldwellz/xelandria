/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "Logger not loaded!"; }
if (typeof xel === 'undefined') { throw "xel engine does not exist!"; }
if (typeof xel.Map === 'undefined') { throw "xel.Map does not exist!"; }
// ***

function test_xel_Map() {
  if (!xel.initialized)
    return;
  logger.beginTest("test_xel_Map");

  var mapName = "a0m0";
  xel.Map.loadTiledMap(mapName, {
    activate: true,
    callback: function (map) {
      if (!map) {
        logger.fail("Creating map object");
        return;
      }
      logger.assert(map.layers && (map.name === mapName), "Creating map object");
      logger.assert(xel.Map.cache[mapName] === map, "Caching map and passing to callback");
      logger.assert(xel.Map._currentMap === map, "Setting loaded map as current map");
      map.canary = true;
      xel.Map.loadTiledMap(mapName, { callback: function (dupMap) {
        logger.assert(dupMap.canary, "Using cache and keeping canary value when reloading same map");
      }});
      xel.Map.clearAll();
      logger.assert(!(xel.Map._currentMap || xel.app.stage.children.length || xel.Map.cache[mapName]), "Clearing maps, stage, and cache");
    }
  });

  // TODO: Add map rotation / spritesheet tests and get rid of rotation test button
}
