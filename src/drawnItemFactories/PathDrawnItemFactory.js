"use strict";
var paper = require('browserifyable-paper');
/**
 * Converts a provided vector item into a drawn representation
 * Assumes a snap-to-center functionallity
 * Sets the pivot point to the base of the vector
 */
function PathDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
    
    this.vectorOnDrag = function (dx, dy) {
    };
}

/**
 * Returns a vector drawn item for the given object
 * Object should have color, an array of points, and a width
 */
PathDrawnItemFactory.prototype.getDrawnItem = function(item) {
    //Group together the head and shaft into one item
    var pathGroup = new paper.Group();
    pathGroup.pivot = new paper.Point(0, 0);
   
    var xyPoints = [];
    //Convert the item's array of u, v points into x, y
    for (var i = 0; i < item.points.length; i++) {
        var pixelCoordinates = this.hexDefinition.getPixelCoordinates(item.points[i][0], item.points[i][1]);
        xyPoints.push([pixelCoordinates.x, pixelCoordinates.y]);
    }
    
    var backgroundPath = new paper.Path({
        segments: xyPoints,
        strokeColor: 'black',
        strokeWidth: item.width+2,
        closed: item.closed
    });
    pathGroup.addChild(backgroundPath);

    var path = new paper.Path({
        segments: xyPoints,
        strokeColor: item.color,
        strokeWidth: item.width,
        closed: item.closed
    });
    pathGroup.addChild(path);
         
    return pathGroup;
};
module.exports = PathDrawnItemFactory;