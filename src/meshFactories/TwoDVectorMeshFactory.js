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
  let vectorPixelCoordinates = this.hexDefinition.getPixelCoordinates(
    item.vectorU,
    item.vectorV
  );

  let magnitude = Math.sqrt(
    vectorPixelCoordinates.x * vectorPixelCoordinates.x +
      vectorPixelCoordinates.y * vectorPixelCoordinates.y
  );
  let height = this.hexDefinition.hexagon_edge_to_edge_width;
  let width = magnitude + item.lineWidth;
  let lineWidthRatio = item.lineWidth / width;
  let square = babylon.MeshBuilder.CreatePlane(
    "plane",
    { width: width, height: height },
    scene
  );

  var myMaterial = new babylon.StandardMaterial("myMaterial", scene);

  if (item.isEmissive) {
    myMaterial.ambientColor = myMaterial.diffuseColor = myMaterial.emissiveColor = new babylon.Color3(
      1,
      1,
      1
    );
  }

  myMaterial.diffuseTexture = myMaterial.emissiveTexture = new babylon.DynamicTexture(
    "dynamic texture",
    { width: width, height: height },
    scene,
    true
  );

  let canvas = document.createElement("canvas");
  var size = myMaterial.diffuseTexture.getSize();
  canvas.width = size.width;
  this.imageDataWidth = size.width;
  this.imageDataHeight = size.height;
  canvas.height = size.height;
  let canvasLineWidth = lineWidthRatio * size.width;
  let offscreenContext = canvas.getContext("2d");
  let textureContext = myMaterial.diffuseTexture.getContext();

  offscreenContext.lineWidth = canvasLineWidth;
  offscreenContext.strokeStyle = item.lineColor;
  offscreenContext.lineCap = "round";

  // Draw the shaft
  offscreenContext.beginPath();
  offscreenContext.moveTo(canvasLineWidth / 2, size.height / 2);
  offscreenContext.lineTo(size.width - canvasLineWidth / 2, size.height / 2);
  offscreenContext.stroke();

  // Draw one side of the head
  offscreenContext.beginPath();
  offscreenContext.moveTo(size.width - canvasLineWidth / 2, size.height / 2);
  offscreenContext.lineTo(
    size.width - size.height / 4,
    size.height / 2 + size.height / 4
  );
  offscreenContext.stroke();

  // Draw the other side of the head
  offscreenContext.beginPath();
  offscreenContext.moveTo(size.width - canvasLineWidth / 2, size.height / 2);
  offscreenContext.lineTo(
    size.width - size.height / 4,
    size.height / 2 - size.height / 4
  );
  offscreenContext.stroke();

  //save pixel array for hit testing
  this.pixelArray = offscreenContext.getImageData(
    0,
    0,
    size.width,
    size.height
  );
  //Copy from offscreen to on
  textureContext.putImageData(this.pixelArray, 0, 0);

  myMaterial.diffuseTexture.update(true);

  myMaterial.emissiveTexture.hasAlpha = true;
  myMaterial.diffuseTexture.hasAlpha = true;

  myMaterial.backFaceCulling = false;

  square.material = myMaterial;

  if (item.angle) {
    square.rotation.z = item.angle;
  }

  //My native co-ordinate system is flipped from babylon.js. Align texture Y to 3d Y
  square.rotation.x = Math.PI;

  let parentMesh = babylon.Mesh.CreateBox("Box1", 0, scene);
  parentMesh.data = {};
  square.position.x = width / 2;

  //Always check for invislbe particles, could do something to skip this check if desired

  parentMesh.data.hitTestAlpha = (x, y) => {
    let pixelAlpha = this.pixelArray[
      (Math.floor((1 - y) * this.imageDataHeight) * this.imageDataHeight +
        Math.floor(x * this.imageDataWidth)) *
        4 +
        3
    ];
    return pixelAlpha !== 0;
  };

  parentMesh.data.item = item;
  parentMesh.visibility = 0;
  square.parent = parentMesh;
  return parentMesh;
};
