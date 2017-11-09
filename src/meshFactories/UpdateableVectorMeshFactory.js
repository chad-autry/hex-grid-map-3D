"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module VectorDrawnItemFactory
 */

var babylon = require("babylonjs");

/**
 * A factory to create the paper.js items for vectors
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function UpdateableVectorMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Returns a vector drawn item for the given object
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.color - The color of the vector
 * @param {number} item.sourceU - The U coordinate of the vector source
 * @param {number} item.sourceV - The V coordinate of the vector source
 * @param {number} item.destU - The U coordinate of the vector destination
 * @param {number} item.destV - The V coordinate of the vector destination
 * @param {number} item.shaftWidth - The thickness of the vector
 * @param {string} item.id - The id to use for removals
 * @param {onDrag=} item.onDrag - The callback to use when dragging the vector
 * @param {onClick=} item.onClick - The callback to use when clicking the vector
 * @returns {external:Item} The paper.js Item representing the vector
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getMesh = function(item, scene) {
  //Get the x, y for the vector
  var sourcePixelCoordinates = this.hexDefinition.getPixelCoordinates(
    item.sourceU,
    item.sourceV
  );
  var destPixelCoordinates = this.hexDefinition.getPixelCoordinates(
    item.destU,
    item.destV
  );
  var normalizedPixelCoordinates = {
    x: destPixelCoordinates.x - sourcePixelCoordinates.x,
    y: destPixelCoordinates.y - sourcePixelCoordinates.y
  };

  //Get the magnitude of the normalized vector
  var magnitude = Math.sqrt(
    normalizedPixelCoordinates.x * normalizedPixelCoordinates.x +
      normalizedPixelCoordinates.y * normalizedPixelCoordinates.y
  );
  //Get the angle (clockwise in degrees) of the vector
  var angle =
    Math.acos(
      normalizedPixelCoordinates.x /
        Math.sqrt(
          normalizedPixelCoordinates.x * normalizedPixelCoordinates.x +
            normalizedPixelCoordinates.y * normalizedPixelCoordinates.y
        )
    ) *
    180 /
    Math.PI;
  if (normalizedPixelCoordinates.y < 0) {
    angle = -angle;
  }

  //Cap the vector
  var joint = babylon.Mesh.CreateSphere("sphere", 20, item.shaftWidth, scene);

  //Draw it pointing straight on y = 0
  var vector = babylon.Mesh.CreateTube(
    "tube",
    [
      new babylon.Vector3(0, 0, 0),
      new babylon.Vector3(magnitude - item.shaftWidth, 0, 0),
      new babylon.Vector3(magnitude - item.shaftWidth, 0, 0),
      new babylon.Vector3(magnitude, 0, 0)
    ],
    null,
    20,
    function(i) {
      if (i === 0 || i === 1) {
        return item.shaftWidth / 2;
      } else if (i === 2) {
        return item.shaftWidth * 1.5;
      } else {
        return 0;
      }
    },
    0,
    scene
  );

  //merge the cap and vector
  var compoundMesh = babylon.Mesh.MergeMeshes([joint, vector]);

  //color it
  var rgb = this.hexToRgb(item.color);
  var material = new babylon.StandardMaterial("vectorMaterial", scene);
  material.diffuseColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  //material.specularColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  //material.emissiveColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  compoundMesh.material = material;

  compoundMesh.data = {};
  //Will be used to test if the click was near enough to the head
  compoundMesh.data.isDrag = function() {
    return true;
  };

  compoundMesh.rotation.z = angle;
  compoundMesh.data.sourcePixelCoordinates = sourcePixelCoordinates;
  compoundMesh.data.lastRotation = angle;
  if (item.onDrag) {
    compoundMesh.data.onDrag = function(x, y, eventDx, eventDy) {
      var normalizedPixelCoordinates = {
        x: x - this.sourcePixelCoordinates.x,
        y: y - this.sourcePixelCoordinates.y
      };
      //Get the angle (clockwise in degrees) of the vector
      var angle =
        Math.acos(
          normalizedPixelCoordinates.x /
            Math.sqrt(
              normalizedPixelCoordinates.x * normalizedPixelCoordinates.x +
                normalizedPixelCoordinates.y * normalizedPixelCoordinates.y
            )
        ) *
        180 /
        Math.PI;
      if (normalizedPixelCoordinates.y < 0) {
        angle = -angle;
      }

      compoundMesh.rotation.z = angle;
      this.lastRotation = angle;
      compoundMesh.data.item.onDrag(x, y, eventDx, eventDy);
    };
  }

  compoundMesh.data.item = item;

  return compoundMesh;
};
