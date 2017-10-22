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
module.exports = function InverseGridContext(
  hexDimensions,
  board,
  color,
  radius,
  fadeRadius,
  baseAlpha
) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof InverseGridContext)) {
    return new InverseGridContext(
      hexDimensions,
      board,
      color,
      radius,
      fadeRadius,
      baseAlpha
    );
  }
  var context = this;
  context.hexDimensions = hexDimensions;
  this.board = board;
  this.scene = board.scene;
  this.color = hexToRgb(color);
  this.middleX = 0;
  this.middleY = 0;
  this.radius = radius;
  this.fadeRadius = fadeRadius;
  this.baseAlpha = baseAlpha;
  let positionArray = createPositionArray(hexDimensions, radius + fadeRadius);

  var nb = positionArray.length; // nb of hexagons
  // custom position function for SPS creation
  var myPositionFunction = (particle, i) => {
    particle.position.x = positionArray[i].x;
    particle.position.y = positionArray[i].y;
    particle.position.z = 0;
    particle.rotation.z = Math.PI / 2;
  };

  var hexagon = babylon.MeshBuilder.CreateDisc(
    "t",
    {
      radius: hexDimensions.hexagon_half_wide_width - 2,
      tessellation: 6,
      sideOrientation: babylon.Mesh.DOUBLESIDE
    },
    this.scene
  );

  // SPS creation : Immutable {updatable: false}
  var SPS = new babylon.SolidParticleSystem("SPS", this.scene, {
    updatable: true,
    pickable: false
  });
  SPS.addShape(hexagon, nb);

  SPS.initParticles = function() {
    for (var p = 0; p < SPS.nbParticles; p++) {
      myPositionFunction(SPS.particles[p], p);
      SPS.particles[p].rotation.z = Math.PI / 2;
    }
  };
  SPS.updateParticle = particle => {
    let distanceFromViewPoint = Math.sqrt(
      Math.pow(particle.position.x - this.middleX, 2) +
        Math.pow(particle.position.y - this.middleY, 2)
    );
    let alpha = this.baseAlpha;
    if (
      distanceFromViewPoint >
        this.radius * this.hexDimensions.hexagon_narrow_width &&
      distanceFromViewPoint <
        (this.radius + this.fadeRadius) *
          this.hexDimensions.hexagon_narrow_width
    ) {
      //Linearlly scale from baseAlpha --> 0 y = mx + b   (x is distanceFromViewPoint - rad*hnw, b = baseAlpha)
      // m = -b/(fadeRadius+radius-radius)
      alpha =
        -this.baseAlpha /
          (this.fadeRadius * this.hexDimensions.hexagon_narrow_width) *
          (distanceFromViewPoint -
            this.radius * this.hexDimensions.hexagon_narrow_width) +
        this.baseAlpha;
    } else if (
      distanceFromViewPoint >=
      (this.radius + this.fadeRadius) * this.hexDimensions.hexagon_narrow_width
    ) {
      alpha = 0;
    }
    particle.color = new babylon.Color4(
      this.color.r / 256,
      this.color.g / 256,
      this.color.b / 256,
      alpha
    );
  };
  var mesh = SPS.buildMesh();
  mesh.hasVertexAlpha = true;
  SPS.initParticles();
  SPS.setParticles();
  this.gridParent = mesh;
  let material = new babylon.StandardMaterial("texture1", this.scene);
  material.emissiveColor = new babylon.Color3(1, 1, 1);
  mesh.material = material;
  hexagon.dispose();
  this.board.addListener("pan", e => {
    //Convert the middle point to U, V
    var hexCoordinates = this.hexDimensions.getReferencePoint(
      e.middleX,
      e.middleY
    );

    //Find the center of the hex in cartesian co-ordinates
    var centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(
      hexCoordinates.u,
      hexCoordinates.v
    );

    //Center our grid there
    context.gridParent.position.x = centerHexPixelCoordinates.x;
    context.gridParent.position.y = centerHexPixelCoordinates.y;

    //Put the relative middleX and middleY onto the board for figuring transparency
    this.middleX = e.middleX - centerHexPixelCoordinates.x;
    this.middleY = e.middleY - centerHexPixelCoordinates.y;
    SPS.setParticles();
  });
};

/**
 * Creates a full grid from the single mesh
 * @private
 */
var createPositionArray = function(hexDimensions, radius) {
  var positionArray = [];
  var pixelCoordinates;

  //For every hex, place an instance of the original mesh. The symbol fills in 3 of the 6 lines, the other 3 being shared with an adjacent hex

  //Make a hexagonal grid of hexagons since it is approximately circular.
  var u = 0;
  var v = 0;
  //For each radius
  positionArray.push({ y: 0, x: 0 });
  for (var i = 1; i < radius + 1; i++) {
    //Hold u constant as the radius, add an instance for each v
    for (v = -i; v <= 0; v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(i, v);

      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold u constant as negative the radius, add an instance for each v
    for (v = 0; v <= i; v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(-i, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold v constant as the radius, add an instance for each u
    for (u = -i + 1; u <= 0; u++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, i);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold v constant as negative the radius, add an instance for each u
    for (u = 0; u < i; u++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, -i);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold w constant as the radius, add an instance for each u + v = -i
    for (u = -i + 1, v = -1; v > -i; u++, v--) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }

    //Hold w constant as the negative radius, add an instance for each u + v = i
    for (u = i - 1, v = 1; v < i; u--, v++) {
      pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
      positionArray.push({ y: pixelCoordinates.y, x: pixelCoordinates.x });
    }
  }

  return positionArray;
};
