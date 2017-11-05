"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module PathDrawnItemFactory
 */

var babylon = require("babylonjs");

/**
 * A factory for a path item, such as might represent where a ship has been, or various boundaries
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function PathMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Return a solid tubular path item for the given DTO. The path will go through the center of hexes
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.color - The color of the path
 * @param {integer[][]} item.points - An array of U, V points the path goes through
 * @param {integer} item.width - The width of the path's line
 * @param {onClick=} item.onClick - The callback to use when clicking the vector
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getMesh = function(item, scene) {
  var points = [];
  //Convert the item's array of u, v points into x, y
  for (var i = 0; i < item.points.length; i++) {
    var pixelCoordinates = this.hexDefinition.getPixelCoordinates(
      item.points[i][0],
      item.points[i][1]
    );
    points.push(new babylon.Vector3(pixelCoordinates.x, pixelCoordinates.y, 0));
  }

  var items = [];
  var lastPoint;
  var joint = babylon.Mesh.CreateSphere("sphere", 20, item.width, scene);
  joint.position.x = points[0].x;
  joint.position.y = points[0].y;
  items.push(joint);
  points.forEach(function(point) {
    if (!lastPoint) {
      lastPoint = point;
      return; //like a continue for a forEach
    }
    //A tube for the segment
    items.push(
      babylon.Mesh.CreateTube(
        "tube",
        [lastPoint, point],
        item.width / 2,
        20,
        null,
        0,
        scene
      )
    );
    //And a sphere for the joint
    joint = babylon.Mesh.CreateSphere("sphere", 20, item.width, scene);
    joint.position.x = point.x;
    joint.position.y = point.y;
    items.push(joint);
    lastPoint = point;
  });

  if (item.closed) {
    //A tube for the segment
    items.push(
      babylon.Mesh.CreateTube(
        "tube",
        [points[0], points[points.length - 1]],
        item.width / 2,
        20,
        null,
        0,
        scene
      )
    );
  }

  var compoundMesh = babylon.Mesh.MergeMeshes(items);

  var material = new babylon.StandardMaterial("pathMaterial", scene);
  var rgb = this.hexToRgb(item.color);
  material.diffuseColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  material.specularColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  material.emissiveColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  compoundMesh.material = material;
  compoundMesh.data = { item: item };

  return compoundMesh;
};
