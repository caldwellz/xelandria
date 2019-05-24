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
  if (resource.name in xel.MapManager._mapCache) {
    logger.debug("xel.MapManager.cacheCallback: Map '" + resource.name + "' was cached, not loading again");
    return;
  } else
    next();
};

xel.MapManager._progressCallback = function (loader, resource) {
  if ((resource.error !== null) || (resource.data === null)) {
    logger.error("xel.MapManager.progressCallback: Failed to load map file");
    logger.debug(resource.url);
    return;
  }

  if (resource.data.type !== "map") {
    logger.error("xel.MapManager.progressCallback: Loaded file isn't a Tiled JSON map");
    logger.debug(resource.url);
    return;
  }

  var map = new xel.Map(resource.data);
  if (map) {
    logger.debug("xel.MapManager.progressCallback: Loaded and caching map '" + resource.name + "'");
    xel.MapManager._mapCache[resource.name] = map;
  }
};

xel.MapManager.loadMaps = function (maps, onProgressMiddleware) {
  var mapLoader = new PIXI.Loader();
  if (typeof maps === 'object') {
    for (var prop in maps) {
      if (maps.hasOwnProperty(prop)) {
        if ((typeof prop === 'string') && (typeof maps[prop] === 'string')) {
          mapLoader.add(prop, maps[prop]);
        } else {
          logger.error("xel.MapManager.loadMaps: maps name or URL is not a string");
          logger.debug(maps);
          return;
        }
      }
    }
  } else {
    logger.error("xel.MapManager.loadMaps: maps arg is not an object");
    logger.debug(maps);
    return;
  }

  mapLoader.pre(xel.MapManager._cacheCallback)
           .onProgress.add(xel.MapManager._progressCallback);
  if (onProgressMiddleware)
    mapLoader.onProgress.add(onProgressMiddleware);
  mapLoader.load();
};
