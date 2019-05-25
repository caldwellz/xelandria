/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "main.js: Logger not loaded!"; }
if (typeof xel === 'undefined') { throw "main.js: xel engine does not exist!"; }
// ***

function main() {
  logger.debugMode = true;
  xel.initialize();

  var startMap = xel.MapManager.get("a0m0", "assets/maps/a0m0.json");
  logger.log(startMap.tiledversion);
}

main();
