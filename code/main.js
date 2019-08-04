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

requirejs(["logger", "xel"], function (logger, xel) {
  function setup() {
    xel.MapManager.activate("a0m0-iso");

    return true;
  }


  function update() {
    
  }


  function main() {
    logger.debugMode = true;
    xel.initialize();
    if (xel.initialized) {
      if (setup())
        xel.app.ticker.add(update);
    }
  }

  main();
});
