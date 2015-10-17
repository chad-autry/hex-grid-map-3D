"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module FieldOfSquaresDrawnItemFactory
 */
 
var paper = require('browserifyable-paper');

/**
 * Factory which creates a field of squares with some randomness. Ie not patterned. Intended for asteroids or debris fields.
 * Produces 4 squares per hex. Default orientation is point up and point down. Squares are skewed per the perspective
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 * @param {integer} minSize - The minimum size of the squares
 * @param {integer} maxSize - The maximum size of the squares
 * @param {colors} colors - An array of color strings the squares can be
 */
module.exports = function FieldOfSquaresDrawnItemFactory(hexDefinition, minSize, maxSize, colors) {
    this.hexDefinition = hexDefinition;
    this.minSize = minSize;
    this.maxSize = maxSize;
    this.colors = colors;
};

/**
 * Return a group of items representing the field
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {onClick=} item.onClick - The callback to use when this item is clicked
 * @returns {external:Item} The paper.js Group for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 * @todo Make the random numbers seeded, so the same field is produced each time
 */
module.exports.prototype.getDrawnItem = function(item) {
    //Make our group
    var fieldGroup = new paper.Group();
    fieldGroup.pivot = new paper.Point(0, 0);
    fieldGroup.data.item = item;


    //Create 4 random diamonds, each located in 1 quarter of the hex

    //Start with the top left quarter
    fieldGroup.addChild(this.createSquare(-1*this.hexDefinition.hexagon_edge_to_edge_width/2, 0, -1*this.hexDefinition.hexagon_half_wide_width, 0));
    //Next the top right quarter
    fieldGroup.addChild(this.createSquare(0, this.hexDefinition.hexagon_edge_to_edge_width/2, -1*this.hexDefinition.hexagon_half_wide_width, 0));
    //Next bottom right quarter
    fieldGroup.addChild(this.createSquare(0, this.hexDefinition.hexagon_edge_to_edge_width/2, 0 , this.hexDefinition.hexagon_half_wide_width));
    //Finally bottom left quarter
    fieldGroup.addChild(this.createSquare(-1*this.hexDefinition.hexagon_edge_to_edge_width/2, 0, 0,this.hexDefinition.hexagon_half_wide_width));

    //TODO Rasterize the group?
    return fieldGroup;
};

/**
 * Produces a square within the given quarter of the Hex
 * @param {integer} minX - The minimum X coordinate to randomise the square's center
 * @param {integer} maxX - The maximum X coordinate to randomise the square's center
 * @param {integer} minY - The minimum Y coordinate to randomise the square's center
 * @param {integer} maxY - The maximum Y coordinate to randomise the square's center
 * @returns {external:Item} The square to include in the group
 */
module.exports.prototype.createSquare = function (minX, maxX, minY, maxY) {
    var drawnItem;


    var x = this.random(minX, maxX);
    var y = this.random(minY, maxY);
    var hexCoords = this.hexDefinition.getReferencePoint(x, y);
    
    //The randomised co-ordinates have to be within the hex itself
    //TODO There are faster ways to do this.
    while (hexCoords.u !== 0 || hexCoords.v !== 0) {
       x = this.random(minX, maxX);
       y = this.random(minY, maxY);
       hexCoords = this.hexDefinition.getReferencePoint(x, y);
    }

   //Pick a random shade
    var color = this.colors[this.random(0, this.colors.length - 1)];

    //Pick a random size within limits
    var size = this.random(this.minSize, this.maxSize);

    drawnItem = new paper.Path.RegularPolygon({
        center: [x, y],
        sides: 4,
        radius: size,
        fillColor: color,
        strokeColor: 'black'
    });
    //Tried a random rotation, but diamonds were more attractive
    //var rotation = this.random(0, 89); //They're squares. Rotating past 89 is pointless
    drawnItem.rotate(45);
    //Scale it
    drawnItem.scale(1, this.hexDefinition.vScale);
    return drawnItem;
};

/**
 * Helper method for generating a random number
 * @param {integer} min - The minimum number to generate
 * @param {integer} max - The maximum number to generate
 */
module.exports.prototype.random = function (min, max) {
        return Math.round((Math.random() * (max - min)) + min);
};