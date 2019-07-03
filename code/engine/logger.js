/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
var logger = {};
logger.module = "";
logger.messages = new Array();
logger.logbox = document.createElement("div");
logger.logbox.id = "logbox";
document.body.appendChild(logger.logbox);

logger.testsPassed = 0;
logger.testsFailed = 0;

logger.clear = function () {
  logger.module = "";
  logger.messages = new Array();
  logger.logbox.innerHTML = "";
  console.clear();
};


logger.push = function (msg) {
  if (msg) {
    logger.messages.unshift(msg);
    logger.logbox.innerHTML = logger.messages.join("<br />");
  }
};


logger.rewrite = function (msg) {
  if (msg) {
    logger.messages[0] = msg;
    logger.logbox.innerHTML = logger.messages.join("<br />");
  }
};


logger.modulize = function (msg) {
  if ((typeof msg === 'string') && (logger.module.length > 0) && (logger.debugMode || logger.testMode))
    return logger.module + ": " + msg;
  else
    return msg;
}


logger.log = function (msg) {
  if (msg && !logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string')
      logger.push(msg);
    console.log(msg);
  }
};


logger.debug = function (msg) {
  if (msg && logger.debugMode && !logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: #909090;">[DBG] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.debug(msg);
  }
};


logger.warn = function (msg) {
  if (msg && !logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: orange;">[WARN] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.warn(msg);
  }
};


logger.error = function (msg) {
  if (msg && !logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: red;">[ERR] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.error(msg);
  }
};


logger.pass = function (msg) {
  logger.testsPassed++;
  if (msg && logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: green;">[PASS] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.log(msg);
  }
};


logger.fail = function (msg) {
  logger.testsFailed++;
  if (msg && logger.testMode) {
    msg = logger.modulize(msg);
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: red;">[FAIL] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.warn(msg);
  }
};


logger.logTestStats = function () {
  var msg = "Tests passed: " + String(logger.testsPassed);
  logger.push('<span style="color: green;">' + msg + '</span>');
  console.log(msg)
  var msg = "Tests failed: " + String(logger.testsFailed);
  logger.push('<span style="color: red;">' + msg + '</span>');
  console.log(msg)
  var msg = "Total tests: " + String(logger.testsFailed + logger.testsPassed);
  logger.push('<span style="font-weight: bold;">' + msg + '</span>');
  console.log(msg)
};


logger.clearTestStats = function () {
  logger.testsFailed = 0;
  logger.testsPassed = 0;
}


// Uncaught throws will typically be logged in console by the window
logger.boxError = function (msg) {
  if (typeof msg === 'string') {
    var msgHTML = '<span style="color: red;">[ERR] ' + msg + '</span>';
    logger.push(msgHTML);
  }
};
window.onerror = logger.boxError;
