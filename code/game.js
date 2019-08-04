/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["logger", "xel"], function (logger, xel) {
  var game = {};


  game.setup = function () {
    xel.MapManager.activate("a0m0-iso");

    return true;
  };


  game.update = function () {
    
  };

  return game;
});
