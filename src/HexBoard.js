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
 module.exports = function HexBoard(hexDimensions, canvas, contexts, mouseClicked, window) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof HexBoard)) {
        return new HexBoard(hexDimensions, canvas, contexts);
    }
    
    var gridLineWidth = hexDimensions.edgeWidth;

    this.hexDimensions = hexDimensions;
    this.contexts = contexts;

    //Initialize variables
    var cameraTargetX = 0; //The X point on the Z = 0 plane the camera is pointed
    var cameraTargetY = 0; //The Y point on the Z = 0 plane the camera is pointed
    

    //A reference to the board for functions
    var board = this;

    //Setup babylonjs
    var engine = new babylon.Engine(canvas, true);
    var scene = new babylon.Scene(engine);
        
    // Change the scene background color to black.
    scene.clearColor = new babylon.Color3(0, 0, 0);
    
    // This creates and positions a free camera
    //var camera = new babylon.FreeCamera("camera1", new babylon.Vector3(0, 0, 1000), scene);
    //  Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius, so be careful.  It will look broken.
    var camera = new babylon.ArcRotateCamera("ArcRotateCamera", 0, 0, 0, babylon.Vector3.Zero(), scene);
    camera.setPosition(new babylon.Vector3(0, 1000, 1000));
    // This targets the camera to scene origin
    camera.setTarget(babylon.Vector3.Zero());
    camera.upVector = new babylon.Vector3(0, 0, 1);
    
    camera.upperBetaLimit = Math.PI;
    camera.allowUpsideDown = true;
   
    //We use our external canvas controls to control the camera
        // This attaches the camera to the canvas
        //camera.attachControl(canvas, false);
       
       /*
       camera.mode = babylon.Camera.ORTHOGRAPHIC_CAMERA;
       
       camera.orthoTop = 500;
       camera.orthoBottom = -500;
       camera.orthoLeft = -500;
    camera.orthoRight = 500;
    */
    // This creates a light, aiming 0,1,0 - to the sky.
    var light = new babylon.HemisphericLight("light1", new babylon.Vector3(0, 0, 1), scene);

   // Dim the light a small amount
   light.intensity = 0.5;
   
   //Make an invisible plane to hit test for the scene's X, Y co-ordinates (not the screens X, Y co-ordinates)
   var pickerPlane = babylon.Mesh.CreatePlane("pickerPlane", 10000.0, scene);
   pickerPlane.visible = false;

    //Initialize each context with with the scene
    contexts.forEach(function(context) {
        context.init(scene);
    });

    //Run the engines render loop
    engine.runRenderLoop(function () {
            scene.render();
    });
    if (!!mouseClicked) {
        this.mouseClicked = mouseClicked;
    }


    //Set up mouse interactions with the contexts
    var down = false;
    var mousemoved = false;
    var mouseDownPickResult;
    var mouseDownContext; //The context which has "claimed" the mouse down event
     
    // Watch for browser/canvas resize events
    if (!!window) {
        window.addEventListener("resize", function () {
            engine.resize();
            //Call each context with redraw, followed by updatePosition
            board.contexts.forEach(function(context) {
                context.reDraw(true, false, false);
            });

            //recenter
            //Figure out what the old U, V in the middle was for our original size
            var hexagonalCoordinates = hexDimensions.getReferencePoint(cameraTargetX, cameraTargetY);
        
            board.centerOnCell(hexagonalCoordinates.u, hexagonalCoordinates.v);
        });
    }
    
     canvas.onmousedown = function(e) {
         down = true;
         var mousemoved = false;
         var relativeX = e.pageX - canvas.offsetLeft;
         var relativeY = e.pageY - canvas.offsetTop;
         //Pick the point on the invisible picker plane at the screen co-ordinates under the mouse
         mouseDownPickResult = scene.pick(relativeX, relativeY,
            function(mesh) {
                return mesh === pickerPlane;
            });
         //Iterate through the contexts in reverse z-index order to see if any of them claim the click event
         for (var i = contexts.length - 1; i >= 0; i--) {
             if (contexts[i].mouseDown(relativeX, relativeY)) {
                 mouseDownContext = contexts[i];
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
            var pickResult = scene.pick(relativeX, relativeY,
                function(mesh) {
                    return mesh === pickerPlane;
                });
                
            //Find how that relates to the point on the plane in the middle of the screen
            var planeDx = pickResult.pickedPoint.x - cameraTargetX;
            var planeDy = pickResult.pickedPoint.y - cameraTargetY;
                
            //Solve for the new cameraTarget co-ordinates relative to the original mouse down point
            cameraTargetX = mouseDownPickResult.pickedPoint.x - planeDx;
            cameraTargetY = mouseDownPickResult.pickedPoint.y - planeDy;

            board.updatePostion();

            //Next, re-center our finite pickerPlane
            pickerPlane.position.x = cameraTargetX;
            pickerPlane.position.y = cameraTargetY;
            
            
            
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
            var pickResult = scene.pick(relativeX, relativeY,
               function(mesh) {
                   return mesh === pickerPlane;
               });
            mouseClicked(cameraTargetX, pickResult.pickedPoint.x + cameraTargetX, cameraTargetY, pickResult.pickedPoint.y + cameraTargetY);
        }
        mouseDownContext = null;
        mousemoved = false;
    };
    canvas.onmouseup = canvas.onmouseleave;

    /**
     * Update x/y positions based on the current dx and dy
     * Will call into the background and foreground update functions
     */
    this.updatePostion = function() {
        //TODO Animate the camera pan with some sort of easeing function
        camera.target.x = cameraTargetX;
        camera.target.y = cameraTargetY;
        board.contexts.forEach(function(context) {
            context.updatePosition(cameraTargetX, cameraTargetY);
        });
    };
     
     /**
      * Utility function to center the board on a cell
      */
     this.centerOnCell = function(u, v) {
         var pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
         cameraTargetX = pixelCoordinates.x;
         cameraTargetY = pixelCoordinates.y;
         this.updatePostion();
     };
};