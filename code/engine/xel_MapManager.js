/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_MapManager.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_MapManager.js: PIXI not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.Map === 'undefined')) { throw "xel_MapManager.js: xel.Map not loaded!"; }
// ***

xel.MapManager = {};
xel.MapManager._mapCache = {};

xel.MapManager.clear = function () {
  xel.MapManager._mapCache = {};
};

xel.MapManager._cacheCallback = function (resource, next) {
  logger.module = "xel.MapManager.progressCallback";
  if (resource.name in xel.MapManager._mapCache) {
    logger.debug("Map '" + resource.name + "' was cached, not loading again");
    return;
  } else
    next();
};

xel.MapManager._progressCallback = function (loader, resource) {
  logger.module = "xel.MapManager.progressCallback";
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
    xel.MapManager._mapCache[resource.name] = map;
  }
};

xel.MapManager.load = function (maps, onProgressMiddleware) {
  logger.module = "xel.MapManager.load";
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

xel.MapManager.get = function (mapName, mapURL) {
  logger.module = "xel.MapManager.get";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  if (xel.MapManager._mapCache[mapName]) {
    return xel.MapManager._mapCache[mapName];
  } else {
    if (typeof mapURL !== 'string') {
      logger.error("map '" + mapName + "' not cached and mapURL not a string");
      logger.debug(mapURL);
      return;
    }

    xel.MapManager.load({mapName : mapURL});
    return xel.MapManager._mapCache[mapName];
  }
};

xel.MapManager.destroy = function (mapName) {
  logger.module = "xel.MapManager.destroy";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  delete xel.MapManager._mapCache[mapName];
};
