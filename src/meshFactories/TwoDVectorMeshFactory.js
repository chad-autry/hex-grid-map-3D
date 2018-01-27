"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module SphereDrawnItemFactory
 */

var babylon = require("babylonjs");
/**
 * A factory to create a Babylon.js mesh with a 2D vector drawn on it
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function TwoDVectorMeshFactory(hexDefinition) {
  this.hexDefinition = hexDefinition;
  this.offScreenCanvasMap = {};
};

module.exports.prototype.getMesh = function(item, scene) {
  let vectorPixelCoordinates = this.hexDefinition.getPixelCoordinates(item.vectorU, item.vectorV);

  let magnitude = Math.sqrt(vectorPixelCoordinates.x*vectorPixelCoordinates.x + vectorPixelCoordinates.y*vectorPixelCoordinates.y);
  let height = this.hexDefinition.hexagon_edge_to_edge_width + item.lineWidth;

  let square = babylon.MeshBuilder.CreatePlane(
    "plane",
    { width: magnitude + item.lineWidth, height: height },
    scene
  );


  var myMaterial = new babylon.StandardMaterial("myMaterial", scene);

  if (item.isEmissive) {
    myMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
  }

  myMaterial.diffuseTexture = myMaterial.emissiveTexture = new babylon.DynamicTexture(
    "dynamic texture",
    { width: magnitude + item.lineWidth, height: height },
    scene,
    true
  );
  
  let context = myMaterial.diffuseTexture.getContext();


  context.lineWidth = item.lineWidth;
  context.strokeStyle = item.lineColor;
  context.lineCap = "round";

  // Draw the shaft
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(magnitude, height / 2);
  context.stroke();

  // Draw one side of the head
  context.beginPath();
  context.moveTo(magnitude, height / 2);
  context.lineTo(magnitude - this.hexDefinition.hexagon_edge_to_edge_width/4, height / 2 + this.hexDefinition.hexagon_edge_to_edge_width/4);
  context.stroke();

  // Draw the other side of the head
  context.beginPath();
  context.moveTo(magnitude, height / 2);
  context.lineTo(magnitude - this.hexDefinition.hexagon_edge_to_edge_width/4, height / 2 - this.hexDefinition.hexagon_edge_to_edge_width/4);
  context.stroke();
  
  myMaterial.diffuseTexture.update(true);


  myMaterial.emissiveTexture.hasAlpha = true;
  myMaterial.diffuseTexture.hasAlpha = true;
  myMaterial.backFaceCulling = false;


  square.material = myMaterial;

  if (item.angle) {
    square.rotation.z = item.angle;
  }
  
  square.data = {};
    
  //My native co-ordinate system is flipped from babylon.js. Align texture Y to 3d Y
  square.rotation.x = Math.PI;

  //Always check for invislbe particles, could do something to skip this check if desired
  /*
  square.data.hitTestAlpha = (x, y) => {
    let pixelAlpha = this.offScreenCanvasMap[item.img].pixelArray[
      (Math.floor((1 - y) * 512) * 512 + Math.floor(x * 512)) * 4 + 3
    ];
    return pixelAlpha !== 0;
  };
  */
  square.data.item = item;
  return square;
};
