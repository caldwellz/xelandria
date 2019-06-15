/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_Map.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_Map.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

/** Alternative to PIXI.Spritesheet for loading Tiled-compatible tilesets */
xel.Tileset = function (tiledData) {
  if (!tiledData.image || !tiledData.imageheight || !tiledData.imagewidth) {
    logger.error("Invalid tileset image parameter(s)");
    logger.debug(tiledData);
    return null;
  }

  this.name = tiledData.name;
  this._baseTex = PIXI.BaseTexture.from(tiledData.image, {height: tiledData.imageheight, width: tiledData.imagewidth});

  if (!tiledData.tilecount || !tiledData.tileheight || !tiledData.tilewidth) {
    logger.error("Invalid tileset tile count or size");
    logger.debug(tiledData);
    return null;
  }

  this.tileCount = tiledData.tilecount;
  this.tileHeight = tiledData.tileheight;
  this.tileWidth = tiledData.tilewidth;
  this.tiles = new Array();
  var i, x, y;
  for (i = x = y = 0; i < tiledData.tilecount; ++i) {
    var frm = new PIXI.Rectangle(x, y, tiledData.tilewidth, tiledData.tileheight);
    this.tiles[i] = new PIXI.Texture(this._baseTex, frm);
    x += tiledData.tilewidth;
    if (tiledData.spacing)
      x += tiledData.spacing;
    if (x >= tiledData.imagewidth) {
      x = 0;
      y += tiledData.tileheight;
      if (tiledData.spacing)
        y += tiledData.spacing;
    }
  }

  return this;
};
