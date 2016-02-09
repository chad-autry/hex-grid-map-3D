"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module InverseGridContext
 */

var babylon = require('babylonjs');
/**
 * This is the context object for creating and managing the grid layer of a board
 * @implements {Context}
 * @constructor
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function InverseGridContext(hexDimensions) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof InverseGridContext)) {
        return new InverseGridContext();
    }
    var context = this;
    context.hexDimensions = hexDimensions;

    // Documentation inherited from Context#init
    this.init = function(scene) {
        context.gridColor = 'silver';
        context.scene = scene;
        //Create the Hex item
      
 var positionArray = createPositionArray(hexDimensions);
///////////////////


var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

var rgb = hexToRgb('#15b01a');


  var nb = positionArray.length;    		// nb of triangles
  var fact = 100; 			// cube size
 // custom position function for SPS creation
 var myPositionFunction = function(particle, i, s) {
      particle.position.x = positionArray[i].x;//(Math.random() - 0.5) * fact;
      particle.position.y = positionArray[i].y;//(Math.random() - 0.5) * fact;
      particle.position.z = 0;//(Math.random() - 0.5) * fact;
      //particle.rotation.x = Math.random() * 3.15;
      //particle.rotation.y = Math.random() * 3.15;
      particle.rotation.z = Math.PI/2;
      particle.color = new babylon.Color4(.5, .5, .5, 0.5);
  };
 
   // model : triangle
   var triangle = babylon.MeshBuilder.CreateDisc("t", {radius: hexDimensions.hexagon_half_wide_width - 2, tessellation: 6, sideOrientation: babylon.Mesh.DOUBLESIDE}, scene);
  
  // SPS creation : Immutable {updatable: false}
  var SPS = new babylon.SolidParticleSystem('SPS', scene, {updatable: false, pickable: false});
  SPS.addShape(triangle, nb, {positionFunction: myPositionFunction});
  var mesh = SPS.buildMesh();
  mesh.hasVertexAlpha = true;
  //var mat = new babylon.StandardMaterial("grid", scene);
  //mat.alpha = 0.5;
  //mesh.material = mat;
  //mat.emissiveColor = new babylon.Color3(rgb.r/256, rgb.g/256, rgb.b/256);
  triangle.rotation.z = Math.PI/2;
  triangle.color = new babylon.Color4(rgb.r/256, rgb.g/256, rgb.b/256, 0.5);
  this.gridParent = mesh;
  triangle.dispose();
        
    };

    // Documentation inherited from Context#updatePosition
    this.updatePosition = function(middleX, middleY) {

         
         //Convert the middle point to U, V
         var hexCoordinates = this.hexDimensions.getReferencePoint(middleX, middleY);
         
         //Find the center of the hex in cartesian co-ordinates
         var centerHexPixelCoordinates = this.hexDimensions.getPixelCoordinates(hexCoordinates.u, hexCoordinates.v);
         
         //Center our grid there
         context.gridParent.position.x = centerHexPixelCoordinates.x;
         context.gridParent.position.y = centerHexPixelCoordinates.y;
         
         

    };
    
    this.reDraw = function(screenResized, mapRotated, mapScaled) {
    };
};


/**
 * Creates a full grid from the single mesh
 * @private
 */
var createPositionArray = function(hexDimensions) {
    var positionArray = [];
    var zeroZeroPixelCoordinates = hexDimensions.getPixelCoordinates(0, 0);
    var newInstance, pixelCoordinates;

    //For every hex, place an instance of the original mesh. The symbol fills in 3 of the 6 lines, the other 3 being shared with an adjacent hex

    //Make a hexagonal grid of hexagons since it is approximately circular.
    //The radius should be a bit larger than our max viewing distance
    var u = 0;
    var v = 0;
    //For each radius
    positionArray.push( {y:0, x:0});
    for (var i = 1; i < 31; i++) {
       
       //Hold u constant as the radius, add an instance for each v
       for (v = -i; v <= 0 ; v++) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(i, v);

	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
       
       //Hold u constant as negative the radius, add an instance for each v
       for (v = 0; v <= i ; v++) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(-i, v);
	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
       
       //Hold v constant as the radius, add an instance for each u
       for (u = -i + 1 ; u <= 0 ; u++) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(u, i);
	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
       
       //Hold v constant as negative the radius, add an instance for each u
       for (u = 0; u < i ; u++) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(u, -i);
	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
       
       //Hold w constant as the radius, add an instance for each u + v = -i
       for (u = -i + 1, v = -1 ; v > -i ; u++, v--) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
       
       //Hold w constant as the negative radius, add an instance for each u + v = i
       for (u = i - 1, v = 1 ; v < i ; u--, v++) {
           pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
	   positionArray.push( {y:pixelCoordinates.y, x:pixelCoordinates.x});
       }
    }

    return positionArray;
};


// Documentation inherited from Context#mouseDown
module.exports.prototype.mouseDown = function( x, y) {
    //This is nothing to click, always return false
    return false;
};

// Documentation inherited from Context#mouseDragged
module.exports.prototype.mouseDragged = function( x, y, dx, dy) {
    //We never claim mouseDown, so this actually will never be called
};

// Documentation inherited from Context#mouseReleased
module.exports.prototype.mouseReleased = function(wasDrag) {
    //We never claim mouseDown, so this actually will never be called
};