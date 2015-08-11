"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module GridContext
 */
var paper = require('browserifyable-paper');

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
    this.init = function(gridGroup) {
        context.gridColor = 'silver';
        context.gridGroup = gridGroup;
        //Create the Hex item
        var halfHex = context.createPointUpHalfHex(paper);
        //create the background raster
        var gridRaster = context.createPointUpGridRaster(halfHex);
        gridGroup.addChild(gridRaster);
        context.dyModulo = (hexDimensions.hexagon_wide_width + 2*hexDimensions.hexagon_scaled_half_edge_size);
        context.dxModulo = hexDimensions.hexagon_edge_to_edge_width;
    };

    // Documentation inherited from Context#updatePosition
    this.updatePosition = function(dx, dy) {
         //Modulo the grid position since it is a finite repeating pattern
         context.gridGroup.position.x = dx%context.dxModulo;
         context.gridGroup.position.y = dy%context.dyModulo;
    };
    
    this.reDraw = function(screenResized, mapRotated, mapScaled) {
        if (screenResized) {
            context.gridGroup.removeChildren();
            context.gridGroup.position.x = 0;
            context.gridGroup.position.y = 0;
            context.init(context.gridGroup);
        }
    };
};

/**
 * Creates a paper.Symbol with half the lines of a hex in a point up orientation for creating a point up oriented grid
 * @private
 */
module.exports.prototype.createPointUpHalfHex = function(paper) {
    //Create the half-hex path which will be duplicated (with different z values) to create the hex grid
    var halfHex = new paper.Group();
    halfHex.pivot = new paper.Point(0,0); //Set the pivot point, else paper.js will try to re-compute it to the center
    var zeroZeroPixelCoordinates = this.hexDimensions.getPixelCoordinates(0, 0);
    //The first point of each line is the lower "junction" point of the point up hexagon
    //Draw the vertical line first
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width), 
        new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width + 2*this.hexDimensions.hexagon_scaled_half_edge_size)));
    //Next the bottom right line
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width),
        new paper.Point(zeroZeroPixelCoordinates.x + this.hexDimensions.hexagon_edge_to_edge_width/2, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_scaled_half_edge_size)));
    //Next the bottom left
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_half_wide_width),
        new paper.Point(zeroZeroPixelCoordinates.x - this.hexDimensions.hexagon_edge_to_edge_width/2, zeroZeroPixelCoordinates.y + this.hexDimensions.hexagon_scaled_half_edge_size)));

    halfHex.strokeColor = this.gridColor;
    halfHex.strokeWidth = 3;
    halfHex.strokeCap = 'square';

    // Create a symbol from the path. Set "don't center" to true. If left default of false, then instances seem to have their co-ordinates recentered to their bounding box
    return new paper.Symbol(halfHex, true);
};

/**
 * Creates a raster of a hex grid with the point up
 * @private
 */
module.exports.prototype.createPointUpGridRaster = function(halfHexSymbol) {
    var zeroZeroPixelCoordinates = this.hexDimensions.getPixelCoordinates(0, 0);
    var gridGroup = new paper.Group();
    gridGroup.pivot = new paper.Point(0, 0);
    //For every hex, place an instance of the symbol. The symbol fills in 3 of the 6 lines, the other 3 being shared with an adjacent hex
    //Top left hex is 0,0
    var bottomRight = this.hexDimensions.getReferencePoint( paper.view.size.width, paper.view.size.height);
    var topRight = this.hexDimensions.getReferencePoint(paper.view.size.width, 0);

    //TODO This loop is assuming default orientation of the grid

    //Note: The (-3) and (+1) values are to give extra slack on the top and bottom for dragging, don't want to see an incomplete grid appear.
    for (var i =  -3; i <= bottomRight.u + 1; i++) {
        //Note: The (-2) and (+2) values are to give extra slack on the left and right for dragging, don't want to see an incomplete grid appear.
        for (var j =  -Math.abs(Math.round(i/2)) - 2; j <= topRight.v - Math.ceil(i/2) + 2; j++) {
            var pixelCoordinates = this.hexDimensions.getPixelCoordinates(i, j);
            var instance = halfHexSymbol.place();
            instance.pivot = new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y); //Set the pivot point, Instances do not inherit the parent symbol's pivot!
            instance.position = new paper.Point(pixelCoordinates.x, pixelCoordinates.y);
            gridGroup.addChild(instance);
        }
    }

    //Rasterize the grid to improve performance.
    var raster = gridGroup.rasterize();
    //Normalize the raster's pivot to be the current 0,0 position. This value was gotten by experimentation. I suspect it is where crss-browser issues crop up
    raster.pivot = new paper.Point(0 - raster.position.x, 0 - raster.position.y);

    gridGroup.remove();
    return raster;
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