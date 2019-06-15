/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_TilesetManager.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_TilesetManager.js: PIXI not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.Tileset === 'undefined')) { throw "xel_TilesetManager.js: xel.Tileset not loaded!"; }
// ***

xel.TilesetManager = {};
xel.TilesetManager._tilesetCache = {};
xel.TilesetManager._tilesetLoading = {};

xel.TilesetManager.clear = function () {
  xel.TilesetManager._tilesetCache = {};
};

xel.TilesetManager._cacheCallback = function (resource, next) {
  logger.module = "xel.TilesetManager._cacheCallback";
  if (resource.name in xel.TilesetManager._tilesetCache) {
    logger.debug("Tileset '" + resource.name + "' was cached, not loading again");
    return;
  } else
    next();
};

xel.TilesetManager._progressCallback = function (loader, resource) {
  logger.module = "xel.TilesetManager._progressCallback";
  if ((resource.error !== null) || (resource.data === null)) {
    logger.error("Failed to load tileset file");
    logger.debug(resource.url);
    return;
  }

  if (resource.data.type !== "tileset") {
    logger.error("Loaded file isn't a Tiled JSON tileset");
    logger.debug(resource.url);
    return;
  }

  var tileset = new xel.Tileset(resource.data);
  if (tileset) {
    xel.TilesetManager._tilesetCache[resource.name] = tileset;
    if (resource.name !== resource.data.name)
      logger.debug("Resource cache name '" + resource.name + "' doesn't match tileset's internal name '" + resource.data.name + "'");
  }
};

xel.TilesetManager.cache = function (tilesets, onProgressMiddleware) {
  logger.module = "xel.TilesetManager.cache";
  var tilesetLoader = new PIXI.Loader();
  if (typeof tilesets === 'object') {
    for (var prop in tilesets) {
      if (tilesets.hasOwnProperty(prop)) {
        if ((typeof prop === 'string') && (typeof tilesets[prop] === 'string')) {
          tilesetLoader.add(prop, tilesets[prop]);
        } else {
          logger.error("tilesets name or URL is not a string");
          logger.debug(tilesets);
          return;
        }
      }
    }
  } else {
    logger.error("tilesets arg is not an object");
    logger.debug(tilesets);
    return;
  }

  tilesetLoader.pre(xel.TilesetManager._cacheCallback).onProgress.add(xel.TilesetManager._progressCallback);
  if (onProgressMiddleware)
    tilesetLoader.onProgress.add(onProgressMiddleware);
  tilesetLoader.load();
};

xel.TilesetManager.uncache = function (tilesetName) {
  logger.module = "xel.TilesetManager.uncache";
  if (typeof tilesetName !== 'string') {
    logger.error("tilesetName not a string");
    logger.debug(tilesetName);
    return;
  }

  delete xel.TilesetManager._tilesetCache[tilesetName];
};

xel.TilesetManager.load = function (tilesetName, tilesetURL, callback, cbOpts) {
  logger.module = "xel.TilesetManager.load";
  if (typeof tilesetName !== 'string') {
    logger.error("tilesetName not a string");
    logger.debug(tilesetName);
    return;
  }

  if (xel.TilesetManager._tilesetCache[tilesetName]) {
    if (typeof callback === "function")
      callback(xel.TilesetManager._tilesetCache[tilesetName], cbOpts);
  } else {
    if (typeof tilesetURL !== 'string') {
      logger.error("tileset '" + tilesetName + "' not cached and tilesetURL not a string");
      logger.debug(tilesetURL);
      return;
    }

    var tilesetLoader = new PIXI.Loader();
    tilesetLoader.add(tilesetName, tilesetURL);
    // TODO: Check whether load still gets called even if cache callback bails out due to a previous asynchronous load finishing
    tilesetLoader.pre(xel.TilesetManager._cacheCallback).onProgress.add(xel.TilesetManager._progressCallback);
    tilesetLoader.load(function(loader, resources) {
      if (resources[tilesetName].data) {
        if (typeof callback === "function")
          callback(resources[tilesetName].data, cbOpts);
      }
    });
  }
};
