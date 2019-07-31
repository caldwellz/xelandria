/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

requirejs.config({
    paths: {
        PIXI: 'lib/pixi5-legacy',
        pixi5: 'lib/pixi5-legacy'
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

requirejs(["logger",
           "tests/xel",
           "tests/xel_Map"],
  function (logger, test_xel, test_xel_Map) {
    logger.testMode = true;

    if (typeof test_xel === 'function')
      test_xel(); //takes care of xel.initialize(), etc.

    if (typeof test_xel_Map === 'function')
      test_xel_Map();
});
