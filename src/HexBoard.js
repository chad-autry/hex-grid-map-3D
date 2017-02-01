"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module hexagonal-map
 */
 
var babylon = require('babylonjs/babylon.max.js');
/*
 * Defines an isometric hexagonal board for web games
 */


/**
 * Pretty much the controller of a hexagonal map scene using the provided canvas and context objects
 * @constructor
 * @param { external:cartesian-hexagonal } hexDimension - The DTO defining the hex <--> cartesian relation
 * @param canvas - The canvas element to initialize with paper.js
 * @param { Context[] } contexts - An array of contexts used to control display and interaction with various layers of the map
 * @param { mouseClicked= } mouseClicked - A mouse clicked callback if no items were clicked
 * @example var hexMap = new (require(hexagonal-map))(hexDimension, canvas, contexts, mouseClicked);
 */
 module.exports = function HexBoard(canvas, window) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof HexBoard)) {
        return new HexBoard(canvas, window);
    }
    

    

    //A reference to the board for functions
    var board = this;

    //Setup babylonjs
    this.engine = new babylon.Engine(canvas, true);

    //Run the engines render loop
    this.engine.runRenderLoop(function () {
        if (!!board.scene) {
            board.scene.render();
        }
    });


    //Set up mouse interactions with the contexts
    var down = false;
    var mousemoved = false;
    var mouseDownPickResult;
    var mouseDownContext; //The context which has "claimed" the mouse down event
    var initialDownX;
    var initialDownY;
     
    // Watch for browser/canvas resize events
    if (!!window) {
        window.addEventListener("resize", function () {
            board.engine.resize();
            //Call each context with redraw, followed by updatePosition
            board.contexts.forEach(function(context) {
                context.reDraw(true, false, false);
            });

            //recenter
            //Figure out what the old U, V in the middle was for our original size
            var hexagonalCoordinates = board.hexDimensions.getReferencePoint(board.cameraTargetX, board.cameraTargetY);
        
            board.centerOnCell(hexagonalCoordinates.u, hexagonalCoordinates.v);
        });
    }
    
     canvas.onmousedown = function(e) {
         e.preventDefault();
         down = true;
         mousemoved = false;
         
         var pageX = e.pageX;
         var pageY = e.pageY;

         if (!!e.touches) {
            pageX = e.touches[0].pageX;
            pageY = e.touches[0].pageY;
         }
         var relativeX = pageX - canvas.offsetLeft;
         initialDownX = relativeX;
         var relativeY = pageY - canvas.offsetTop;
         initialDownY = relativeY;
         //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
         var tRay = board.scene.createPickingRay(relativeX, relativeY,
            babylon.Matrix.Identity(), board.camera);
         mouseDownPickResult = board.intersectRayPlane(tRay, board.pickerPlane); 
         //Iterate through the contexts in reverse z-index order to see if any of them claim the click event
         for (var i = board.contexts.length - 1; i >= 0; i--) {
             if (board.contexts[i].mouseDown(relativeX, relativeY)) {
                 mouseDownContext = board.contexts[i];
                 break;
             }
         }
     };
     
     
    canvas.onmousemove = function(e) {
        e.preventDefault();
        if (down === false) {
            return;
        }
        var pageX = e.pageX;
        var pageY = e.pageY;
        
        if (!!e.touches) {
            pageX = e.touches[0].pageX;
            pageY = e.touches[0].pageY;
        }
        
        var relativeX = pageX - canvas.offsetLeft;
        var relativeY = pageY - canvas.offsetTop;
         
        //Check for a minimum drag distance before this is counted as a drag
        if (!(Math.abs(initialDownX - relativeX) > 5 || Math.abs(initialDownY - relativeY) > 5)) {
            return;
        }

        //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
        var tRay = board.scene.createPickingRay(relativeX, relativeY,
            babylon.Matrix.Identity(), board.camera);
        var pickResult = board.intersectRayPlane(tRay, board.pickerPlane);
            
        if (!!mouseDownContext) {
            //A context has claimed further mouse drag
            mouseDownContext.mouseDragged(relativeX, relativeY, pickResult.pickedPoint.x, pickResult.pickedPoint.y);
            if (!!board.mouseDragged ){
                board.mouseDragged(relativeX, relativeY, pickResult.pickedPoint.x, pickResult.pickedPoint.y, true);
            }
        } else {
            if (!!board.mouseDragged ){
                board.mouseDragged(relativeX, relativeY, pickResult.pickedPoint.x, pickResult.pickedPoint.y, false);
            }
            //Figure out where the camera needs to be targeted, for the initial mouse down position to stay under the mouse
            
            //The current point under the mouse is related to the current center of the screen, as the initial point under the mouse needs to be related to the new center
            //Find how that relates to the point on the plane in the middle of the screen
            var planeDx = pickResult.x - board.cameraTargetX;
            var planeDy = pickResult.y - board.cameraTargetY;
                
            //Solve for the new cameraTarget co-ordinates relative to the original mouse down point
            board.cameraTargetX = mouseDownPickResult.x - planeDx;
            board.cameraTargetY = mouseDownPickResult.y - planeDy;

            board.updatePostion();
        }
        mousemoved = true;
     };
     
    canvas.addEventListener('touchmove', canvas.onmousemove, false);
    canvas.addEventListener('touchstart', canvas.onmousedown, false);

    canvas.onmouseleave = function(e) {
        e.preventDefault();
        if (down === false) {
            return;
        } 
        down = false;
        var pageX = e.pageX;
        var pageY = e.pageY;

        if (!!e.changedTouches) {
            pageX = e.changedTouches[0].pageX;
            pageY = e.changedTouches[0].pageY;
        }
        var relativeX =  pageX - canvas.offsetLeft;
        var relativeY = pageY - canvas.offsetTop;
        var tRay = board.scene.createPickingRay(relativeX, relativeY, 
            babylon.Matrix.Identity(), board.camera);
        var pickResult = board.intersectRayPlane(tRay, board.pickerPlane); 

        if (!!mouseDownContext) {
            mouseDownContext.mouseReleased(relativeX, relativeY, pickResult.pickedPoint.x, pickResult.pickedPoint.y, mousemoved);
            //Call the final global mouse clicked, but pass true to say it was claimed
            if (!!board.mouseClicked) {
            board.mouseClicked(relativeX, relativeY, pickResult.x, pickResult.y, true, mousemoved);
            }
        } else if (!!board.mouseClicked) {
            board.mouseClicked(relativeX, relativeY, pickResult.x, pickResult.y, false, mousemoved);
        }
        mouseDownContext = null;
        mousemoved = false;
    };
    canvas.onmouseup = canvas.onmouseleave;
    canvas.addEventListener('touchend', canvas.onmouseup, false);
    
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
    
    board.gridLineWidth = board.hexDimensions.edgeWidth;
        
    board.scene = new babylon.Scene(board.engine);
        
    // Change the scene background color to black.
    board.scene.clearColor = new babylon.Color3(0, 0, 0);
    
    // This creates and positions a free camera
    //var camera = new babylon.FreeCamera("camera1", new babylon.Vector3(0, 0, 1000), scene);
    //  Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius, so be careful.  It will look broken.
    board.camera = new babylon.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, babylon.Vector3.Zero(), board.scene);

    board.camera.upVector = new babylon.Vector3(0, 0, 1);
    
    board.camera.upperBetaLimit = Math.PI;
    board.camera.allowUpsideDown = true;
   
    //We use our external canvas controls to control the camera
        // This attaches the camera to the canvas
        //camera.attachControl(canvas, false);
       
       /*
       camera.mode = babylon.Camera.ORTHOGRAPHIC_CAMERA;
       
       this.camera.orthoTop = 500;
       this.camera.orthoBottom = -500;
       this.camera.orthoLeft = -500;
       this.camera.orthoRight = 500;
       */
       // This creates a light, aiming 0,1,0 - to the sky.
       var light = new babylon.HemisphericLight("light1", new babylon.Vector3(0, 0, 1), board.scene);

       // Dim the light a small amount
       light.intensity = 0.5;
   
       //Make an invisible plane to hit test for the scene's X, Y co-ordinates (not the screens X, Y co-ordinates)
       board.pickerPlane = new babylon.Plane.FromPositionAndNormal(babylon.Vector3.Zero(), 
        new babylon.Vector3(0, 0, 1));


        //Initialize variables
        board.cameraTargetX = 0; //The X point on the Z = 0 plane the camera is pointed
        board.cameraTargetY = 0; //The Y point on the Z = 0 plane the camera is pointed
        
        board.camera.setPosition(new babylon.Vector3(0, 1000, 1000));
        // This targets the camera to scene origin
        board.camera.setTarget(babylon.Vector3.Zero());
    
        //Initialize each context with with the scene
        board.contexts.forEach(function(context) {
            context.init(board.scene);
        });
    
    };

    /**
     * Set the context objects which control layer views and interactions
     * @param { Context[] } contexts - An array of contexts used to control display and interaction with various layers of the map, should be in Z index order
     */
    this.setContexts = function(contexts) {
        board.contexts = contexts;
    };

    /**
     * Set the hexDimensions object used for centering the screen on a cell
     * @param { external:cartesian-hexagonal } hexDimension - The DTO defining the hex <--> cartesian relation
     */
    this.setHexDimensions = function(hexDimensions) {
        board.hexDimensions = hexDimensions;
    };
    
    /**
     * Set the function to be called when no context claims a mouse/touch interaction
     * @param { mouseClicked= } mouseClicked - A global mouse clicked callback, with parameter if an item was clicked
     */
    this.setMouseClicked = function(mouseClicked) {
        board.mouseClicked = mouseClicked;
    };
    
    /**
     * Set the function to be called when no context claims a mouse/touch interaction
     * @param { mouseDragged= } mouseDragged - A global mouse dragged, with a parameter if an item was dragged
     */
    this.setMouseDragged = function(mouseDragged) {
        board.mouseDragged = mouseDragged;
    };

    /**
     * Update x/y positions based on the current dx and dy
     * Will call into the background and foreground update functions
     */
    this.updatePostion = function() {
        board.camera.target.x = board.cameraTargetX;
        board.camera.target.y = board.cameraTargetY;
        board.contexts.forEach(function(context) {
            context.updatePosition(board.cameraTargetX, board.cameraTargetY);
        });
    };
     
     /**
      * Utility function to center the board on a cell
      */
     this.centerOnCell = function(u, v) {
         var pixelCoordinates = board.hexDimensions.getPixelCoordinates(u, v);
         board.cameraTargetX = pixelCoordinates.x;
         board.cameraTargetY = pixelCoordinates.y;
         this.updatePostion();
     };

    /**
     * Helper function to get intersection between ray and plane
     */
    this. intersectRayPlane = function (pRay, pPlane)
    {
        var tIsecPoint = null;
        var tDot = babylon.Vector3.Dot(pRay.direction, pPlane.normal);
        if (tDot !== 0.0) {
            var t = -pPlane.signedDistanceTo(pRay.origin) / tDot;
            if (t >= 0.0) {
                var tDirS = pRay.direction.scale(t);
                tIsecPoint = pRay.origin.add(tDirS);
            }
        }
        return (tIsecPoint);
    };
};