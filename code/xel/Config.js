/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

// Set up default settings, which can be overridden at runtime
define(["logger"], function (logger) {
  var xel_Config = {};

  logger.debugMode = true;

  xel_Config.display = {};
  xel_Config.display.intendedResolution = [2048, 1408]; // 8x8 test map tiles + vertical padding
  xel_Config.display.aspectRatio = (xel_Config.display.intendedResolution[0] / xel_Config.display.intendedResolution[1]);
  xel_Config.display.cursorBasePath = "assets\/graphics\/gui\/cursors\/";

  xel_Config.maps = {};
  xel_Config.maps.basePath = "assets\/maps\/";

  xel_Config.spritesheets = {};
  xel_Config.spritesheets.basePath = "assets\/graphics\/";

  xel_Config.storage = {};
  xel_Config.storage.connectorNamePrefix = "StorageConnector_";

  return xel_Config;
});
