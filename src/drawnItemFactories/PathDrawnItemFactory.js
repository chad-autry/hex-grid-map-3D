"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module PathDrawnItemFactory
 */
 
var paper = require('browserifyable-paper');

/**
 * A factory for a path item, such as might represent where a ship has been, or various boundaries
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function PathDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
};

/**
 * Return a path item for the given DTO, includes a 1 pixel black border. The path will go through the center of hexes
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.color - The color of the path
 * @param {integer[][]} item.points - An array of U, V points the path goes through
 * @param {integer} item.width - The width of the path's line
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getDrawnItem = function(item) {

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
