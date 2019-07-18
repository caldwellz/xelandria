/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
// *** imports
if (typeof logger === 'undefined') { throw "xel_Map.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_Map.js: PIXI not loaded!"; }
xel = xel || {};
xel.settings = xel.settings || {};
xel.settings.maps = xel.settings.maps || {};
// *** settings
xel.settings.maps.tilesetAngles = xel.settings.maps.tilesetAngles || 8;
xel.settings.maps.basePath = xel.settings.maps.basePath || "assets/maps/";
// ***

xel.Map = {};
xel.Map.prototype = {};
xel.Map.cache = {};

xel.Map.fromTiledMapData = function (tiledData) {
  if ((!tiledData) || (tiledData.type !== "map")) {
    logger.error("xel.Map.fromTiledMapData: Loaded file isn't a Tiled JSON map");
    logger.debug(resource.url);
    return null;
  }

  if (!tiledData.width || !tiledData.height || !tiledData.tilewidth || !tiledData.tileheight || !tiledData.orientation) {
    logger.error("xel.Map.fromTiledMapData: Invalid map parameter(s)");
    logger.debug(tiledData);
    return null;
  }

  if (!(tiledData.orientation === "isometric" || tiledData.orientation === "orthogonal")) {
    logger.error("Map has unsupported orientation");
    logger.debug(tiledData.orientation);
    return null;
  }

  var obj = Object.create(xel.Map.prototype);
  obj.tilesWidth = tiledData.width;
  obj.tilesHeight = tiledData.height;
  obj.tilePixWidth = tiledData.tilewidth;
  obj.tilePixHeight = tiledData.tileheight;
  obj.mapPixWidth = obj.tilesWidth * obj.tilePixWidth;
  obj.mapPixHeight = obj.tilesHeight * obj.tilePixHeight;
  obj.orientation = tiledData.orientation;
  obj.tilesets = tiledData.tilesets;
  obj.layers = new PIXI.Container();
  obj._tileUpdates = [];
  obj._spritesByGid = [];

  if (tiledData.properties) {
    for (var prop in tiledData.properties) {
      obj[tiledData.properties[prop].name] = tiledData.properties[prop].value;
    }
  }

  // If angle isn't set in the custom map properties,
  // assume it's the first angle of the given orientation
  if (!obj.hasOwnProperty("angle")) {
    if (obj.orientation === "isometric")
      obj.angle = 0;
    else
      obj.angle = 1;
  }

  var z = 1;
  for (var l in tiledData.layers) {
    var layerData = tiledData.layers[l];
    var layer = new PIXI.Container();
    layer.name = layerData.name;
    layer.type = layerData.type;
    layer.visible = (layerData.visible || false);
    layer.sortableChildren = true;
    layer.zIndex = z;

    var gidData = layerData.data;
    if (layer.type === "tilelayer") {
      for (var i = 0; i < gidData.length; ++i) {
        var gid = gidData[i];
        if (gid > 0) {
          var gridX = i % obj.tilesWidth;
          var gridY = (i - gridX) / obj.tilesWidth;
          var spr = new PIXI.Sprite();
          spr.gridX = gridX;
          spr.gridY = gridY;
          spr.zIndex = gridX + gridY;
          if (!obj._spritesByGid[gid])
            obj._spritesByGid[gid] = [];
          obj._spritesByGid[gid].push(spr);
          obj._tileUpdates.push(spr);
          layer.addChild(spr);
        }
      }
      layer.sortChildren();
    }

    if (layerData.properties) {
      for (prop in layerData.properties) {
        layer[layerData.properties[prop].name] = layerData.properties[prop].value;
      }
    }
    obj.layers.addChild(layer);
    ++z;
  }
  obj.layers.sortableChildren = true;
  obj.layers.sortChildren();

  obj._sheetURLs = [];
  for (var t = 0; t < obj.tilesets.length; ++t) {
    var a = document.createElement('a');
    a.href = obj.tilesets[t].source;
    obj._sheetURLs.push(a.href);
    var firstgid = obj.tilesets[t].firstgid;
    if (t == obj.tilesets.length - 1)
      var nextfirstgid = firstgid + xel.settings.maps.tilesetAngles;
    else
      var nextfirstgid = obj.tilesets[t + 1].firstgid;
    for (var gid = firstgid; gid < nextfirstgid; ++gid) {
      if (obj._spritesByGid[gid]) {
        for (var n = 0; n < obj._spritesByGid[gid].length; ++n) {
          obj._spritesByGid[gid][n].sheetIndex = gid - firstgid;
          obj._spritesByGid[gid][n].spritesheetURL = a.href;
        }
      }
    }
  }
  delete obj._spritesByGid;
  obj._updateTiles();

  // Temporary test for rotation
  var btn = document.createElement("button");
  btn.innerText = "Rotate Clockwise";
  btn.onclick = function () {xel.Map.cache["a0m0-iso"]._rotate45();};
  btn.style.position = "absolute";
  btn.style.top = "2px";
  document.body.appendChild(btn);

  return obj;
};


xel.Map.loadTiledMap = function (mapName, options) {
  if (typeof mapName !== 'string') {
    logger.error("xel.Map.loadTiledMap: mapName not a string");
    logger.debug(mapName);
    return;
  }

  options = options || {};
  var basePath = options.basePath || xel.settings.maps.basePath;
  var mapURL = options.url || (basePath + mapName + ".json");
  var map = xel.Map.cache[mapName] || xel.Map.cache[mapURL];

  if (map) {
    if (options.activate)
      map.activate();
    if (typeof options.callback === "function")
      options.callback(map);
  } else {
    var mapLoader = new PIXI.Loader();
    if (options.loaderPreCallback)
      mapLoader.pre(options.loaderPreCallback);
    if (options.loaderProgressCallback)
      mapLoader.onProgress.add(options.loaderProgressCallback);
    mapLoader.add(mapName, mapURL);
    mapLoader.load(function(loader, resources) {
      var map;
      for (var res in resources) {
        if ((resources[res].data) && (resources[res].type === PIXI.Loader.Resource.TYPE.JSON))
          map = xel.Map.fromTiledMapData(resources[res].data);
      }
      if (map) {
        map.name = mapName;
        map.url = mapURL;
        xel.Map.cache[mapName] = xel.Map.cache[mapURL] = map;
        logger.debug("Map '" + mapName + "' loaded");
        if (options.activate)
          map.activate();
        if (typeof options.callback === "function")
          options.callback(map);
      }
      else {
        logger.error("xel.Map.loadTiledMap: Failed to load map '" + mapName + "'");
        logger.debug(mapURL);
      }
    });
  }
};


xel.Map.cacheSpritesheets = function (urls, callback) {
  xel.Map.spritesheetCache = xel.Map.spritesheetCache || {};
  if (typeof urls === "string")
    urls = [urls];
  if (typeof urls !== "object") {
    logger.error("xel.Map.cacheSpritesheets: URLs arg is not a string or object");
    return;
  }

  var a = document.createElement('a');
  var ld = new PIXI.Loader();
  for (var u in urls) {
    // Convert to absolute URL for use as a normalized name
    a.href = urls[u];
    if (!(a.href in xel.Map.spritesheetCache))
      ld.add(a.href, a.href);
  }

  ld.load(function (loader, resources) {
    for (var res in resources) {
      if (!resources[res].data) {
        logger.error("xel.Map.cacheSpritesheets: No data found at URL: '" + resources[res].url + "'");
        continue;
      }
      if (resources[res].type === PIXI.Loader.Resource.TYPE.IMAGE)
        continue; // Spritesheet middleware adds the images to the loader
      if (!resources[res].spritesheet) {
        logger.error("xel.Map.cacheSpritesheets: Could not parse spritesheet data at URL: '" + resources[res].url + "'");
        continue;
      }
      a.href = resources[res].url;
      xel.Map.spritesheetCache[a.href] = resources[res].spritesheet;
      xel.Map.spritesheetCache[resources[res].data["meta"]["image"]] = resources[res].spritesheet;
    }
    if (typeof callback === "function")
      callback();
  });
}


xel.Map.clearAll = function () {
  xel.app.stage.removeChildren();
  xel.Map._currentMap = null;
  for (var map in xel.Map.cache)
    delete xel.Map.cache[map];
}


xel.Map.prototype.activate = function () {
  xel.Map._currentMap = this;
  // TODO: Maybe use visibility instead of add/remove
  xel.app.stage.removeChildren();
  xel.app.stage.addChild(this.layers);
};


xel.Map.prototype._updateTiles = function() {
  var ctx = this;
  xel.Map.cacheSpritesheets(ctx._sheetURLs, function() {
    // Isometric variables
    var baseWidth = ctx.tilePixWidth / 2;
    var baseHeight = ctx.tilePixHeight / 2;
    var xMid = ctx.tilesHeight * baseWidth;

    for (var t in ctx._tileUpdates) {
      var tile = ctx._tileUpdates[t];
      var sheet = xel.Map.spritesheetCache[tile.spritesheetURL];
      if (sheet) {
        var texName = sheet._frameKeys[tile.sheetIndex];
        tile.texture = sheet.textures[texName];
      }
      else {
        logger.debug("xel.Map.prototype._updateTiles: Missing spritesheet at map '" + ctx.name + "' grid index [" + tile.gridX.toString() + "][" + tile.gridY.toString() + "]");
        continue;
      }

      if (ctx.angle % 2 === 0) { // See if map is in iso mode
        tile.x = xMid + ((tile.gridX - tile.gridY) * baseWidth);
        tile.y = (tile.gridX + tile.gridY) * baseHeight;
      }
      else { // Ortho
        tile.x = tile.gridX * ctx.tilePixWidth;
        tile.y = tile.gridY * ctx.tilePixHeight;
      }

      if (tile.gridY > ctx.tilesHeight)
        logger.warn("xel.Map.prototype._updateTiles: Sprite position exceeds height of map '" + ctx.name + "'");
    }
    ctx._tileUpdates = [];
  });
};


xel.Map.prototype._gridRotate = function(sheetInc, updateGrid) {
  for (var l in this.layers.children) {
    var layer = this.layers.children[l];
    if (layer.type === "tilelayer") {
      for (var t in layer.children) {
        var tile = layer.children[t];
        if (updateGrid) {
          if (sheetInc >= 0) { // Clockwise
            // _updateTiles sets the actual x/y coordinates
            var oldY = tile.gridY;
            tile.gridY = tile.gridX;
            tile.gridX = this.tilesHeight - oldY - 1; // tilesHeight starts at 1, grid at 0
          }
          else { // Counter-clockwise
            var oldX = tile.gridX;
            tile.gridX = tile.gridY;
            tile.gridY = this.tilesHeight - oldX - 1;
          }
          tile.zIndex = tile.gridX + tile.gridY;
        }
        // TODO: May need to un-hardcode spritesheet size
        tile.sheetIndex = (tile.sheetIndex + sheetInc) % xel.settings.maps.tilesetAngles;
        this._tileUpdates.push(tile);
      }
      if (updateGrid)
        layer.sortChildren();
    }
  }
}


xel.Map.prototype._rotate45 = function() {
  this.angle = (this.angle + 1) % xel.settings.maps.tilesetAngles;
  if (this.angle % 2 === 0) { // Is map now in iso mode?
    // If so, just increment tiles; iso uses the grid of the ortho before it
    this._gridRotate(1, false);
  }
  else { // Otherwise, rotate the grid too
    this._gridRotate(1, true);
  }
  this._updateTiles();
};


xel.Map.prototype._rotate90 = function() {
  this.angle = (this.angle + 2) % xel.settings.maps.tilesetAngles;
  this._gridRotate(2, true);
  this._updateTiles();
};
