/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["require", "logger", "xel/Config"], function (require, logger, Config) {
  var xel_PersistentStorageManager = {};
  xel_PersistentStorageManager._connector = null;


  xel_PersistentStorageManager.useStorageConnector = function (name, options, callback) {
    if (typeof name === "string") {
      var moduleName = "xel/" + Config.storage.connectorNamePrefix + name;
      require([moduleName], function (connector) {
        if (connector) {
          xel_PersistentStorageManager._connector = connector;
          if (typeof connector.init === "function") {
            if (connector.init(options)) {
              connector.name = connector.name || name;
              logger.debug("xel.PersistentStorageManager.useStorageConnector(): Initialized connector module '" + moduleName + "'");
            }
            else {
              logger.error("xel.PersistentStorageManager.useStorageConnector(): Could not initialize connector module '" + moduleName + "'");
              logger.debug(options);
              xel_PersistentStorageManager._connector = null;
            }
          }
          if ((typeof callback === "function") && xel_PersistentStorageManager._connector)
            callback(xel_PersistentStorageManager);
        }
        else
          logger.error("xel.PersistentStorageManager.useStorageConnector(): Could not load connector module '" + moduleName + "'");
      }, function () {
        logger.error("xel.PersistentStorageManager.useStorageConnector(): Could not load connector module '" + moduleName + "'");
      });
    }
    else {
      logger.warn("xel.PersistentStorageManager.useStorageConnector(): name is not a string");
      logger.debug(name);
    }
  };


  xel_PersistentStorageManager.getStorageConnector = function () {
    if (xel_PersistentStorageManager._connector)
      return xel_PersistentStorageManager._connector.name;
    else
      return null;
  };


  xel_PersistentStorageManager.getKeys = function () {
    if (xel_PersistentStorageManager._connector) {
      if (typeof xel_PersistentStorageManager._connector.getKeys === "function")
        return xel_PersistentStorageManager._connector.getKeys();
      else
        logger.error("xel.PersistentStorageManager.getKeys(): Active storage connector has no getKeys function");
    }
    else
      logger.error("xel.PersistentStorageManager.getKeys(): No storage connector active yet");
  };


  xel_PersistentStorageManager.saveState = function (key) {
    if (xel_PersistentStorageManager._connector) {
      if (typeof key === "string") {
        if (typeof xel_PersistentStorageManager._connector.saveState === "function")
          xel_PersistentStorageManager._connector.saveState(key);
        else
          logger.error("xel.PersistentStorageManager.saveState(): Active storage connector has no saveState function");
      }
      else {
        logger.warn("xel.PersistentStorageManager.saveState(): Key is not a string");
        logger.debug(key);
      }
    }
    else
      logger.error("xel.PersistentStorageManager.saveState(): No storage connector active yet");
  };


  xel_PersistentStorageManager.loadState = function (key) {
    if (xel_PersistentStorageManager._connector) {
      if (typeof key === "string") {
        if (typeof xel_PersistentStorageManager._connector.loadState === "function")
          xel_PersistentStorageManager._connector.loadState(key);
        else
          logger.error("xel.PersistentStorageManager.loadState(): Active storage connector has no loadState function");
      }
      else {
        logger.warn("xel.PersistentStorageManager.loadState(): Key is not a string");
        logger.debug(key);
      }
    }
    else
      logger.error("xel.PersistentStorageManager.loadState(): No storage connector active yet");
  };

  return xel_PersistentStorageManager;
});
