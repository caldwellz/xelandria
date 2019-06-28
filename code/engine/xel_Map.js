/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_Map.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_Map.js: PIXI not loaded!"; }
// ***

xel.Map = function (tiledData) {
  var obj = {};
  if (!tiledData.width || !tiledData.height || !tiledData.tilewidth || !tiledData.tileheight || !tiledData.orientation) {
    logger.error("Invalid map parameter(s)");
    logger.debug(tiledData);
    return null;
  }

  obj.width = tiledData.width;
  obj.height = tiledData.height;
  obj.tileWidth = tiledData.tilewidth;
  obj.tileHeight = tiledData.tileheight;
  obj.pixelWidth = obj.width * obj.tileWidth;
  obj.pixelHeight = obj.height * obj.tileHeight;
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
          spr.x = (i * obj.tileWidth) % obj.pixelWidth;
          spr.y = ((i - (i % obj.width)) / obj.width) * obj.tileHeight;
          if (spr.y > obj.pixelHeight)
            logger.warn("Sprite position exceeds height of map '" + obj.name + "'");
          if (!obj._spriteTiles[gid])
            obj._spriteTiles[gid] = [];
          obj._spriteTiles[gid].push(spr);
          layer.addChild(spr);
        }
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
        // TODO: Un-hardcode if we ever have other than 8 images per spritesheet
        for (var gid = firstgid; gid < (firstgid + 8); ++gid) {
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
