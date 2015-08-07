"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module hexagonal-map
 */
 
var paper = require('browserifyable-paper');
/*
 * Defines an isometric hexagonal board for web games
 */


/**
 * Pretty much the controller of a hexagonal map scene using the provided canvas and context objects
 * @constructor
 * @param { External:cartesian-hexagonal } hexDimension - The DTO defining the hex <--> cartesian relation
 * @param canvas - The canvas element to initialize with paper.js
 * @param { Context[] } contexts - An array of contexts used to control display and interaction with various layers of the map
 * @example var hexMap = new (require(hexagonal-map))(hexDimension, canvas, contexts);
 */
 module.exports = function HexBoard(hexDimensions, canvas, contexts) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof HexBoard)) {
        return new HexBoard(hexDimensions, canvas, contexts);
    }
    
    var gridLineWidth = hexDimensions.edgeWidth;

    this.hexDimensions = hexDimensions;
    this.contexts = contexts;


    //Initialize variables
    var dx = 0; //The current translation in x of the map
    var dy = 0; // the current translation in y of the map
    

    //A reference to the board for functions
    var board = this;

    //Setup paper.js
    paper.setup(canvas);

    //Initialize each context with a group, the contexts should be in the desired z index order
    contexts.forEach(function(context) {
        var group = new paper.Group();
        //Set the group pivot points, else paper.js will try to re-compute it to the center
        group.pivot = new paper.Point(0, 0);
        context.init(group);
    });
    
    paper.view.draw();
    var tool = new paper.Tool();

     //Set up the psuedo drag for the grid
     var down = false;
     var mousemoved = false;
     var latestX=0;
     var latestY=0;
     var clickedY=0;
     var mouseDownContext; //The context which has "claimed" the mouse down event

     tool.onMouseDown = function(e) {
         down = true;
         var mousemoved = false;
         latestX = e.point.x;
         latestY = e.point.y;
         clickedY = e.point.y;
         //Iterate through the contexts in reverse z-index order to see if any of them claim the click event
         for (var i = board.contexts.length - 1; i > 0; i --) {
             if (board.contexts[i].mouseDown(e.point.x, e.point.y)) {
                 mouseDownContext = contexts[i];
             }
         }
     };


    tool.onMouseMove = function(e) {
        if (down === false) {
            return;
        }


        if (!!mouseDownContext) {
            //A context has claimed further mouse drag
            mouseDownContext.mouseDragged(e.point.x, e.point.y, e.point.x - latestX, e.point.y - latestY);
        } else {
            //general dragging, translate all cell groups. Position the grid to look infinite
            dx = dx + e.point.x - latestX;
            dy = dy + e.point.y - latestY;
            board.updatePostion();
        }
        latestX = e.point.x;
        latestY = e.point.y;
        //paper.view.update();
     };

    //TODO onMouseOut does not seem to work. However, mouse events still seem to happen when outside of the paper.js view. So the annoying effects onMouseOut was intended to fix don't show up anyways
    tool.onMouseLeave = function(e) {
        if (down === false) {
            return;
        } 
        down = false;
        mouseDownContext = null;
        if (mousemoved) {
            return;
        }
    };
    tool.onMouseUp = tool.onMouseLeave;
     
    /**
     * Update x/y positions based on the current dx and dy
     * Will call into the background and foreground update functions
     */
    this.updatePostion = function() {
        board.contexts.forEach(function(context) {
            context.updatePosition(dx, dy);
        });
    };
     
     /**
      * Utility function to center the board on a cell
      */
     this.centerOnCell = function(u, v) {
         var pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
         dx = Math.floor(pixelCoordinates.x + paper.view.size.width/2);
         dy = Math.floor(pixelCoordinates.y + paper.view.size.height/2);
         this.updatePostion();
         var date1 = new Date().getTime();

         paper.view.update();
         var date2 = new Date().getTime();
         document.getElementById("result").innerHTML = "Draw Time: " + (date2 - date1) + " ms";
     };
};