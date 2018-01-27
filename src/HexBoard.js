"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module hexagonal-map
 */

var babylon = require("babylonjs");
var hexToRgb = require("./HexToRGB.js");

/**
 * Initializes the Babylon.js scene, delegates mouse control, provides an API to control the camera relative to the X/Y plane
 * @constructor
 * @param { external:cartesian-hexagonal } hexDimension - The DTO defining the hex <--> cartesian relation
 * @param canvas - The canvas element to initialize babylon.js with
 * @param backgroundColor - the color to set the Babylon.js background
 * @example var hexMap = new (require(hexagonal-map))(hexDimension, canvas, contexts, mouseClicked);
 */
module.exports = function HexBoard(canvas, window, backgroundColor) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof HexBoard)) {
    return new HexBoard(canvas, window, backgroundColor);
  }

  //A reference to the board for functions
  var board = this;

  //Setup babylonjs
  this.engine = new babylon.Engine(canvas, true);

  //Run the engines render loop
  this.engine.runRenderLoop(function() {
    if (board.scene) {
      board.scene.render();
    }
  });

  board.scene = new babylon.Scene(board.engine);

  // Change the scene background color
  var rgb = hexToRgb(backgroundColor);
  board.scene.clearColor =new babylon.Color3(
    rgb.r / 256,
    rgb.g / 256,
    rgb.b / 256
  );
  
  // And give it an ambient color
  board.scene.ambientColor = new babylon.Color3(0.3, 0.3, 0.3);
  // This creates and positions a free camera
  //var camera = new babylon.FreeCamera("camera1", new babylon.Vector3(0, 0, 1000), scene);
  //  Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius, so be careful.  It will look broken.
  board.camera = new babylon.ArcRotateCamera(
    "ArcRotateCamera",
    0,
    0,
    0,
    babylon.Vector3.Zero(),
    board.scene
  );
  //Set up anti-aliasing (required in babylon.js 3.0+)
  board.postProcess = new babylon.FxaaPostProcess("fxaa", 1.0, board.camera);
  board.camera.upVector = new babylon.Vector3(0, 0, 1);

  board.camera.upperBetaLimit = Math.PI;
  board.camera.allowUpsideDown = true;

  //Make an invisible plane to hit test for the scene's X, Y co-ordinates (not the screens X, Y co-ordinates)
  board.pickerPlane = new babylon.Plane.FromPositionAndNormal(
    babylon.Vector3.Zero(),
    new babylon.Vector3(0, 0, 1)
  );

  //Initialize variables
  board.cameraTargetX = 0; //The X point on the Z = 0 plane the camera is pointed
  board.cameraTargetY = 0; //The Y point on the Z = 0 plane the camera is pointed

  board.cameraAlpha = Math.PI/4; //The camera angle above the XY plane
  board.cameraBeta = 0; //The camera angle rotated around the Z axis
  board.cameraRadius = Math.sqrt(1000*1000, 1000,1000);//The distance from the camera target
  const radiusMin = 100;
  const alphaMax = Math.PI/2-Math.PI/360;
  const alphaMin = Math.PI/6;
  
  //board.camera.setPosition(new babylon.Vector3(0, 1000, 1000));
  // This targets the camera to scene origin
  board.camera.setTarget(babylon.Vector3.Zero());

  // Delegate mouse interactions
  var down = false;
  var mouseMoved = false;
  var clickedItem; //The item which has "claimed" the mouse down event
  var initialDownX;
  var initialDownY;

  // Watch for browser/canvas resize events
  if (window) {
    window.addEventListener("resize", function() {
      board.engine.resize();

      //recenter
      //Figure out what the old U, V in the middle was for our original size
      var hexagonalCoordinates = board.hexDimensions.getReferencePoint(
        board.cameraTargetX,
        board.cameraTargetY
      );

      board.centerOnCell(hexagonalCoordinates.u, hexagonalCoordinates.v);
    });
  }

  /**
   * Save the board position the click event happened over
   * and check if there is an interactive item under the mouse
   */
  canvas.onmousedown = function(e) {
    e.preventDefault();
    down = true;
    mouseMoved = false;

    var pageX = e.pageX;
    var pageY = e.pageY;

    if (e.touches) {
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    }
    var relativeX = pageX - canvas.offsetLeft;
    initialDownX = relativeX;
    var relativeY = pageY - canvas.offsetTop;
    initialDownY = relativeY;

    let tRay = board.scene.createPickingRay(
      relativeX,
      relativeY,
      babylon.Matrix.Identity(),
      board.camera
    );
    let pickResult = board.intersectRayPlane(tRay, board.pickerPlane);

    if (!Boolean(pickResult)) {
    	return;
    }
  
    var mousePickResult = board.scene.pick(relativeX, relativeY, function(
      mesh
    ) {
      let getFurthestAncestor = (mesh) => {
      	if (Boolean(mesh.parent)) {
      		return getFurthestAncestor(mesh.parent);
      	}
      		return mesh;

      };
      let furthestAncestor = getFurthestAncestor(mesh);
      if (Boolean(furthestAncestor.data) && Boolean(furthestAncestor.data.item) && Boolean(furthestAncestor.data.item.emitter)) {
      	// Do we need to hit-check texture for alpha?
      	if (Boolean(mesh.data) && Boolean(mesh.data.hitTestAlpha)) {

      		let meshPickResult = board.scene.pick(relativeX, relativeY, function(predicateMesh) {
    	return Boolean(predicateMesh.data) && Boolean(predicateMesh.data.item) && predicateMesh.data.item.id === mesh.data.item.id;
	});

      		if (Boolean(meshPickResult) && Boolean(meshPickResult.hit)) {
      			let textureCoordinates = meshPickResult.getTextureCoordinates();
      			return mesh.data.hitTestAlpha(textureCoordinates.x, textureCoordinates.y);
      		}
      	}
      	return true;
      }
      return false;
    });
		
    if (mousePickResult.hit) {

      clickedItem = mousePickResult.pickedMesh;
          	if (Boolean(clickedItem.parent)) {
    		clickedItem = clickedItem.parent;
    	}
    }

    if (Boolean(clickedItem)) {
      clickedItem.data.item.emitter.emit("mouseDown", {
        canvasX: relativeX,
        canvasY: relativeY,
        mapX: pickResult.x,
        mapY: pickResult.y,
        clickedItem: clickedItem
      });
    }
    board.emit("mouseDown", {
      canvasX: relativeX,
      canvasY: relativeY,
      mapX: pickResult.x,
      mapY: pickResult.y,
      clickedItem: clickedItem
    });
  };

  /**
   * If the mouse has moved the minimum distance,
   * Then emit a moved event from the clicked item (if there is one),
   * and from the board. Finaly note the mouse moved.
   */
  canvas.onmousemove = function(e) {
    e.preventDefault();
    if (down === false) {
      return;
    }
    var pageX = e.pageX;
    var pageY = e.pageY;

    if (e.touches) {
      pageX = e.touches[0].pageX;
      pageY = e.touches[0].pageY;
    }

    var relativeX = pageX - canvas.offsetLeft;
    var relativeY = pageY - canvas.offsetTop;

    //Check for a minimum drag distance before this is counted as a drag
    if (
      !(
        Math.abs(initialDownX - relativeX) > 5 ||
        Math.abs(initialDownY - relativeY) > 5
      )
    ) {
      return;
    }

    //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
    var tRay = board.scene.createPickingRay(
      relativeX,
      relativeY,
      babylon.Matrix.Identity(),
      board.camera
    );
    var pickResult = board.intersectRayPlane(tRay, board.pickerPlane);

    if (!Boolean(pickResult)) {
    	return;
    }
    
    if (Boolean(clickedItem)) {
      clickedItem.data.item.emitter.emit("mouseDragged", {
        canvasX: relativeX,
        canvasY: relativeY,
        mapX: pickResult.x,
        mapY: pickResult.y,
        clickedItem: clickedItem
      });
    }
    board.emit("mouseDragged", {
      canvasX: relativeX,
      canvasY: relativeY,
      mapX: pickResult.x,
      mapY: pickResult.y,
      clickedItem: clickedItem
    });
    mouseMoved = true;
  };

  canvas.addEventListener("touchmove", canvas.onmousemove, false);
  canvas.addEventListener("touchstart", canvas.onmousedown, false);

  canvas.onmouseleave = function(e) {
    e.preventDefault();
    if (down === false) {
      return;
    }
    down = false;
    var pageX = e.pageX;
    var pageY = e.pageY;

    if (e.changedTouches) {
      pageX = e.changedTouches[0].pageX;
      pageY = e.changedTouches[0].pageY;
    }
    let relativeX = pageX - canvas.offsetLeft;
    let relativeY = pageY - canvas.offsetTop;
    let tRay = board.scene.createPickingRay(
      relativeX,
      relativeY,
      babylon.Matrix.Identity(),
      board.camera
    );
    let pickResult = board.intersectRayPlane(tRay, board.pickerPlane);
    
    if (!Boolean(pickResult)) {
    	return;
    }

    //Emit a mouseUp event, with the clickable item
        if (Boolean(clickedItem)) {
      clickedItem.data.item.emitter.emit("mouseUp", {
        canvasX: relativeX,
        canvasY: relativeY,
        mapX: pickResult.x,
        mapY: pickResult.y,
        clickedItem: clickedItem,
        mouseMoved: mouseMoved
      });
    }
    board.emit("mouseUp", {
        canvasX: relativeX,
        canvasY: relativeY,
        mapX: pickResult.x,
        mapY: pickResult.y,
        clickedItem: clickedItem,
        mouseMoved: mouseMoved
      });
    clickedItem = null;
    mouseMoved = false;
  };
  canvas.onmouseup = canvas.onmouseleave;
  canvas.addEventListener("touchend", canvas.onmouseup, false);

  /**
   * Clears the canvas so the HexBoard may be re-used
   */
  this.clear = function() {
    board.scene.dispose();
  };

  /**
   * Initializes the groups and objects from the contexts, plus the drag variables
   */
  this.init = function() {
    // This creates a light, aiming 0,1,0 - to the sky.
    var light = new babylon.PointLight(
      "light1",
      new babylon.Vector3(0, 0, 1),
      board.scene
    );

    // Dim the light a small amount
    light.intensity = 0.5;
  };

  /**
   * Set the hexDimensions object used for centering the screen on a cell
   * @param { external:cartesian-hexagonal } hexDimension - The DTO defining the hex <--> cartesian relation
   */
  this.setHexDimensions = function(hexDimensions) {
    board.hexDimensions = hexDimensions;
  };

  /**
     * Internal shared functionallity of paning, updates the camera and emits an event
     */
  this.updatePosition = function() {
  	board.camera.target.x = board.cameraTargetX;
    board.camera.target.y = board.cameraTargetY;
    this.updateCameraPosition();
    this.emitEvent("pan", [{ middleX: board.cameraTargetX, middleY: board.cameraTargetY }]);
  };

  /**
   * Updates the camera's position (not the target) based on alpha, beta, and radius
   */
  this.updateCameraPosition = () => {
  	let cpX = this.cameraTargetX + Math.sin(this.cameraBeta)*Math.cos(this.cameraAlpha)*this.cameraRadius;
  	let cpY = this.cameraTargetY + Math.cos(this.cameraBeta)*Math.cos(this.cameraAlpha)*this.cameraRadius;
  	let cpZ = Math.sin(this.cameraAlpha)*this.cameraRadius;
  	this.camera.setPosition(new babylon.Vector3(cpX, cpY, cpZ));
  	
    this.emitEvent("camera", [{ cameraX: cpX, cameraY: cpY, cameraZ: cpZ }]);
  };
  //Call the function to set the camera's position now the function is defined
  this.updateCameraPosition();
  /**
   * Pans the camera along the plane of interest by the given amounts
   */
  this.pan = function(dx, dy) {
    board.cameraTargetX = board.cameraTargetX + dx;
    board.cameraTargetY = board.cameraTargetY + dy;
    this.updatePosition();
  };

  /**
   * Tilts the camera over the plane of interest
   */
  this.tilt = dAlpha => {
  	this.cameraAlpha = this.cameraAlpha + dAlpha;
  	this.cameraAlpha = Math.max(this.cameraAlpha, alphaMin);
  	this.cameraAlpha = Math.min(this.cameraAlpha, alphaMax);
  	this.updateCameraPosition();
  };
  
  /**
   * Spins the camera around the Z axis
   */
  this.spin = dBeta => {
  	this.cameraBeta = this.cameraBeta + dBeta;
  	this.updateCameraPosition();
  };
  
  /**
   * Zooms the camera towards and away from the target point
   */
  this.zoom = dRadius => {
  	this.cameraRadius = this.cameraRadius + dRadius;
  	this.cameraRadius = Math.max(this.cameraRadius, radiusMin); // Don't go negative
  	this.updateCameraPosition();
  };
  /**
   * Utility function to center the board on a cell
   */
  this.centerOnCell = function(u, v) {
    var pixelCoordinates = board.hexDimensions.getPixelCoordinates(u, v);
    board.cameraTargetX = pixelCoordinates.x;
    board.cameraTargetY = pixelCoordinates.y;
    this.updatePosition();
  };

  /**
   * Helper function to get intersection between ray and plane
   */
  this.intersectRayPlane = function(pRay, pPlane) {
    var tIsecPoint = null;
    var tDot = babylon.Vector3.Dot(pRay.direction, pPlane.normal);
    if (tDot !== 0.0) {
      var t = -pPlane.signedDistanceTo(pRay.origin) / tDot;
      if (t >= 0.0) {
        var tDirS = pRay.direction.scale(t);
        tIsecPoint = pRay.origin.add(tDirS);
      }
    }
    return tIsecPoint;
  };
};

let EventEmitter = require("wolfy87-eventemitter");
module.exports.prototype = new EventEmitter();
