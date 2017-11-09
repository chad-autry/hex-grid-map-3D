"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module RegularPolygonDrawnItemFactory
 */

var babylon = require("babylonjs");

/**
 * Factory which delegates to the paper.js RegularPoloygon constructor
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 * @see {@link http://paperjs.org/reference/path/#path-regularpolygon-object | RegularPolygon }
 */
module.exports = function RegularPolygonMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
  this.internalId = 0;
};

module.exports.prototype.hexToRgb = require("../HexToRGB.js");

/**
 * Return an arrow path item for the given object
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.lineColor - The color of the arrow's border
 * @param {Color} item.fillColor - The color to fill this item with
 * @param {integer} item.radius - The radius of the item
 * @param {number} item.sides - The number of sides of the item
 * @param {onClick=} item.onClick - The callback to use when this item is clicked
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 * @todo consider using symbols for performance
 */
module.exports.prototype.getMesh = function(item, scene) {
  //var cap = babylon.MeshBuilder.CreateDisc(item.id, {diameter: item.diameter - item.thickness, tessellation: item.sides,height:thickness, sideOrientation: babylon.Mesh.DOUBLESIDE}, scene);
  var cylinder = babylon.MeshBuilder.CreateCylinder(
    item.id,
    {
      diameterTop: item.diameter - item.thickness,
      diameterBottom: item.diameter,
      tessellation: item.sides,
      height: item.thickness,
      sideOrientation: babylon.Mesh.DOUBLESIDE
    },
    scene
  );
  var material = new babylon.StandardMaterial(
    "textureX" + this.internalId,
    scene
  );
  var rgb = this.hexToRgb(item.color);
  material.diffuseColor = new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  material.ambientColor = material.diffuseColor;
  cylinder.material = material;

  this.internalId++;
  cylinder.data = {};
  cylinder.data.item = item;
  cylinder.rotation.y = -Math.PI / 2;
  cylinder.rotation.z = -Math.PI / 2;
  return cylinder;
  /*
       var radius = item.radius * this.hexDefinition.hexagon_edge_to_edge_width/200; //Draw it a bit big, we'll trim it into a circle
       var sphere = babylon.Mesh.CreateSphere(item.id, 16, item.radius, scene);
       var material = new babylon.StandardMaterial("textureX", scene);
       material.emissiveColor = new babylon.Color3(1, 0, 0);
       sphere.material = material;
       sphere.data = {};
       sphere.data.item = item;
    return sphere;
    */
};
