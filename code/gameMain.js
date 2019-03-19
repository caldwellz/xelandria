"use strict";
if (typeof xel == 'undefined') {
  xel = {};
}


xel.Scene = function(name) {
  this.name = name;
}
xel.Scene.prototype = new hexi.group();


xel.SceneManager = function() {
  this.scenes = [];
}
xel.SceneManager.prototype = {
  getScene: function(name) {
    if (name in scenes) {
      return scenes[name];
    }
    else {
      var sc = new Scene(name);
      scenes[name] = sc;
      hideScene(sc);
      return sc;
    }
  },

  hideScene: function(scene) {
    if (typeof scene === 'undefined') {
      console.error("ERROR hideScene(): No scene given.");
      return;
    }
    if (typeof scene === 'string') {
      getScene(scene).visible = false;
    }
    else {
      scene.visible = false;
    }
  },

  showScene: function(scene) {
    if (typeof scene === 'undefined') {
      console.error("ERROR showScene(): No scene given.");
      return;
    }
    if (typeof scene === 'string') {
      getScene(scene).visible = true;
    }
    else {
      scene.visible = true;
    }
  },

  switchToScene: function(scene) {
    for (s in scenes) {
      hideScene(s);
    }
    showScene(scene);
  }
}


xel.gameLoad = function() {
  xel.hx.loadingBar();
}


xel.gameStateStart = function() {
  
}


xel.gameSetup = function() {
  // Load splash screen

  // Start delta timer

  // Add event handlers to call hexi pause and resume

  xel.hx.state = xel.gameStateStart;
}


xel.listPreloadAssets = function() {
  
}


function main() {
  // Sanity check: make sure libraries are already defined
  if ((typeof hexi == 'undefined')
   || (typeof EntityManager == 'undefined')) {
      var errorMsg = "ERROR main(): Required library object(s) not found; aborting.";
      console.error(errorMsg);
      console.log("hexi: " + (typeof hexi));
      console.log("EntityManager: " + (typeof EntityManager));
      document.getElementsByTagName('body')[0].innerHTML += "<h4>" + errorMsg + "</h4>";
      return;
  }

  // Set up canvas size and FPS
  // For now, just use window size and default fps
  xel.windowWidth = window.innerWidth;
  xel.windowHeight = window.innerHeight;
  xel.fps = 60;

  // Set up Hexi
  xel.hx = hexi(xel.windowWidth, xel.windowHeight, xel.gameSetup, xel.listPreloadAssets(), xel.gameLoad);
  xel.hx.fps = xel.fps;
  xel.hx.backgroundColor = 0x666666;
  xel.hx.scaleToWindow();

  // Set up SceneManager
  xel.mgr = new xel.SceneManager();

  // Launch the game loop
  xel.hx.start();
}
