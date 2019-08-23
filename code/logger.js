/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

var logger = {};
logger.messages = new Array();
logger.logbox = document.createElement("div");
logger.logbox.id = "logbox";
document.body.appendChild(logger.logbox);


logger.clear = function () {
  logger.messages = new Array();
  logger.logbox.innerHTML = "";
  console.clear();
};


logger.push = function (msg, color) {
  if (typeof msg === 'string') {
    if (typeof color === 'number')
      color = "#" + color.toString(16);
    if (typeof color === 'string') {
      var msgHTML = '<span style="color: ' + color + '">' + msg + '</span>';
      logger.messages.push(msgHTML);
    }
    else
      logger.messages.push(msg);
    logger.logbox.innerHTML = logger.messages.join("<br />");
    logger.logbox.scrollTop = logger.logbox.scrollHeight;
  }
};


logger.rewrite = function (msg) {
  if (msg) {
    logger.messages.pop();
    logger.push(msg);
  }
};


logger.log = function (msg, color) {
  if (msg) {
    logger.push(msg, color);
    console.log(msg);
  }
};


logger.debug = function (msg) {
  if (msg && logger.debugMode) {
    if (typeof msg === 'string')
      logger.push("[DBG] " + msg, '#909090');
    console.debug(msg);
  }
};


logger.warn = function (msg) {
  if (msg) {
    if (typeof msg === 'string')
      logger.push("[WARN] " + msg, 'orange');
    console.warn(msg);
  }
};


logger.error = function (msg) {
  if (msg) {
    if (typeof msg === 'string')
      logger.push("[ERR] " + msg, 'red');
    console.error(msg);
  }
};


// Uncaught errors will typically already get logged in console by the window
logger.boxError = function (msg) {
  if (typeof msg === 'string')
    logger.push("[CRIT] " + msg, 'red');
};
window.onerror = logger.boxError;

//RequireJS export
if (requirejs)
  define(logger);
