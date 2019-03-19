"use strict";

function die(errorMsg) {
  document.getElementsByTagName('body')[0].innerHTML += "<h4>" + errorMsg + "</h4>";
  throw new Error(errorMsg);
}


// Sanity checks: make sure engine and lib objects exist
if (typeof xel === 'undefined') {
  die("Please initialize xel object and platform vars before loading gameMain");
}
if (typeof hexi === 'undefined') {
  die("Please load Hexi script before loading gameMain");
}


// Function for Hexi's asset preload
xel.gamePreload = function () {
  xel.hx.loadingBar();
};


// Function for Hexi loop-start setup
xel.gameSetup = function () {
  // Load splash screen

  // Start delta timer

  // Add event handlers to call hexi pause and resume

  // Set the current state-loop (game-loop) function
  xel.hx.state = xel.gameStateStart;
};


// Set up Hexi object; platform variables and assetList[] should already be set up 
xel.hx = hexi(xel.windowWidth, xel.windowHeight, xel.gameSetup, xel.assetList, xel.gamePreload);


// Scenes are an extension of Hexi groups
xel.Scene = function (name) {
  this.name = name;
};
xel.Scene.prototype = xel.hx.group();


// Scene manager (separate from Hexi's scene graph)
xel.SceneManager = function () {
  this.scenes = [];
};
xel.SceneManager.prototype = {
  getScene: function (name) {
    if (name in this.scenes) {
      return this.scenes[name];
    } else {
      var sc = new xel.Scene(name);
      this.scenes[name] = sc;
      this.hideScene(sc);
      return sc;
    }
  },

  hideScene: function (scene) {
    if (typeof scene === 'undefined') {
      if (xel.platform === "browser") {
        console.error("ERROR hideScene(): No scene given.");
      }
      return;
    }
    if (typeof scene === 'string') {
      this.getScene(scene).visible = false;
    } else {
      scene.visible = false;
    }
  },

  showScene: function (scene) {
    if (typeof scene === 'undefined') {
      if (xel.platform === "browser") {
        console.error("ERROR showScene(): No scene given.");
      }
      return;
    }
    if (typeof scene === 'string') {
      this.getScene(scene).visible = true;
    } else {
      scene.visible = true;
    }
  },

  switchToScene: function (scene) {
    for (var s in this.scenes) {
      this.hideScene(s);
    }
    this.showScene(scene);
  }
};


xel.gameStateStart = function() {
  
};


function main() {
  // Create SceneManager
  xel.mgr = new xel.SceneManager();

  // Set Hexi vars and launch the game loop
  xel.hx.fps = xel.maxFPS;
  xel.hx.backgroundColor = 0x666666;
  xel.hx.scaleToWindow();
  xel.hx.start();
}
