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

  // Add some sample stuff
  xel.sc1 = xel.mgr.getScene("sc1");
  xel.spr1 = xel.hx.sprite("assets/2d/placeable/library/bookcaseBooks_SW.png");
  xel.spr2 = xel.hx.sprite("assets/2d/placeable/library/bookcaseGlass_S.png");
  xel.spr1.vx = 5 * xel.hx.randomInt(-1, -0.1);
  xel.spr1.vy = 5 * xel.hx.randomInt(0.1, 1);
  xel.spr2.vx = 5 * xel.hx.randomInt(0.1, 1);
  xel.spr2.vy = 5 * xel.hx.randomInt(-1, -0.1);
  xel.spr1.scale = xel.spr2.scale = {
    x: 0.5,
    y: 0.5
  };
  xel.sc1.add(xel.spr1, xel.spr2);
  xel.mgr.switchToScene(xel.sc1);

  // Set the current state-loop (game-loop) function
  xel.hx.state = xel.gameStateStart;
};


// Set up Hexi object; platform variables and assetList[] should already be set up 
xel.hx = hexi(xel.windowWidth, xel.windowHeight, xel.gameSetup, xel.assetList, xel.gamePreload);


// Scene manager (separate from Hexi's scene graph)
xel.SceneManager = function () {
  this.scenes = [];
};
xel.SceneManager.prototype = {
  getScene: function (name) {
    if (name in this.scenes) {
      return this.scenes[name];
    } else {
      var sc = xel.hx.group();
      sc.name = name;
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
  xel.hx.move([xel.spr1, xel.spr2]);

  var cnt = xel.hx.contain(xel.spr1, 
  {
    x: 1, y: 1,
    width: xel.hx.canvas.width - 2,
    height: xel.hx.canvas.height - 2
  });
  if (cnt) {
    if (cnt.has("top") || cnt.has("bottom"))
      xel.spr1.vy *= -1;
    else if (cnt.has("left") || cnt.has("right"))
      xel.spr1.vx *= -1;
  }

  cnt = xel.hx.contain(xel.spr2, xel.hx.stage);
  if (cnt) {
    if (cnt.has("top") || cnt.has("bottom"))
      xel.spr2.vy *= -1;
    else if (cnt.has("left") || cnt.has("right"))
      xel.spr2.vx *= -1;
  }
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
