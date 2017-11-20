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
  this.offScreenCanvasMap = {};
};

module.exports.prototype.getMesh = function(item, scene) {
  var diameter =
    item.size * this.hexDefinition.hexagon_edge_to_edge_width / 100;

  let square = babylon.MeshBuilder.CreatePlane(
    "plane",
    { size: diameter },
    scene
  );

  var myMaterial = new babylon.StandardMaterial("myMaterial", scene);

  if (item.isEmissive) {
    myMaterial.emissiveColor = new babylon.Color3(1, 1, 1);
  }

  //TODO
  // Implement check when picking to ignore clicks over transparent pixels
  // http://www.html5gamedevs.com/topic/26224-how-do-you-ignore-transparency-when-picking-meshes/

  //TODO Accept relative img tags (programmatic SVG)

  let canvas = this.offScreenCanvasMap[item.img];
  myMaterial.diffuseTexture = myMaterial.emissiveTexture = new babylon.DynamicTexture(
    "dynamic texture",
    512,
    scene,
    true
  );

  let textureContext = myMaterial.diffuseTexture.getContext();

  // Draw a temp texture to be visible if the image doesn't load
  textureContext.fillStyle = "#653700";
  textureContext.fillRect(0, 0, diameter / 2, diameter / 2);
  textureContext.fillRect(diameter / 2, diameter / 2, diameter, diameter);
  textureContext.fillStyle = "#000000";
  textureContext.fillRect(diameter / 2, 0, diameter, diameter / 2);
  textureContext.fillRect(0, diameter / 2, diameter / 2, diameter);
  myMaterial.diffuseTexture.update(true);
  if (!canvas) {
    let img = document.createElement("img");
    img.width = 512;
    img.height = 512;
    img.onload = () => {
      canvas = document.createElement("canvas");

      canvas.width = 512;
      canvas.height = 512;
      let offscreenContext = canvas.getContext("2d");
      offscreenContext.drawImage(
        img,
        0,
        0,
        img.width,
        img.height, // source rectangle
        0,
        0,
        canvas.width,
        canvas.height
      );

      //Copy from offscreen to on
      textureContext.putImageData(
        offscreenContext.getImageData(0, 0, 512, 512),
        0,
        0
      );
      this.offScreenCanvasMap[item.img] = canvas;
      myMaterial.diffuseTexture.update(true);
    };
    img.src = item.img;
  } else {
    //TODO Cache a texture along with the context
    let offscreenContext = canvas.getContext("2d");
    textureContext.putImageData(
      offscreenContext.getImageData(0, 0, 512, 512),
      0,
      0
    );
  }

  myMaterial.emissiveTexture.hasAlpha = true;
  myMaterial.diffuseTexture.hasAlpha = true;
  myMaterial.backFaceCulling = false;

  //My native co-ordinate system is rotated from Babylon.js
  square.rotation.x = Math.PI;
  square.material = myMaterial;

  if (item.angle) {
    square.rotation.z = item.angle;
  }

  square.data = {};
  square.data.item = item;
  return square;
};
