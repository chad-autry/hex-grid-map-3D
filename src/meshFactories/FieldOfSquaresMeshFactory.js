"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module FieldOfSquaresDrawnItemFactory
 */

var babylon = require("babylonjs");

/**
 * Factory which creates a field of squares with some randomness. Ie not patterned. Intended for asteroids or debris fields.
 * Produces 4 squares per hex. Default orientation is point up and point down. Squares are skewed per the perspective
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 * @param {integer} minSize - The minimum size of the squares
 * @param {integer} maxSize - The maximum size of the squares
 * @param {colors} colors - An array of color strings the squares can be
 */
module.exports = function FieldOfSquaresMeshFactory(
  hexDefinition,
  minSize,
  maxSize,
  colors
) {
  this.hexDefinition = hexDefinition;
  this.minSize = minSize;
  this.maxSize = maxSize;
  this.colors = colors;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Return a group of items representing the field
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {onClick=} item.onClick - The callback to use when this item is clicked
 * @returns {external:Item} The paper.js Group for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 * @todo Make the random numbers seeded, so the same field is produced each time
 */
module.exports.prototype.getMesh = function(item, scene) {
  //Make our group

  //Create 4 random cubes, each located in 1 quarter of the hex

  //Start with the top left quarter
  var cube1 = this.createSquare(
    -1 * this.hexDefinition.hexagon_edge_to_edge_width / 2,
    0,
    -1 * this.hexDefinition.hexagon_half_wide_width,
    0,
    scene
  );
  //Next the top right quarter
  var cube2 = this.createSquare(
    0,
    this.hexDefinition.hexagon_edge_to_edge_width / 2,
    -1 * this.hexDefinition.hexagon_half_wide_width,
    0,
    scene
  );
  //Next bottom right quarter
  var cube3 = this.createSquare(
    0,
    this.hexDefinition.hexagon_edge_to_edge_width / 2,
    0,
    this.hexDefinition.hexagon_half_wide_width,
    scene
  );
  //Finally bottom left quarter
  var cube4 = this.createSquare(
    -1 * this.hexDefinition.hexagon_edge_to_edge_width / 2,
    0,
    0,
    this.hexDefinition.hexagon_half_wide_width,
    scene
  );

  let parentMesh = babylon.Mesh.CreateBox("Box1", 0, scene);
  parentMesh.data = {};
  parentMesh.data.item = item;
  parentMesh.visibility = 0;
  cube1.parent = cube2.parent = cube3.parent = cube4.parent = parentMesh;

  return parentMesh;
};

/**
 * Produces a square within the given quarter of the Hex
 * @param {integer} minX - The minimum X coordinate to randomise the square's center
 * @param {integer} maxX - The maximum X coordinate to randomise the square's center
 * @param {integer} minY - The minimum Y coordinate to randomise the square's center
 * @param {integer} maxY - The maximum Y coordinate to randomise the square's center
 * @returns {external:Item} The square to include in the group
 */
module.exports.prototype.createSquare = function(
  minX,
  maxX,
  minY,
  maxY,
  scene
) {
  var x = this.random(minX, maxX);
  var y = this.random(minY, maxY);
  var hexCoords = this.hexDefinition.getReferencePoint(x, y);

  //The randomised co-ordinates have to be within the hex itself
  //TODO There are faster ways to do this.
  while (hexCoords.u !== 0 || hexCoords.v !== 0) {
    x = this.random(minX, maxX);
    y = this.random(minY, maxY);
    hexCoords = this.hexDefinition.getReferencePoint(x, y);
  }

  //Pick a random shade
  var color = this.colors[this.random(0, this.colors.length - 1)];

  //Pick a random size within limits
  var size = this.random(this.minSize, this.maxSize);

  var box = babylon.Mesh.CreateBox("Box1", size, scene);
  //Rotate randomly
  box.rotation.x = Math.random() * Math.PI / 2;
  box.rotation.y = Math.random() * Math.PI / 2;
  box.rotation.z = Math.random() * Math.PI / 2;
  box.position.x = x;
  box.position.y = y;
  var material = new babylon.StandardMaterial("textureX", scene);
  var rgb = this.hexToRgb(color);
  material.diffuseColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  //material.specularColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  //material.emissiveColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  box.material = material;

  return box;
};

/**
 * Helper method for generating a random number
 * @param {integer} min - The minimum number to generate
 * @param {integer} max - The maximum number to generate
 */
module.exports.prototype.random = function(min, max) {
  return Math.round(Math.random() * (max - min) + min);
};
