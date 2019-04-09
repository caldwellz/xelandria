/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

// *** imports
if (typeof logger === 'undefined') { throw "Please set up environment-specific logger"; }
else logger.file = "main.js";
if (typeof xel === 'undefined') { throw "main.js: xel engine does not exist!"; }
// ***

function main() {
  xel.initialize();
}

main();
