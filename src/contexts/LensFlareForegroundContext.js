"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module LensFlareForegroundContext
 */
 
var paper = require('browserifyable-paper');


/**
 * This is an example context with methods to draw and update the foreground of a hexBoard
 * Drawing lens flare for use with space games, something different such as clouds could be implimented.
 * @implements {Context}
 * @constructor
 * @todo Turn the hard coded lense flare and list of points on the constructor into a DataSource
 * @param {external:cartesian-hexagonal~HexagonalCoordinates} points - the u, v points to draw lens flare for
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function  LensFlareForegroundContext(points, hexDimensions) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof LensFlareForegroundContext)) {
        return new LensFlareForegroundContext();
    }
    var context = this;
    context.points = points;
    context.hexDimensions = hexDimensions;
    
    // Documentation inherited from Context#init
    this.init = function(foregroundGroup) {
        context.flares = [];
        context.foregroundGroup = foregroundGroup;
        for (var i = 0; i < context.points.length; i++) {
            context.flares[i] = {};
            //create 3 shapes for each point
            // first one is the smallest and closest, to the light source. Make it 1 hex in large
            var xyPoint = context.hexDimensions.getPixelCoordinates(context.points[i].u, context.points[i].v);
            context.flares[i].xyOrigin = xyPoint;
            //Unskew the hex size from the dimensions
            context.flares[i].flareOne = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 2*context.hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareOne.fillColor = '#fefcaf';
            context.flares[i].flareOne.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareOne);
            
            context.flares[i].flareTwo = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 2*2*context.hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareTwo.fillColor = '#feff7f';
            context.flares[i].flareTwo.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareTwo);
            
            context.flares[i].flareThree = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 3*2*context.hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareThree.fillColor = '#fffd37';
            context.flares[i].flareThree.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareThree);
        }
        this.updatePosition(0, 0);
    };

    // Documentation inherited from Context#updatePosition
    this.updatePosition = function(dx, dy) {
        //Update the position of the individual flares for each flare set
        for (var i = 0; i < context.flares.length; i++) {
            var flare = context.flares[i];
            var xFromMid = -(paper.view.size.width / 2) + dx + context.flares[i].xyOrigin.x;
            var yFromMid = -(paper.view.size.height / 2) + dy + context.flares[i].xyOrigin.y;
            context.flares[i].flareOne.position = new paper.Point(paper.view.size.width / 2 - xFromMid, paper.view.size.height / 2 - yFromMid);
            context.flares[i].flareTwo.position = new paper.Point(paper.view.size.width / 2 - 2*xFromMid, paper.view.size.height / 2 - 2*yFromMid);
            context.flares[i].flareThree.position = new paper.Point(paper.view.size.width / 2 - 3*xFromMid, paper.view.size.height / 2 - 3*yFromMid);
        }
    };
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