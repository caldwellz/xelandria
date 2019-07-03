/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "xel_MapManager.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_MapManager.js: PIXI not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.Map === 'undefined')) { throw "xel_MapManager.js: xel.Map not loaded!"; }
// ***

xel.MapManager = {};
xel.MapManager._mapCache = {};

xel.MapManager.clear = function () {
  xel.MapManager._mapCache = {};
  delete xel.MapManager._currentMap;
};


xel.MapManager._cacheCallback = function (resource, next) {
  logger.module = "xel.MapManager._cacheCallback";
  if (resource.name in xel.MapManager._mapCache) {
    logger.debug("Map '" + resource.name + "' was cached, not loading again");
    return;
  } else
    next();
};


xel.MapManager._progressCallback = function (loader, resource) {
  logger.module = "xel.MapManager._progressCallback";
  if ((resource.error !== null) || (resource.data === null)) {
    logger.error("Failed to load map file");
    logger.debug(resource.url);
    return;
  }

  if (resource.data.type !== "map") {
    logger.error("Loaded file isn't a Tiled JSON map");
    logger.debug(resource.url);
    return;
  }

  var map = new xel.Map(resource.data);
  if (map) {
    logger.debug("Loaded and caching map '" + resource.name + "'");
    map.name = resource.name;
    xel.MapManager._mapCache[resource.name] = map;
  }
};


xel.MapManager.cache = function (maps, onProgressMiddleware) {
  logger.module = "xel.MapManager.cache";
  var mapLoader = new PIXI.Loader();
  if (typeof maps === 'object') {
    for (var prop in maps) {
      if (maps.hasOwnProperty(prop)) {
        if ((typeof prop === 'string') && (typeof maps[prop] === 'string')) {
          mapLoader.add(prop, maps[prop]);
        } else {
          logger.error("maps name or URL is not a string");
          logger.debug(maps);
          return;
        }
      }
    }
  } else {
    logger.error("maps arg is not an object");
    logger.debug(maps);
    return;
  }

  mapLoader.pre(xel.MapManager._cacheCallback).onProgress.add(xel.MapManager._progressCallback);
  if (onProgressMiddleware)
    mapLoader.onProgress.add(onProgressMiddleware);
  mapLoader.load();
};


xel.MapManager.uncache = function (mapName) {
  logger.module = "xel.MapManager.uncache";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  delete xel.MapManager._mapCache[mapName];
};


xel.MapManager.load = function (mapName, mapURL, callback) {
  logger.module = "xel.MapManager.load";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  if (xel.MapManager._mapCache[mapName]) {
    if (typeof callback === "function")
      callback(xel.MapManager._mapCache[mapName]);
  } else {
    if (typeof mapURL !== 'string') {
      logger.error("map '" + mapName + "' not cached and mapURL not a string");
      logger.debug(mapURL);
      return;
    }

    var mapLoader = new PIXI.Loader();
    mapLoader.add(mapName, mapURL);
    mapLoader.pre(xel.MapManager._cacheCallback).onProgress.add(xel.MapManager._progressCallback);
    mapLoader.load(function(loader, resources) {
      logger.debug("Map '" + mapName + "' loaded");
      if (typeof callback === "function")
        callback(xel.MapManager._mapCache[mapName]);
    });
  }
};


xel.MapManager.activate = function (mapName, mapURL) {
  xel.MapManager.load(mapName, mapURL, function(map) {
    xel.MapManager._currentMap = map;
    // TODO: Maybe use visibility instead of add/remove
    xel.app.stage.removeChildren();
    xel.app.stage.addChild(map.layers);
  });
};
