"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module PlanarPositioningDataLink
 */

var makeDataLink = require("data-chains/src/DataLinkMixin");

/**
 * This DataLink expects events with meshes, and an item with a U, V position. It sets their X, Y position using the given cartesian-hexagonal util
 * @constructor
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function PlanarPositioningPipelineNode(hexDimensions) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof PlanarPositioningPipelineNode)) {
    return new PlanarPositioningPipelineNode(hexDimensions);
  }
  this.hexDimensions = hexDimensions;
  makeDataLink.call(this);
};

module.exports.prototype.onDataChanged = function(event) {
  var i, mesh, item, pixelCoordinates;

  for (i = 0; i < event.added.length; i++) {
    mesh = event.added[i];
    item = mesh.data.item;
    pixelCoordinates = this.hexDimensions.getPixelCoordinates(item.u, item.v);
    mesh.position.x = pixelCoordinates.x;
    mesh.position.y = pixelCoordinates.y;
  }
  for (i = 0; i < event.updated.length; i++) {
    mesh = event.updated[i];
    item = mesh.data.item;
    if (item.skipCellCentering) {
      continue;
    }
    pixelCoordinates = this.hexDimensions.getPixelCoordinates(item.u, item.v);
    mesh.position.x = pixelCoordinates.x;
    mesh.position.y = pixelCoordinates.y;
  }
  this.emitEvent("dataChanged", [
    { added: event.added, removed: event.removed, updated: event.updated }
  ]);
};

module.exports.prototype.setScene = function(scene) {
  this.scene = scene;
};
