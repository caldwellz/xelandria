/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["require", "logger", "pixi5", "xel/Config", "xel/Map"], function (require, logger, PIXI, Config, Map) {
  var xel_MapManager = {};
  xel_MapManager._maps = {};
  xel_MapManager._sheetCache = {};


  xel_MapManager.createFromJSON = function (json, options) {
    // Decode the JSON
    var mapData;
    if (typeof json === "string") {
      try {
        mapData = JSON.parse(json);
      }
      catch (e) {
        mapData = null;
      }
    }
    else if (typeof json === "object")
      mapData = json;
    if (!mapData) {
      logger.error("xel.MapManager.createFromJSON(): Unable to decode JSON");
      logger.debug(json);
      return null;
    }

    // Verify it's a supported map format
    if ((!mapData.tiledversion) || (mapData.type !== "map")) {
      logger.warn("xel.MapManager.createFromJSON(): Unsupported map format (currently only Tiled JSON is supported)");
      logger.debug(mapData);
      return null;
    }

    // Make sure it contains all expected properties; Tiled will always create these, although they may be zero or empty (which is okay)
    if (!mapData.hasOwnProperty("width") || !mapData.hasOwnProperty("height") || !mapData.hasOwnProperty("tilewidth") || !mapData.hasOwnProperty("tileheight") || !mapData.hasOwnProperty("tilesets") || !mapData.orientation || !mapData.layers) {
      logger.error("xel.MapManager.createFromJSON(): Missing map parameter(s)");
      logger.debug(mapData);
      return null;
    }

    // Check the map orientation
    if (!(mapData.orientation === "isometric" || mapData.orientation === "orthogonal")) {
      logger.error("Map has unsupported orientation");
      logger.debug(mapData.orientation);
      return null;
    }

    // Fill in creation properties from map data
    var mapParams = {};
    for (var prop in mapData) {
      // Rename layer data so map.layers can be used for actual layer sprite containers
      if (prop === "layers")
        mapParams.layerData = mapData.layers;

      // Import any custom map properties
      else if (prop === "properties")
        for (var customProp in mapData.properties)
          mapParams[mapData.properties[customProp].name] = mapData.properties[customProp].value;

      else
        mapParams[prop] = mapData[prop];
    }

    // Actually create and return the map
    // It will fill in its own objects and such and call to load spritesheets as needed
    var map = Map.create(mapParams);
    return map;
  };


  xel_MapManager.loadMaps = function (maps, finalCallback) {
    // Single map name
    if (typeof maps === 'string') {
      var mapsObj = {};
      mapsObj[maps] = null;
      maps = mapsObj;
    }

    // Array of map names
    if (typeof maps.length === "number") {
      var mapsObj = {};
      for (var n = 0; n < maps.length; ++n)
        mapsObj[maps[n]] = null;
      maps = mapsObj;
    }

    if (typeof maps !== "object") {
      logger.error("xel.MapManager.loadMaps(): maps arg not valid");
      logger.debug(maps);
      return;
    }

    var loadedMaps = {};
    var mapLoader = new PIXI.Loader();
    mapLoader.mapOptions = {};

    for (var mapName in maps) {
      var options = maps[mapName] || {};
      mapLoader.mapOptions[mapName] = options;

      // Determine the URL
      if (options.url)
        var mapURL = options.url;
      else {
        var basePath = options.basePath || Config.maps.basePath;
        var mapURL = (basePath + mapName);
        if (!mapName.endsWith(".json"))
          mapURL += ".json";
      }

      // Check cache unless asked to reload the map
      if (options.reload) {
        delete xel_MapManager._maps[mapName];
        delete xel_MapManager._maps[mapURL];
        var map = null;
      }
      else
        var map = xel_MapManager._maps[mapName] || xel_MapManager._maps[mapURL];

      // See if we were able to use the cache
      if (map) {
        loadedMaps[mapName] = map;
        if (options.activate)
          xel_MapManager.activate(map, options.callback, options.exclusive);
        else {
          if (map.layers)
            map.layers.visible = false;
          if (typeof options.callback === "function")
            options.callback(map);
        }
      }
      else {
        mapLoader.add(mapName, mapURL);
        if (options.loaderPreCallback)
          mapLoader.pre(options.loaderPreCallback);
        if (options.loaderUseCallback)
          mapLoader.use(options.loaderUseCallback);
        if (options.loaderProgressCallback)
          mapLoader.onProgress.add(options.loaderProgressCallback);
      }
    }

    mapLoader.load(function(loader, resources) {
      for (var res in resources) {
        if ((resources[res].data) && (resources[res].type === PIXI.LoaderResource.TYPE.JSON)) {
          var map = xel_MapManager.createFromJSON(resources[res].data);
          if (map) {
            map.name = resources[res].name;
            map.url = resources[res].url;
            loadedMaps[map.name] = map;
            xel_MapManager._maps[map.name] = xel_MapManager._maps[map.url] = map;
            logger.debug("Map '" + map.name + "' loaded");

            var options = loader.mapOptions[map.name];
            if (options.activate)
              xel_MapManager.activate(map, options.callback, options.exclusive);
            else {
              if (map.layers)
                map.layers.visible = false;
              if (typeof options.callback === "function")
                options.callback(map);
            }
          }
          else {
            logger.error("xel.MapManager.loadMaps(): Failed to create map named '" + resources[res].name + "'");
            logger.debug(resources[res].url);
          }
        }
        else {
          logger.error("xel.MapManager.loadMaps(): Failed to load resource named '" + resources[res].name + "'");
          logger.debug(resources[res].url);
        }
      }

      if (typeof finalCallback === "function")
        finalCallback(loadedMaps);
    });
  };


  xel_MapManager.loadSpritesheets = function (sheets, finalCallback) {
    // Single sheet name
    if (typeof sheets === 'string') {
      var sheetsObj = {};
      sheetsObj[sheets] = null;
      sheets = sheetsObj;
    }

    // Array of sheet names
    if (typeof sheets.length === "number") {
      var sheetsObj = {};
      for (var n = 0; n < sheets.length; ++n)
        sheetsObj[sheets[n]] = null;
      sheets = sheetsObj;
    }

    if (typeof sheets !== "object") {
      logger.error("xel.MapManager.loadSpritesheets(): sheets arg not valid");
      logger.debug(sheets);
      return;
    }

    var loadedSheets = {};
    var sheetLoader = new PIXI.Loader();
    sheetLoader.sheetOptions = {};

    for (var sheetName in sheets) {
      var options = sheets[sheetName] || {};
      sheetLoader.sheetOptions[sheetName] = options;

      // Determine the URL
      if (options.url)
        var sheetURL = options.url;
      else {
        var basePath = options.basePath || Config.spritesheets.basePath;
        var sheetURL = (basePath + sheetName);
        if (!sheetName.endsWith(".json"))
          sheetURL += ".json";
      }

      // Check cache unless asked to reload the sheet
      var sheet;
      if (options.reload) {
        delete xel_MapManager._sheetCache[sheetName];
        delete xel_MapManager._sheetCache[sheetURL];
        sheet = null;
      }
      else
        sheet = xel_MapManager._sheetCache[sheetName] || xel_MapManager._sheetCache[sheetURL];

      // See if we were able to use the cache
      if (sheet) {
        loadedSheets[sheetName] = sheet;
        if (typeof options.callback === "function")
          options.callback(sheet);
      }
      else {
        sheetLoader.add(sheetName, sheetURL);
        if (options.loaderPreCallback)
          sheetLoader.pre(options.loaderPreCallback);
        if (options.loaderUseCallback)
          sheetLoader.use(options.loaderUseCallback);
        if (options.loaderProgressCallback)
          sheetLoader.onProgress.add(options.loaderProgressCallback);
      }
    }

    sheetLoader.load(function(loader, resources) {
      for (var res in resources) {
        if (resources[res].data) {
          // Spritesheet middleware adds images to the loader
          if (resources[res].type === PIXI.LoaderResource.TYPE.IMAGE)
            continue;

          var sheet = resources[res].spritesheet;
          if (sheet) {
            sheet.name = resources[res].name;
            sheet.url = resources[res].url;
            sheet.imageName = resources[res].data["meta"]["image"];

            // Import any custom directional animation data
            if (sheet.data.directionalAnimations) {
              var dirAnims = {};
              for (var animGroupName in sheet.data.directionalAnimations) {
                dirAnims[animGroupName] = [];
                var animGroup = sheet.data.directionalAnimations[animGroupName];
                for (var animNum in animGroup) {
                  var animName = animGroup[animNum];
                  var anim = sheet.animations[animName];
                  if (anim)
                    dirAnims[animGroupName].push(anim);
                  else
                    logger.warn("xel.MapManager.loadSpritesheets(): Animation '" + animName + "' in group '" + animGroupName + "' could not be found");
                }
              }
              sheet.directionalAnimations = dirAnims;
              sheet.defaultAnimationSpeed = sheet.data.defaultAnimationSpeed || 0;
            }

            loadedSheets[sheet.name] = sheet;
            xel_MapManager._sheetCache[sheet.name] = xel_MapManager._sheetCache[sheet.imageName] = xel_MapManager._sheetCache[sheet.url] = sheet;

            var options = loader.sheetOptions[sheet.name];
            if (typeof options.callback === "function")
              options.callback(sheet);
          }
          else {
            logger.error("xel.MapManager.loadSpritesheets(): Failed to parse spritesheet named '" + resources[res].name + "'");
            logger.debug(resources[res].url);
          }
        }
        else {
          logger.error("xel.MapManager.loadSpritesheets(): Failed to load resource named '" + resources[res].name + "'");
          logger.debug(resources[res].url);
        }
      }

      if (typeof finalCallback === "function")
        finalCallback(loadedSheets);
    });
  };


  xel_MapManager.clearMaps = function () {
    var xel = require("xel");
    xel.app.stage.removeChildren();
    delete xel_MapManager._maps;
    xel_MapManager._maps = {};
  }


  xel_MapManager.clearAll = function () {
    xel_MapManager.clearMaps();
    delete xel_MapManager._sheetCache;
    xel_MapManager._sheetCache = {};
  }


  xel_MapManager.activate = function (map, callback, exclusive) {
    if (typeof map === "string") {
      // If given a map name, make sure it's loaded; loadMaps will
      // recursively pass the map object and params back to activate()
      var mapOptions = {};
      mapOptions[map] = { "activate": true, "callback": callback, "exclusive": exclusive };
      xel_MapManager.loadMaps(mapOptions);
    }
    else if (typeof map === "object") {
      if (exclusive) {
        for (map in xel_MapManager._maps)
          xel_MapManager._maps[map].layers.visible = false;
      }
      map.layers.visible = true;
    }
    else
      logger.warn("xel.MapManager.activate(): map parameter invalid");
  };

  return xel_MapManager;
});
