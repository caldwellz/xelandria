/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";
var logger = {};
logger.messages = new Array();
logger.logbox = document.createElement("div");
logger.logbox.id = "logbox";
document.body.appendChild(logger.logbox);

logger.testsPassed = 0;
logger.testsFailed = 0;

logger.clear = function () {
  logger.messages = new Array();
  logger.logbox.innerHTML = "";
  console.clear();
};


logger.push = function (msg) {
  if (msg) {
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


logger.log = function (msg) {
  if (msg && !logger.testMode) {
    if (typeof msg === 'string')
      logger.push(msg);
    console.log(msg);
  }
};


logger.debug = function (msg) {
  if (msg && logger.debugMode && !logger.testMode) {
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: #909090;">[DBG] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.debug(msg);
  }
};


logger.warn = function (msg) {
  if (msg && !logger.testMode) {
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: orange;">[WARN] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.warn(msg);
  }
};


logger.error = function (msg) {
  if (msg && !logger.testMode) {
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
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: green;">[PASSED] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.log(msg);
  }
};


logger.fail = function (msg) {
  logger.testsFailed++;
  if (msg && logger.testMode) {
    if (typeof msg === 'string') {
      var msgHTML = '<span style="color: red;">[FAILED] ' + msg + '</span>';
      logger.push(msgHTML);
    }
    console.warn(msg);
  }
};


logger.assert = function (condition, msg) {
  if (condition)
    logger.pass(msg);
  else
    logger.fail(msg);
}


logger.beginTest = function (testName) {
  if ((typeof testName === 'string') && logger.testMode) {
    var msg = "*** Beginning test 'testbed/" + testName + "' ***";
    var msgHTML = '<span style="color: blue;">' + msg + '</span>';
    logger.push(msgHTML);
    console.log(msg);
  }
}


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
