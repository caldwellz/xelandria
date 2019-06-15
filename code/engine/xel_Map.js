/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_Map.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_Map.js: PIXI not loaded!"; }
if ((typeof xel === 'undefined') || (typeof xel.TilesetManager === 'undefined')) { throw "xel_Map.js: TilesetManager not loaded!"; }
// ***

xel.Map = function (tiledData) {
  if (!tiledData.width || !tiledData.height || !tiledData.tilewidth || !tiledData.tileheight || !tiledData.orientation) {
    logger.error("Invalid map parameter(s)");
    logger.debug(tiledData);
    return null;
  }

  this.width = tiledData.width;
  this.height = tiledData.height;
  this.tileWidth = tiledData.tilewidth;
  this.tileHeight = tiledData.tileheight;
  this.orientation = tiledData.orientation;
  this.sprites = new PIXI.Container();
  this.layers = []; // Replace .sprites with layer containers, for visibility and other properties
  this._spriteTiles = [];

  for (var l in tiledData.layers) {
    var layer = tiledData.layers[l];
    if (layer.type === "tilelayer") {
      for (var i = 0; i < layer.data.length; ++i) {
        var spr = new PIXI.Sprite();
        spr.x = (i * this.tileWidth) % this.width;
        spr.y = ((i * this.tileWidth) - spr.x) / this.width;
        var gid = layer.data[i];
        if (!this._spriteTiles[gid])
          this._spriteTiles[gid] = [];
        this._spriteTiles[gid].push(spr);
        this.sprites.addChild(spr);
      }
    }
  }

  var a = document.createElement('a');
  for (var t in tiledData.tilesets) {
    // Convert to absolute URL for use as a normalized name
    a.href = tiledData.tilesets[t].source;
    var ctx = this;
    xel.TilesetManager.load(a.href, a.href, function(tileset, firstgid) {
      logger.debug(ctx._spriteTiles);
      if (tileset) {
        for (var gid = firstgid; gid < (firstgid + tileset.tileCount); ++gid) {
          if (ctx._spriteTiles[gid]) {
            for (var n = 0; n < ctx._spriteTiles[gid].length; ++i) {
              ctx._spriteTiles[gid][n].texture = tileset.tiles[gid - firstgid];
              logger.debug(ctx._spriteTiles[gid][n].texture);
            }
          }
        }
      }
    }, tiledData.tilesets[t].firstgid);
  }

  return this;
};
