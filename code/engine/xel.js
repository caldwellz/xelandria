/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "xel.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

xel.initialized = false;
xel.intendedDisplaySize = [2048, 1536]; // 8x8 current map tiles + vertical padding
xel.aspectRatio = xel.intendedDisplaySize[0] / xel.intendedDisplaySize[1];


xel.initialize = function () {
  if (!xel.initialized) {
    var elem = document.getElementById("stage");
    xel.app = new PIXI.Application({resizeTo: elem});
    elem.appendChild(xel.app.view);
    xel.scaleStage();
    xel.initialized = true;
  }
};


xel.destroy = function () {
  if (xel.initialized) {
    xel.Map.clearAll();
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


xel.scaleStage = function () {
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (xel.app) {
    if (w >= h) {
      xel.app.stage.scale.set(h / xel.intendedDisplaySize[1]);
      if (xel.app.stage.width > 0) {
        xel.app.stage.x = (w - xel.app.stage.width) / 2;
        xel.app.stage.y = 0;
      }
    }
    else {
      xel.app.stage.scale.set(w / xel.intendedDisplaySize[0]);
      if (xel.app.stage.height > 0) {
        xel.app.stage.x = 0;
        xel.app.stage.y = (h - xel.app.stage.height) / 2;
      }
    }
  }
};
window.onresize = xel.scaleStage;
