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
// ***

xel.Map = function (tiledData) {
  var obj = Object.create(xel.Map.prototype);
  if (!tiledData.width || !tiledData.height || !tiledData.tilewidth || !tiledData.tileheight || !tiledData.orientation) {
    logger.error("Invalid map parameter(s)");
    logger.debug(tiledData);
    return null;
  }

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
  obj.angle = obj.angle || 0;

  var z = 1;
  for (var l in tiledData.layers) {
    var layerData = tiledData.layers[l];
    var layer = new PIXI.Container();
    layer.sortableChildren = true;
    layer.name = layerData.name;
    layer.type = layerData.type;
    layer.visible = (layerData.visible || false);

    var gidData = layerData.data;
    if (layer.type === "tilelayer") {
      for (var i = 0; i < gidData.length; ++i) {
        var gid = gidData[i];
        if (gid > 0) {
          var gridX = i % obj.tilesWidth;
          var gridY = (i - gridX) / obj.tilesWidth;
          var spr = new PIXI.Sprite();
          spr.zIndex = z;
          spr.gridX = gridX;
          spr.gridY = gridY;
          if (!obj._spritesByGid[gid])
            obj._spritesByGid[gid] = [];
          obj._spritesByGid[gid].push(spr);
          obj._tileUpdates.push(spr);
          layer.addChild(spr);
        }
      }
    }
    if (layerData.properties) {
      for (prop in layerData.properties) {
        layer[layerData.properties[prop].name] = layerData.properties[prop].value;
      }
    }
    layer.sortChildren();
    obj.layers.addChild(layer);
    ++z;
  }

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
  btn.onclick = function () {xel.MapManager._mapCache.a0m0._rotate90();};
  btn.style.position = "absolute";
  btn.style.top = "2px";
  document.body.appendChild(btn);

  return obj;
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
        logger.error("xel.Map.prototype.cacheSpritesheets: No data found at URL: '" + resources[res].url + "'");
        continue;
      }
      if (resources[res].type === PIXI.Loader.Resource.TYPE.IMAGE)
        continue; // Spritesheet middleware adds the images to the loader
      if (!resources[res].spritesheet) {
        logger.error("xel.Map.prototype.cacheSpritesheets: Could not parse spritesheet data at URL: '" + resources[res].url + "'");
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


xel.Map.prototype._updateTiles = function() {
  var ctx = this;
  xel.Map.cacheSpritesheets(ctx._sheetURLs, function() {
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
      tile.x = tile.gridX * ctx.tilePixWidth;
      tile.y = tile.gridY * ctx.tilePixHeight;
      if (tile.gridY > ctx.tilesHeight)
        logger.warn("Sprite position exceeds height of map '" + ctx.name + "'");
    }
    ctx._tileUpdates = [];
  });
};


xel.Map.prototype._rotate90 = function() {
  for (l in this.layers.children) {
    var layer = this.layers.children[l];
    if (layer.type === "tilelayer") {
      for (var t in layer.children) {
        var tile = layer.children[t];
        // Simple grid matrix rotation; _updateTiles sets the actual x/y coordinates
        var oldY = tile.gridY;
        tile.gridY = tile.gridX;
        tile.gridX = this.tilesHeight - oldY - 1; // tilesHeight starts at 1, grid at 0
        // TODO: May need to un-hardcode angle adjustments and spritesheet size
        tile.sheetIndex = (tile.sheetIndex + 2) % xel.settings.maps.tilesetAngles;
        this._tileUpdates.push(tile);
      }
    }
  }
  this._updateTiles();
};
