"use strict";

xel.gameLoad = function() {
  xel.hx.loadingBar();
}


xel.gameStateStart = function() {
  
}


xel.gameSetup = function() {
  xel.hx.backgroundColor = 0x10a010;
  xel.hx.state = xel.gameStateStart;
}


xel.listPreloadAssets = function() {
  
}


function main() {
  // Sanity check: make sure container object and libraries are already defined
  if ((typeof xel == 'undefined')
   || (typeof hexi == 'undefined')
   || (typeof EntityManager == 'undefined')) {
      var errorMsg = "gameMain ERROR: Main object or library not loaded; aborting.";
      console.error(errorMsg);
      console.log("xel: " + (typeof xel));
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

  // Launch Hexi
  xel.hx = hexi(xel.windowWidth, xel.windowHeight, xel.gameSetup, xel.listPreloadAssets(), xel.gameLoad);
  xel.hx.fps = xel.fps;
  xel.hx.scaleToWindow();
  xel.hx.start();
}
