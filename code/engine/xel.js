/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

xel.initialize = function () {
	xel.app = new PIXI.Application({resizeTo: document.body});
  document.body.removeChild(logger.logbox); // Move it after the canvas element
  document.body.appendChild(xel.app.view);
  document.body.appendChild(logger.logbox);
};

xel.destroy = function () {
  document.body.removeChild(xel.app.view);
  xel.app.destroy(false, true);
  logger.clear();
};

xel.reload = function () {
  xel.destroy();
  xel.initialize();
};
