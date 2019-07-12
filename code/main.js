/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "main.js: Logger not loaded!"; }
if (typeof xel === 'undefined') { throw "main.js: xel engine does not exist!"; }
// ***

function setup() {
  xel.Map.loadTiledMap("a0m0-iso", {activate: true});

  return true;
}


function update() {
  
}


function main() {
  logger.debugMode = true;
  xel.initialize();
  if (xel.initialized) {
    if (setup())
      xel.app.ticker.add(update);
  }
}

main();
