/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["logger", "pixi5", "xel/Config", "xel/EntityManager", "xel/MapManager", "xel/Map", "xel/PersistentStorageManager"],
function (logger, PIXI, Config, EntityManager, MapManager, Map, PersistentStorageManager) {
  var xel = {};
  xel.initialized = false;

  // Copy submodules in
  xel.Config = Config;
  xel.EntityManager = EntityManager;
  xel.MapManager = MapManager;
  xel.Map = Map;
  xel.PersistentStorageManager = PersistentStorageManager;

  // Hoist to window so we can manipulate with browser console
  //if (logger.debugMode)
    window.xel = xel;

  xel.initialize = function () {
    if (!xel.initialized) {
      var elem = document.getElementById("stage");
      xel.app = new PIXI.Application({resizeTo: elem});
      elem.appendChild(xel.app.view);
      // Takes a bit for the stage to set up its width and such;
      // scale / position it once it finally does
      xel.app.ticker.add(_scaleTicker);
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


  xel.setCursor = function (style, imageName, isAbsolute) {
    if (isAbsolute)
      var imagePath = imageName;
    else
      var imagePath = Config.display.cursorBasePath + imageName;

    var cursorCSS = "url('" + imagePath + "'),auto";
    xel.app.renderer.plugins.interaction.cursorStyles[style] = cursorCSS;
  };


  var _scaleTick = 0;
  function _scaleTicker() {
    // Wait until the stage resizes itself
    if (xel.app.stage.width > 1) {
      logger.debug("Updating stage view at tick " + _scaleTick.toString());
      xel.scaleStage();
      xel.app.ticker.remove(_scaleTicker);
    }
    else {
      ++_scaleTick;
    }
  }


  xel.scaleStage = function () {
    var w = document.getElementById("stage").offsetWidth;
    var h = document.getElementById("stage").offsetHeight;
    if (xel.app) {
      if (w >= h) {
        xel.app.stage.scale.set(h / xel.Config.display.intendedResolution[1]);
        xel.app.stage.x = (w - xel.app.stage.width) / 2;
        xel.app.stage.y = 0;
      }
      else {
        xel.app.stage.scale.set(w / xel.Config.display.intendedResolution[0]);
        xel.app.stage.x = 0;
        xel.app.stage.y = (h - xel.app.stage.height) / 2;
      }
    }
  };
  window.onresize = xel.scaleStage;

  return xel;
});
