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

xel.MapManager._loadCached = function (mapName) {
  logger.module = "xel.MapManager._loadCached";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  if (!(xel.MapManager._mapCache[mapName])) {
    logger.error("mapName '" + mapName + "' not in cache");
    return;
  }

  xel.MapManager._currentMap = xel.MapManager._mapCache[mapName];

  // TODO: Actually swap out and display the map
  // Ideally should be as simple as swapping stage child

  logger.log(xel.MapManager._currentMap._orientation);
  logger.debug("Map '" + mapName + "' loaded");
}

xel.MapManager.load = function (mapName, mapURL) {
  logger.module = "xel.MapManager.load";
  if (typeof mapName !== 'string') {
    logger.error("mapName not a string");
    logger.debug(mapName);
    return;
  }

  if (xel.MapManager._mapCache[mapName]) {
    xel.MapManager._loadCached(mapName);
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
      xel.MapManager._loadCached(mapName);
    });
  }
};

