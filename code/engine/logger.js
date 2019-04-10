/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

var logger = {};
logger.logbox = document.createElement("div");
logger.logbox.id = "logbox";
logger.file = "logger.js";
document.body.append(logger.logbox);

logger.clear = function () {
  logger.logbox.innerHTML = "";
}

logger.log = function (msg) {
  if (msg) {
    msgText = logger.file + ': ' + msg;
    var boxContent = msgText + '<br />' + logger.logbox.innerHTML;
    logger.logbox.innerHTML = boxContent;
    console.log(msgText);
  }
};

logger.warn = function (msg) {
  if (msg) {
    msgText = logger.file + ': ' + msg;
    var boxContent = '<span style="color: orange;">' + msgText + '</span><br />' + logger.logbox.innerHTML;
    logger.logbox.innerHTML = boxContent;
    console.warn(msgText);
  }
};

logger.error = function (msg) {
  if (msg) {
    msgText = logger.file + ': ' + msg;
    var boxContent = '<span style="color: red;">' + msgText + '</span><br />' + logger.logbox.innerHTML;
    logger.logbox.innerHTML = boxContent;
    console.error(msgText);
  }
};

// Uncaught throws will be logged in console by the window
logger.boxError = function (msg) {
  if (msg) {
    msgText = logger.file + ': ' + msg;
    var boxContent = '<span style="color: red;">' + msgText + '</span><br />' + logger.logbox.innerHTML;
    logger.logbox.innerHTML = boxContent;
  }
};

window.onerror = logger.boxError;
