"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module InverseGridContext
 */

var babylon = require("babylonjs");
var hexToRgb = require("../HexToRGB.js");
/**
 * This context (item factory + manager) creates a visible grid for the board.
 * This particular grid is composed of semi-transparent hexagons.
 * Instead of inifinitely tiling the plain, only a finite number are shown that fade in and out as the view moves
 * @constructor
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function StarryContext(hexDimensions, board, density) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof StarryContext)) {
    return new StarryContext(hexDimensions, board, density);
  }
  var context = this;
  context.hexDimensions = hexDimensions;
  this.board = board;
  this.scene = board.scene;
  this.outerRadius = board.camera.maxZ - 50;
  this.starColors = ["#ffffff", "#ffe9c4", "#d4fbff"];
  var myPositionFunction = particle => {
    // TODO Poisson distribution, && seeds to re-generate same view
    let u = Math.random();
    let v = Math.random();
    let longitude = 2 * Math.PI * u;
    let colatitude = Math.acos(v - 1); //We only want the lower latitudes
    particle.position.x =
      this.outerRadius * Math.sin(colatitude) * Math.cos(longitude);
    particle.position.y =
      this.outerRadius * Math.sin(colatitude) * Math.sin(longitude);
    particle.position.z = this.outerRadius * Math.cos(colatitude);
    let color = hexToRgb(
      this.starColors[Math.round(Math.random() * (2 - 0) + 0)]
    );

    // This per partile color will be blended with the white emissive color
    particle.color = new babylon.Color3(
      color.r / 256,
      color.g / 256,
      color.b / 256
    );

    // This scale works well for the default max draw distance
    let scale = Math.random() * 0.2 + 0.2;
    particle.scaling = new babylon.Vector3(scale, scale, scale);
  };

  // This size works well for the default max draw distance
  var hexagon = babylon.Mesh.CreateSphere("t", 16, 100, this.scene);

  // SPS creation : Immutable {updatable: false}
  var SPS = new babylon.SolidParticleSystem("SPS", this.scene, {
    updatable: true,
    pickable: false
  });
  SPS.addShape(hexagon, density, { positionFunction: myPositionFunction });
  SPS.billboard = true;
  var mesh = SPS.buildMesh();
  let material = new babylon.StandardMaterial("texture1", this.scene);
  material.emissiveColor = new babylon.Color3(1, 1, 1);
  mesh.material = material;
  //SPS.setParticles();
  this.mesh = mesh;
  hexagon.dispose();
  // hard code position to the known camera start position
  this.mesh.position.y = 1000;
  this.mesh.position.z = 1000;
  this.board.addListener("camera", e => {
    this.mesh.position.x = e.cameraX;
    this.mesh.position.y = e.cameraY;
    this.mesh.position.z = e.cameraZ;
  });
};
