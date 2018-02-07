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
module.exports = function VectorDecoratingPipelineNode(vectorFactory, scene) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof VectorDecoratingPipelineNode)) {
    return new VectorDecoratingPipelineNode(vectorFactory, scene);
  }
  this.vectorFactory = vectorFactory;
  this.scene = scene;
  makeDataLink.call(this);
};

module.exports.prototype.onDataChanged = function(event) {
  var mesh;
  var added = [];

  //Don't worry about removed, the parent item takes care of it

  for (let i = 0; i < event.added.length; i++) {
    mesh = event.added[i];

    if (mesh.data && mesh.data.item && mesh.data.item.vectors) {
      for (let j = 0; j < mesh.data.item.vectors.length; j++) {
        let vector = this.vectorFactory.getMesh(
          mesh.data.item.vectors[j],
          this.scene
        );
        vector.position.x = mesh.position.x;
        vector.position.y = mesh.position.y;
        vector.position.z = mesh.data.baseZ - (j + 1);
      }
    }
  }
  this.emitEvent("dataChanged", [
    { added: added, removed: event.removed, updated: event.updated }
  ]);
};

module.exports.prototype.setScene = function(scene) {
  this.scene = scene;
};
