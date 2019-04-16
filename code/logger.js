/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

var logger = {};
logger.messages = new Array();
logger.logbox = document.createElement("div");
logger.logbox.id = "logbox";
document.body.append(logger.logbox);

logger.clear = function () {
  logger.messages = new Array();
  logger.logbox.innerHTML = "";
  console.clear();
}

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
}

logger.log = function (msg) {
  if (msg) {
    logger.push(msg);
    console.log(msg);
  }
};

logger.warn = function (msg) {
  if (msg) {
    msgHTML = '<span style="color: orange;">WARN: ' + msg + '</span>';
    logger.push(msgHTML);
    console.warn(msg);
  }
};

logger.error = function (msg) {
  if (msg) {
    msgHTML = '<span style="color: red;">ERROR: ' + msg + '</span>';
    logger.push(msgHTML);
    console.error(msg);
  }
};

// Uncaught throws will typically be logged in console by the window
logger.boxError = function (msg) {
  if (msg) {
    msgHTML = '<span style="color: red;">ERROR: ' + msg + '</span>';
    logger.push(msgHTML);
  }
};

window.onerror = logger.boxError;
