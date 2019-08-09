/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["logger", "xel"], function (logger, xel) {
  var game = {};


  game.setup = function () {
    xel.setCursor("default", "cursor-grey.png");
    xel.setCursor("pointer", "cursor-blue.png");
    xel.setCursor("not-allowed", "cursor-red.png");

    // Set some fun demo things
    xel.MapManager.activate("a0m0-iso", function () {
      // loot_low group
      xel.InteractionGroups.forEach("loot_low", function (item) {
        item.cursor = "pointer";
        //item.anchor.set(0.5);
      });
      xel.InteractionGroups.on("loot_low", "pointerover", function () {
        this.tint = 0x9999FF;
        this.y -= 10;
      });
      xel.InteractionGroups.on("loot_low", "pointerout", function () {
        this.tint = 0xFFFFFF;
        this.y += 10;
      });
      xel.InteractionGroups.on("loot_low", "pointerdown", function () {
        // Temporary hack to overcome scale / anchor issues
        this.x -= (this.width * 0.1) - 10;
        this.y -= (this.height * 0.1) - 10;

        this.scale.set(1.1);
        logger.log("Loot clicked: " + this.spritesheet.imageName);
      });
      xel.InteractionGroups.on("loot_low", "pointerup", function () {
        this.scale.set(1);
        this.x += (this.width * 0.1) - 10;
        this.y += (this.height * 0.1) - 10;
      });

      // sword case
      xel.InteractionGroups.forEach("tavern_swordcase", function (item) {
        item.cursor = "not-allowed";
      });
      xel.InteractionGroups.on("tavern_swordcase", "pointerover", function () { this.tint = 0xFF9999 });
      xel.InteractionGroups.on("tavern_swordcase", "pointerout", function () { this.tint = 0xFFFFFF });
    });

    return true;
  };


  game.update = function () {
    
  };

  return game;
});
