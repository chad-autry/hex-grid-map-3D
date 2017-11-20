"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DrawnItemDataLink
 */

var makeDataLink = require("data-chains/src/DataLinkMixin");

/**
 * This DataLink consumes events with item dtos and produces Babylon.js Meshes attached to the scene at 0, 0
 * @constructor
 */
module.exports = function ItemMappingPipelineNode(meshFactoryMap, scene) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof ItemMappingPipelineNode)) {
    return new ItemMappingPipelineNode(meshFactoryMap, scene);
  }
  this.meshFactoryMap = meshFactoryMap;
  this.scene = scene;
  makeDataLink.call(this);
  this.meshMap = {};
};

module.exports.prototype.onDataChanged = function(event) {
  var i, mesh, item;
  var removed = [];
  var added = [];
  for (i = 0; i < event.removed.length; i++) {
    item = event.removed[i];
    if (!("id" in item) || !this.meshMap.hasOwnProperty(item.id)) {
      //Invalid item! Throw a hissy fit!
      continue;
    }

    mesh = this.meshMap[item.id];
    mesh.dispose();
    delete this.meshMap[item.id];
    removed.push(mesh);
  }

  for (i = 0; i < event.added.length; i++) {
    item = event.added[i];
    if (!("id" in item) || this.meshMap.hasOwnProperty(item.id)) {
      //Don't know what to do with an item which doesn't have an ID, or we already have an item with the given ID
      continue;
    }

    if (this.meshFactoryMap.hasOwnProperty(item.type)) {
      mesh = this.meshFactoryMap[item.type](item, this.scene);
    }

    if (!mesh) {
      //TODO Log that an unexpected object was encountered
      continue;
    }
    if (!mesh.data) {
      mesh.data = {};
    }

    mesh.data.item = item;
    added.push(mesh);
    this.meshMap[item.id] = mesh;
  }
  this.emitEvent("dataChanged", [
    { added: added, removed: removed, updated: event.updated }
  ]);
};

module.exports.prototype.setScene = function(scene) {
  this.scene = scene;
};
