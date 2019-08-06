/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

"use strict";

define(["logger"], function (logger) {
  var xel_EntityManager = {};
  xel_EntityManager._entities = [];
  xel_EntityManager._nextID = 0;


  xel_EntityManager.getNextID = function () {
    return xel_EntityManager._nextID;
  };


  xel_EntityManager.create = function (components) {
    var e = {};
    var id = xel_EntityManager._nextID;

    // Fill in any components
    for (var name in components) {
      var comp = components[name];
      if (typeof comp === "object")
        comp.entity = id;
      e[name] = comp;
    }

    xel_EntityManager._entities[id] = e;
    ++xel_EntityManager._nextID;

    return id;
  };


  xel_EntityManager.isValid = function (id) {
    if ((typeof id === "number") && (xel_EntityManager._entities[id]))
      return true;
    else
      return false;
  }


  xel_EntityManager.setComponents = function (id, components) {
    var e = xel_EntityManager._entities[id];
    if (!e)
      e = xel_EntityManager._entities[id] = {};
    for (var name in components) {
      var comp = components[name];
      if (typeof comp === "object")
        comp.entity = id;
      e[name] = comp;
    }
  };


  xel_EntityManager.getComponent = function (id, compName) {
    var e = xel_EntityManager._entities[id];
    if (e && e[compName])
      return e[compName];
    else
      return null;
  };


  xel_EntityManager.removeComponents = function (id, components, destroy) {
    var e = xel_EntityManager._entities[id];
    if (e) {
      // Convert single component name to list
      if (typeof components === "string")
        components = [components];

      // Remove all components if none were given
      if (components)
        var compSrc = components;
      else
        var compSrc = e;

      for (name in compSrc) {
        var comp = e[name];
        if (comp) {
          // Handle specialized component destruction
          if (destroy) {
            if ((comp instanceof PIXI.DisplayObject) && comp.parent)
              comp.parent.removeChild(comp);
          }

          if (typeof comp === "object")
            delete comp.entity;
          delete e[name];
        }
      }
    }
    else
      logger.debug("xel.EntityManager.removeComponents(): Entity '" + id.toString() + "' doesn't exist");
  }


  xel_EntityManager.destroy = function (id) {
    xel_EntityManager.removeComponents(id, null, true);
    delete xel_EntityManager._entities[id];
  };


  xel_EntityManager.destroyAll = function () {
    for (var id = 0; id < xel.EntityManager._nextID; ++id)
      xel_EntityManager.destroy(id);
  };

  return xel_EntityManager;
});
