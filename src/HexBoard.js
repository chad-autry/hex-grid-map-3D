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
            board.scene.render();
    });


    //Set up mouse interactions with the contexts
    var down = false;
    var mousemoved = false;
    var mouseDownPickResult;
    var mouseDownContext; //The context which has "claimed" the mouse down event
     
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
         down = true;
         mousemoved = false;
         var relativeX = e.pageX - canvas.offsetLeft;
         var relativeY = e.pageY - canvas.offsetTop;
         //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
         mouseDownPickResult = board.scene.pick(relativeX, relativeY,
            function(mesh) {
                return mesh === board.pickerPlane;
            });
         //Iterate through the contexts in reverse z-index order to see if any of them claim the click event
         for (var i = board.contexts.length - 1; i >= 0; i--) {
             if (board.contexts[i].mouseDown(relativeX, relativeY)) {
                 mouseDownContext = board.contexts[i];
                 break;
             }
         }
     };
     
     
    canvas.onmousemove = function(e) {
        if (down === false) {
            return;
        }
         var relativeX = e.pageX - canvas.offsetLeft;
         var relativeY = e.pageY - canvas.offsetTop;


        if (!!mouseDownContext) {
            //A context has claimed further mouse drag
            mouseDownContext.mouseDragged(relativeX, relativeY);
        } else {
        
            //Figure out where the camera needs to be targeted, for the initial mouse down position to stay under the mouse
            
            //The current point under the mouse is related to the current center of the screen, as the initial point under the mouse needs to be related to the new center
            
            //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
            var pickResult = board.scene.pick(relativeX, relativeY,
                function(mesh) {
                    return mesh === board.pickerPlane;
                });
                
            //Find how that relates to the point on the plane in the middle of the screen
            var planeDx = pickResult.pickedPoint.x - board.cameraTargetX;
            var planeDy = pickResult.pickedPoint.y - board.cameraTargetY;
                
            //Solve for the new cameraTarget co-ordinates relative to the original mouse down point
            board.cameraTargetX = mouseDownPickResult.pickedPoint.x - planeDx;
            board.cameraTargetY = mouseDownPickResult.pickedPoint.y - planeDy;

            board.updatePostion();

            //Next, re-center our finite pickerPlane
            board.pickerPlane.position.x = board.cameraTargetX;
            board.pickerPlane.position.y = board.cameraTargetY;
            
            
            
        }
        mousemoved = true;
     };

    canvas.onmouseleave = function(e) {
        if (down === false) {
            return;
        } 
        down = false;
        if (!!mouseDownContext) {
            mouseDownContext.mouseReleased(mousemoved);
        } else if (!!board.mouseClicked && !mousemoved) {
            var relativeX =  e.pageX - canvas.offsetLeft;
            var relativeY = e.pageY - canvas.offsetTop;
            var pickResult = board.scene.pick(relativeX, relativeY,
               function(mesh) {
                   return mesh === board.pickerPlane;
               });
            board.mouseClicked(board.cameraTargetX, pickResult.pickedPoint.x + board.cameraTargetX, board.cameraTargetY, pickResult.pickedPoint.y + board.cameraTargetY);
        }
        mouseDownContext = null;
        mousemoved = false;
    };
    canvas.onmouseup = canvas.onmouseleave;
    
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
       board.pickerPlane = babylon.Mesh.CreatePlane("pickerPlane", 10000.0, board.scene);
       board.pickerPlane.visible = false;


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
     * @param { mouseClicked= } mouseClicked - A mouse clicked callback if no items were clicked
     */
    this.setMouseClicked = function(mouseClicked) {
        board.mouseClicked = mouseClicked;
    };

    /**
     * Update x/y positions based on the current dx and dy
     * Will call into the background and foreground update functions
     */
    this.updatePostion = function() {
        //TODO Animate the camera pan with some sort of easeing function
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
};