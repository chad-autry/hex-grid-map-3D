"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module SphereDrawnItemFactory
 */

var babylon = require("babylonjs");
/**
 * A factory to create the Babylon.js mesh with an image textured on it
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

  //TODO Accept relative img tags (programmatic SVG)

  let imageHolder = this.offScreenCanvasMap[item.img];
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
  if (!imageHolder) {
    let img = document.createElement("img");
    img.width = 512;
    img.height = 512;
    img.onload = () => {
      let canvas = document.createElement("canvas");

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
      this.offScreenCanvasMap[item.img] = {
        offscreenContext: offscreenContext
      };
      this.offScreenCanvasMap[
        item.img
      ].pixelArray = offscreenContext.getImageData(0, 0, 512, 512).data;
      myMaterial.diffuseTexture.update(true);
    };
    img.src = item.img;
  } else {
    //TODO Cache a texture along with the context
    let offscreenContext = imageHolder.offscreenContext;
    textureContext.putImageData(
      offscreenContext.getImageData(0, 0, 512, 512),
      0,
      0
    );
  }

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
  if (item.vertical) {
    // Now flip it vertically
    square.rotation.y = -Math.PI / 2;

    // Have it face the camera
    square.billboardMode = babylon.Mesh.BILLBOARDMODE_Z;

    // And have it not be halfway through the grid below
    //square.position.z = diameter/2;
    square.data.height = diameter;
  }

  //Always check for invislbe particles, could do something to skip this check if desired
  square.data.hitTestAlpha = (x, y) => {
    let pixelAlpha = this.offScreenCanvasMap[item.img].pixelArray[
      (Math.floor((1 - y) * 512) * 512 + Math.floor(x * 512)) * 4 + 3
    ];
    return pixelAlpha !== 0;
  };
  square.data.item = item;
  return square;
};
