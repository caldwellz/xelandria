/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["require", "logger", "pixi5", "xel/Config", "xel/EntityManager"], function (require, logger, PIXI, Config, EntityManager) {
  var xel_InteractionGroups = {};
  xel_InteractionGroups._groups = {};

  xel_InteractionGroups.getGroups = function () {
    var nameList = [];
    for (var name in xel_InteractionGroups._groups)
      nameList.push(name);
    return nameList;
  }


  xel_InteractionGroups.addItems = function (groupName, items) {
    if ((typeof groupName === "string") && items) {
      // Convert a single item into an array
      if (typeof items.forEach !== "function")
        items = [items];

      // Create the group if needed
      if (!xel_InteractionGroups._groups[groupName])
        xel_InteractionGroups._groups[groupName] = [];

      items.forEach(function (item) {
        var sprite;
        // Is it an entity ID?
        if (typeof item === "number") {
          if (EntityManager.isValid(item)) {
            sprite = EntityManager.getComponent(item, "sprite");
            if (!sprite)
              logger.warn("xel.InteractionGroups.addItems(): Entity '" + item.toString() + "' has no sprite component");
          }
          else
            logger.warn("xel.InteractionGroups.addItems(): Invalid entity ID '" + item.toString() + "'");
        }

        // Is it a sprite or other display object?
        else if (item instanceof PIXI.DisplayObject)
          sprite = item;

        // Can't figure out what the item is
        else {
          logger.warn("xel.InteractionGroups.addItems(): Invalid item");
          logger.debug(item);
        }

        // Add the sprite and update variables
        if (sprite) {
          sprite.interactive = true;
          xel_InteractionGroups._groups[groupName].push(sprite);

          // Set the hit-test bounding box to be the actual trimmed image size (instead of the full tile area)
          sprite.hitArea = sprite.texture.trim;

          // Update the group list in the entity component
          if (sprite.entity) {
            var groupList = EntityManager.getComponent(sprite.entity, "interactionGroups") || [];
            groupList.push(groupName);
            EntityManager.setComponents(sprite.entity, {"interactionGroups": groupList});
          }
        }
      });
    }
  };


  xel_InteractionGroups.forEach = function (groupName, func) {
    if ((typeof groupName === "string") && (typeof func === "function")) {
      if (xel_InteractionGroups._groups[groupName])
        xel_InteractionGroups._groups[groupName].forEach(func);
      else
        logger.warn("xel.InteractionGroups.forEach(): Group name '" + groupName + "' doesn't exist");
    }
    else {
      logger.warn("xel.InteractionGroups.forEach(): Invalid parameter(s)");
      console.log(groupName);
      console.log(func);
    }
  };


  xel_InteractionGroups.setCursorStyle = function (groupName, styleName) {
    xel_InteractionGroups.forEach(groupName, function (item) {
      item.cursor = styleName;
    });
  };


  xel_InteractionGroups.on = function (groupName, eventName, func) {
    if ((typeof groupName === "string") && (typeof eventName === "string") && (typeof func === "function")) {
      if (xel_InteractionGroups._groups[groupName]) {
        xel_InteractionGroups._groups[groupName].forEach(function (item) {
          // PIXI.Sprite on() calls are additive, so we don't have to worry
          // about multi-group sprites getting their events overwritten.
          // TODO: Additive on() calls also mean we should probably find a way to remove / overwrite event callbacks within a group.
          item.on(eventName, func);
        });
      }
      else
        logger.warn("xel.InteractionGroups.on(): Group '" + groupName + "' doesn't exist");
    }
    else {
      logger.error("xel.InteractionGroups.on(): Invalid parameter(s)");
      console.log(groupName);
      console.log(eventName);
      console.log(func);
    }
  };

  return xel_InteractionGroups;
});
