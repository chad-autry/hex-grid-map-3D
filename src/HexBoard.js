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
 * @example var hexMap = new (require(hexagonal-map))(hexDimension, params, cellContext, gridOverlayContext);
 */
 module.exports = function HexBoard(hexDimensions, params, cellContext, gridOverlayContext) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof HexBoard)) {
        return new HexBoard(params);
    }
    //Get all the variables which come from the parameters
    
    //The factory which will provide the paper.js Item to draw
    var drawnItemFactory = params.drawnItemFactory;
    var canvas = params.canvas;

    var gridLineWidth = params.edgeWidth;

    this.hexDimensions = hexDimensions; 
    //Set the background update function if it was passed in
    if(params.hasOwnProperty('updateBackgroundPosition')) {
        this.updateBackgroundPosition = params.updateBackgroundPosition;
    }

    //Set the foreground update function if it was passed in
    if(params.hasOwnProperty('updateForegroundPosition')) {
        this.updateForegroundPosition = params.updateForegroundPosition;
    }

    //Set the grid update function if it was passed in
    if(params.hasOwnProperty('updateGridPosition')) {
        this.updateGridPosition = params.updateGridPosition;
    }
    this.cellContext = cellContext;
    this.gridOverlayContext = gridOverlayContext;
    //Now the board variables which do not comes from the initial params
    var dx = 0; //The current translation in x of the map
    var dy = 0; // the current translation in y of the map
    

    //A reference to the board for functions
    var board = this;

    //Setup paper.js
    paper.setup(canvas);

    //Instantiate the groups in the desired z-index order
    var backgroundGroup = new paper.Group();
    var belowGridCellsGroup = new paper.Group(); //When there is a stack some items might be drawn below grid, or if there is a large item (sphere) it might have components drawn above and below
    var gridGroup = new paper.Group();
    var gridOverlayGroup = new paper.Group();
    var aboveGridCellsGroup = new paper.Group();
    var foregroundGroup = new paper.Group();

    //Set the group pivot points, else paper.js will try to re-compute it to the center
    backgroundGroup.pivot = new paper.Point(0, 0);
    belowGridCellsGroup.pivot = new paper.Point(0, 0);
    gridGroup.pivot = new paper.Point(0, 0);
    gridOverlayGroup.pivot = new paper.Point(0, 0);
    aboveGridCellsGroup.pivot = new paper.Point(0, 0);
    foregroundGroup.pivot = new paper.Point(0, 0);
    
    //Init the background if there was an init method on the params
    if(params.hasOwnProperty('initBackground')) {
        params.initBackground(paper, backgroundGroup);
    }

    //Init the foreground if there was an init method on the params
    if(params.hasOwnProperty('initForeground')) {
        params.initForeground(paper, foregroundGroup, hexDimensions);
    }
    
    //Init the grid if there was an init method on the params
    if(params.hasOwnProperty('initGrid')) {
        params.initGrid(paper, gridGroup, hexDimensions);
    }
    
    //Init the cellContext
    cellContext.init(paper, belowGridCellsGroup, aboveGridCellsGroup, hexDimensions);
    
    //Init the gridOverlayContext
    gridOverlayContext.init(gridOverlayGroup);

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
         if (board.cellContext.aboveGridMouseDown(e.point.x, e.point.y)) {
             mouseDownContext = board.cellContext;
         } else if (board.cellContext.belowGridMouseDown(e.point.x, e.point.y)) {
             mouseDownContext = board.cellContext;
         } else if (board.gridOverlayContext.onMouseDown(e.point.x, e.point.y)) {
             mouseDownContext = board.gridOverlayContext;
         }
     };


    tool.onMouseMove = function(e) {
        if (down === false) {
            return;
        }


        if (!!mouseDownContext) {
            //A context has claimed further mouse drag
            mouseDownContext.mouseDragged(e.point.x, e.point.y, e.point.x - latestX, e.point.y - latestY, dx, dy);
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
         this.cellContext.updatePosition(dx, dy);
         this.gridOverlayContext.updatePosition(dx, dy);
         this.updateGridPosition(gridGroup, dx, dy);
         this.updateBackgroundPosition(backgroundGroup, dx, dy);
         this.updateForegroundPosition(foregroundGroup, dx, dy);
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




}

/**
 * A stub, the instantiating application should override (or alternatively provide in the params) to implement the desired background changes on grid drag
 */
module.exports.prototype.updateBackgroundPosition = function(backgroundGroup, dx, dy) {

};

/**
 * A stub, the instantiating application should override (or alternatively provide in the params) to implement the desired foreground changes on grid drag
 */
module.exports.prototype.updateForegroundPosition = function(foregroundGroup, dx, dy) {

};

/**
 * A stub, the instantiating application should override (or alternatively provide in the params) to implement the desired grid changes on global drag
 */
module.exports.prototype.updateGridPosition = function(gridGroup, dx, dy) {

};
