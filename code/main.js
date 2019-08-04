/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

requirejs.config({
    paths: {
        PIXI: 'lib/pixi5-legacy.min',
        pixi5: 'lib/pixi5-legacy.min'
    },
    shim: {
      'PIXI': {
        exports: 'PIXI'
      },
      'pixi5': {
        exports: 'PIXI'
      }
    }
});

requirejs(["logger", "xel", "game"], function (logger, xel, game) {
  // Initialize engine, then hand control over to the game
  logger.debugMode = true;
  xel.initialize();
  if (xel.initialized) {
    if (game.setup())
      xel.app.ticker.add(game.update);
  }
});
