
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

xel.gameMain = function() {
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
