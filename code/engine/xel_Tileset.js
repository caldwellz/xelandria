/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "xel_Map.js: Logger not loaded!"; }
if (typeof PIXI === 'undefined') { throw "xel_Map.js: PIXI not loaded!"; }
var xel = xel || {};
// ***

/** Alternative to PIXI.Spritesheet for loading Tiled-compatible tilesets */
xel.Tileset = function (tiledTilesetData) {
  
};
