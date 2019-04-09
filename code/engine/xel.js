/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "Please set up environment-specific logger"; }
else logger.file = "xel.js";
if (typeof PIXI === 'undefined') { throw "xel.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

xel.initialize = function () {
	xel.app = new PIXI.Application();
};

xel.destroy = function () {
  xel.app.destroy(true, true);
};

xel.reload = function () {
  xel.destroy();
  xel.initialize();
}
