/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

xel.initialized = false;

xel.initialize = function () {
  if (!xel.initialized) {
    var elem = document.getElementById("stage");
    xel.app = new PIXI.Application({resizeTo: elem});
    elem.appendChild(xel.app.view);
    xel.initialized = true;
  }
};

xel.destroy = function () {
  if (xel.initialized) {
    document.getElementById("stage").removeChild(xel.app.view);
    xel.app.destroy(false, true);
    delete xel.app;
    if (!logger.testMode)
      logger.clear();
    xel.initialized = false;
  }
};

xel.reload = function () {
  xel.destroy();
  xel.initialize();
};
