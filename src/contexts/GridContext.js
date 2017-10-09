"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module GridContext
 */

var babylon = require("babylonjs");
/**
 * This is the context object for creating and managing the grid layer of a board
 * @implements {Context}
 * @constructor
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function GridContext(hexDimensions) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof GridContext)) {
    return new GridContext();
  }
  var context = this;
  context.hexDimensions = hexDimensions;

  // Documentation inherited from Context#init
  this.init = function(scene) {
    context.gridColor = "silver";
    context.scene = scene;
    //Create the Hex item
    context.gridParent = context.createPartialMesh(scene);
    //create the full grid
    context.createGrid(context.gridParent);
  };

  // Documentation inherited from Context#updatePosition
  this.updatePosition = function(middleX, middleY) {
    //Convert the middle point to U, V
    var hexCoordinates = this.hexDimensions.getReferencePoint(middleX, middleY);

    //Find the center of the hex in cartesian co-ordinates
    var centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(
      hexCoordinates.u,
      hexCoordinates.v
    );

    //Center our grid there
    context.gridParent.position.x = centerHexPixelCoordinates.x;
    context.gridParent.position.y = centerHexPixelCoordinates.y;
  };

  this.reDraw = function() {};
};

/**
 * Creates a mesh for a partial hex which can be copied to form the full grid
 * @private
 */
module.exports.prototype.createPartialMesh = function(scene) {
  //Create tubes for 3 sides of a hex

  var zeroZeroPixelCoordinates = this.hexDimensions.getPixelCoordinates(0, 0);
  //The first point of each line is the lower "junction" point of the point up hexagon

  //Draw the vertical line first
  var vertical = babylon.Mesh.CreateTube(
    "vertical",
    [
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x,
        zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
        0
      ),
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x,
        zeroZeroPixelCoordinates.y +
          this.hexDimensions.hexagon_half_wide_width +
          2 * this.hexDimensions.hexagon_scaled_half_edge_size,
        0
      )
    ],
    2,
    20,
    null,
    0,
    scene
  );

  //Next the bottom right line
  var bottomRight = babylon.Mesh.CreateTube(
    "bottomRight",
    [
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x,
        zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
        0
      ),
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x +
          this.hexDimensions.hexagon_edge_to_edge_width / 2,
        zeroZeroPixelCoordinates.y +
          this.hexDimensions.hexagon_scaled_half_edge_size,
        0
      )
    ],
    2,
    20,
    null,
    0,
    scene
  );

  //Next the bottom left
  var bottomLeft = babylon.Mesh.CreateTube(
    "bottomLeft",
    [
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x,
        zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width,
        0
      ),
      new babylon.Vector3(
        zeroZeroPixelCoordinates.x -
          this.hexDimensions.hexagon_edge_to_edge_width / 2,
        zeroZeroPixelCoordinates.y +
          this.hexDimensions.hexagon_scaled_half_edge_size,
        0
      )
    ],
    2,
    20,
    null,
    0,
    scene
  );

  return babylon.Mesh.MergeMeshes([vertical, bottomRight, bottomLeft]);
};

/**
 * Creates a full grid from the single mesh
 * @private
 */
module.exports.prototype.createGrid = function(originalMesh) {
  var newInstance, pixelCoordinates;

  //For every hex, place an instance of the original mesh. The symbol fills in 3 of the 6 lines, the other 3 being shared with an adjacent hex

  //Make a hexagonal grid of hexagons since it is approximately circular.
  //The radius should be a bit larger than our max viewing distance
  var u = 0;
  var v = 0;
  //For each radius
  for (var i = 1; i < 50; i++) {
    //Hold u constant as the radius, add an instance for each v
    for (v = -i; v <= 0; v++) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(i, v);
      newInstance = originalMesh.createInstance("index: " + i + ":" + v);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }

    //Hold u constant as negative the radius, add an instance for each v
    for (v = 0; v <= i; v++) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(-i, v);
      newInstance = originalMesh.createInstance("index: " + -i + ":" + v);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }

    //Hold v constant as the radius, add an instance for each u
    for (u = -i + 1; u <= 0; u++) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, i);
      newInstance = originalMesh.createInstance("index: " + u + ":" + i);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }

    //Hold v constant as negative the radius, add an instance for each u
    for (u = 0; u < i; u++) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, -i);
      newInstance = originalMesh.createInstance("index: " + u + ":" + -i);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }

    //Hold w constant as the radius, add an instance for each u + v = -i
    for (u = -i + 1, v = -1; v > -i; u++, v--) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
      newInstance = originalMesh.createInstance("index: " + u + ":" + v);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }

    //Hold w constant as the negative radius, add an instance for each u + v = i
    for (u = i - 1, v = 1; v < i; u--, v++) {
      pixelCoordinates = this.hexDimensions.getPixelCoordinates(u, v);
      newInstance = originalMesh.createInstance("index: " + u + ":" + v);
      newInstance.parent = originalMesh;
      newInstance.position.y = pixelCoordinates.y;
      newInstance.position.x = pixelCoordinates.x;
    }
  }

  /*
    //Top left hex is 0,0
    var bottomRight = this.hexDimensions.getReferencePoint( 1024, 768);
    var topRight = this.hexDimensions.getReferencePoint(1024, 0);
    //Note: The (-3) and (+1) values are to give extra slack on the top and bottom for dragging, don't want to see an incomplete grid appear.
    for (var i =  -3; i <= bottomRight.u + 1; i++) {
        //Note: The (-2) and (+2) values are to give extra slack on the left and right for dragging, don't want to see an incomplete grid appear.
        for (var j =  -Math.abs(Math.round(i/2)) - 2; j <= topRight.v - Math.ceil(i/2) + 2; j++) {
            var pixelCoordinates = this.hexDimensions.getPixelCoordinates(i, j);
            var newInstance = originalMesh.createInstance("index: " + i +":" + j);
            newInstance.position.y = pixelCoordinates.y;
            newInstance.position.x = pixelCoordinates.x;
        }
    }
    */
};

// Documentation inherited from Context#mouseDown
module.exports.prototype.mouseDown = function() {
  //This is nothing to click, always return false
  return false;
};

// Documentation inherited from Context#mouseDragged
module.exports.prototype.mouseDragged = function() {
  //We never claim mouseDown, so this actually will never be called
};

// Documentation inherited from Context#mouseReleased
module.exports.prototype.mouseReleased = function() {
  //We never claim mouseDown, so this actually will never be called
};
