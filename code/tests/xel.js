/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["logger", "xel"], function (logger, xel) {
  return function () {
    if (!xel)
      return;
    logger.beginTest("xel");

    xel.initialize();
    logger.assert(xel.initialized, "Initializing xel engine");
    
    if (xel.initialized) {
      xel.destroy();
      logger.assert(!xel.initialized, "Destroying xel engine");
    }

    xel.reload()
    logger.assert(xel.initialized, "Reloading xel engine");
  };
});
