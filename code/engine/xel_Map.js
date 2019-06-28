/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

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
  obj.layers = new PIXI.Container();
  obj._spriteTiles = [];

  var z = 1;
  for (var l in tiledData.layers) {
    var layerData = tiledData.layers[l];
    var layer = new PIXI.Container();
    layer.sortableChildren = true;
    layer.name = layerData.name;
    layer.type = layerData.type;
    layer.visible = (layerData.visible || false);
    if (layer.type === "tilelayer") {
      for (var i = 0; i < layerData.data.length; ++i) {
        var gid = layerData.data[i];
        if (gid > 0) {
          var spr = new PIXI.Sprite();
          spr.zIndex = z;
          spr.x = (i * obj.tilePixWidth) % obj.mapPixWidth;
          spr.y = ((i - (i % obj.tilesWidth)) / obj.tilesWidth) * obj.tilePixHeight;
          if (spr.y > obj.mapPixHeight)
            logger.warn("Sprite position exceeds height of map '" + obj.name + "'");
          if (!obj._spriteTiles[gid])
            obj._spriteTiles[gid] = [];
          obj._spriteTiles[gid].push(spr);
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

  var a = document.createElement('a');
  var ld = new PIXI.Loader();
  for (var t in tiledData.tilesets) {
    // Convert to absolute URL for use as a normalized name
    a.href = tiledData.tilesets[t].source;
    ld.add(a.href, a.href);
  }
  ld.load(function (loader, resources) {
    for (var t in tiledData.tilesets) {
      a.href = tiledData.tilesets[t].source;
      if (resources[a.href]) {
        var firstgid = tiledData.tilesets[t].firstgid;
        var sheet = resources[a.href].spritesheet;
        for (var gid = firstgid; gid < (firstgid + xel.settings.maps.tilesetAngles); ++gid) {
          if (obj._spriteTiles[gid]) {
            for (var n = 0; n < obj._spriteTiles[gid].length; ++n) {
              var texName = sheet._frameKeys[gid - firstgid];
              obj._spriteTiles[gid][n].texture = sheet.textures[texName];
            }
          }
        }
      }
      else {
        logger.error("Could not load tileset: " + t);
      }
    }
  });

  return obj;
};
