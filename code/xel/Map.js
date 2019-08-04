/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["require", "logger", "pixi5", "xel/Config"], function (require, logger, PIXI, Config) {
  var xel_Map = {};
  xel_Map.prototype = {};


  xel_Map.create = function (params) {
    var map = Object.create(xel_Map.prototype);

    if (typeof params === "object") {
      for (var prop in params) {
        map[prop] = params[prop];
      }
    }

    // If angle isn't set in the custom map properties,
    // assume it's the first angle of the given orientation
    if (!map.hasOwnProperty("angle") && map.orientation) {
      if (map.orientation === "isometric")
        map.angle = 0;
      else
        map.angle = 1;
    }

    // Create list of map tilesets and firstgids
    var firstGids = [];
    var sources = [];
    if (map.tilesets) {
      for (var n = 0; n < map.tilesets.length; ++n) {
        var ts = map.tilesets[n];
        firstGids[n] = ts.firstgid;
        sources[n] = ts.source;
      }

      // TODO: See whether it would be useful to retain or
      // maintain a list of all tilesets in use by the map.
      delete map.tilesets;
    }

    // If map has layer data, create sprite container and add it to the map / stage
    if (map.layerData && map.layerData.length) {
      map.layers = new PIXI.Container();
      map.layers.sortableChildren = true;
      require("xel").app.stage.addChild(map.layers);

      // Iterate through layer data
      var spriteList = [];
      var z = 0;
      for (var l = 0; l < map.layerData.length; ++l) {
        var layer = map.layerData[l];
        if (layer.type === "tilelayer") {

          // Create and add new individual layer container
          var container = new PIXI.Container();
          container.sortableChildren = true;
          container.zIndex = z;
          map.layers.addChild(container);

          // Copy properties
          container.name = layer.name;
          container.x = layer.x;
          container.y = layer.y;
          container.visible = layer.visible;
          container.alpha = layer.opacity;

          // Generate sprite creation list / options
          for (var n = 0; n < layer.data.length; ++n) {
            var gid = layer.data[n];
            if (gid > 0) {
              var spriteOpts = { "parent": container };

              // Figure out the image index and tileset (spritesheet)
              for (var i = firstGids.length - 1; i >= 0; --i) {
                if (gid >= firstGids[i]) {
                  spriteOpts.sheetIndex = gid - firstGids[i];
                  spriteOpts.spritesheet = sources[i];
                  break;
                }
              }

              // Calculate grid position and zIndex
              spriteOpts.gridX = n % layer.width;
              spriteOpts.gridY = (n - spriteOpts.gridX) / layer.width;
              spriteOpts.zIndex = spriteOpts.gridX + spriteOpts.gridY;

              spriteList.push(spriteOpts);
            }
          }
          ++z;
        }
      }
      map.layers.sortChildren();
      map.addSprites(spriteList);

      // TODO: See if CSV layer data would be helpful to keep or
      // maintain for the purpose of saving / restoring the map
      delete map.layerData;
    }

    return map;
  };


  xel_Map.prototype.getPixelWidth = function () {
    if ((typeof this.width === "number") && (typeof this.tilewidth === "number"))
      return this.width * this.tilewidth;
    else
      return null;
  };


  xel_Map.prototype.getPixelHeight = function () {
    if ((typeof this.height === "number") && (typeof this.tileheight === "number"))
      return this.height * this.tileheight;
    else
      return null;
  };


  xel_Map.prototype.addSprites = function (options) {
    var map = this;
    if (options) {
      // Convert single item to array if needed
      if (!options.length)
        options = [options];

      // Set some isometric parameters
      var isoBaseWidth = map.tilewidth / 2;
      var isoBaseHeight = map.tileheight / 2;
      var isoXMid = map.height * isoBaseWidth;

      // Loop through sprite creation options list
      var sheets = {};
      var spriteList = [];
      for (var n = 0; n < options.length; ++n) {
        var opts = options[n];

        //Make sure we weren't passed a plain string or array, since we iterate through the properties
        if (typeof opts === "object") {

          // Create sprite if needed and copy properties
          var sprite = opts.sprite || new PIXI.Sprite();
          spriteList.push(sprite);
          for (var o in opts)
            sprite[o] = opts[o];

          // Make sure the sprite is actually registered with the parent (e.g. the map layer)
          if (sprite.parent)
            sprite.parent.addChild(sprite);

          // Check / calculate pixel coordinates from grid position
          if ((typeof sprite.gridX === "number") && (typeof sprite.gridY === "number") && map.orientation) {
            if (map.orientation === "isometric") {
              sprite.x = isoXMid + ((sprite.gridX - sprite.gridY) * isoBaseWidth);
              sprite.y = (sprite.gridX + sprite.gridY) * isoBaseHeight;
            }
            else { // Orthographic
              sprite.x = sprite.gridX * map.tilewidth;
              sprite.y = sprite.gridY * map.tileheight;
            }
          }

          // Generate list of spritesheets for loading
          if (opts.spritesheet)
            sheets[opts.spritesheet] = null;
        }
        else {
          logger.warn("xel.Map.prototype.addSprites(): Sprite creation parameters not an object");
          logger.debug(opts);
        }
      }

      // Load spritesheets and update textures
      require("xel/MapManager").loadSpritesheets(sheets, function (loadedSheets) {
        for (var n = 0; n < spriteList.length; ++n) {
          var sprite = spriteList[n];
          if (sprite.spritesheet) {
            var sheet = loadedSheets[sprite.spritesheet];
            if (sheet) {
              var texName = sheet._frameKeys[sprite.sheetIndex];
              sprite.texture = sheet.textures[texName];
            }
            else {
              // A load error was probably logged somewhere, and there's likely
              // many sprites using the sheet, so spam only the debug log
              logger.debug("xel.Map.prototype.addSprites(): Missing sheet '" + sprite.spritesheet + "'");
            }
          }
        }
      });
    }
  };

  return xel_Map;
});
