"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module SphereDrawnItemFactory
 */

var babylon = require("babylonjs");
/**
 * A factory to create the paper.js item for Sphere
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function ImageMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
};

module.exports.prototype.getMesh = function(item, scene) {
  var diameter =
    item.size * this.hexDefinition.hexagon_edge_to_edge_width / 100;

  let square = babylon.MeshBuilder.CreatePlane(
    "plane",
    { size: diameter },
    scene
  );

  //square.rotation.z = Math.PI / 4;
  var myMaterial = new babylon.StandardMaterial("myMaterial", scene);

  myMaterial.diffuseTexture = myMaterial.emissiveTexture = new babylon.Texture(
    item.img,
    scene
  );

  //TODO Always draw img to an offscreen canvas
  // Implement check when picking to ignore clicks over transparent pixels
  // http://www.html5gamedevs.com/topic/26224-how-do-you-ignore-transparency-when-picking-meshes/

  //TODO Accept relative img tags (programmatic SVG)

  myMaterial.emissiveTexture.hasAlpha = true;
  myMaterial.diffuseTexture.hasAlpha = true;
  myMaterial.backFaceCulling = false;

  //My native co-ordinate system is rotated from Babylon.js
  square.rotation.x = Math.PI;
  square.material = myMaterial;

  square.data = {};
  square.data.item = item;
  return square;
};
