"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ArrowDrawnItemFactory
 */
var paper = require('browserifyable-paper');
/**
 * Factory for creating arrow drawn items, such as might represent gravity
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function ArrowDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;

};

/**
 * Return an arrow path item for the given object
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {integer} item.lineWidth - The extra width of the arrows border
 * @param {Color} item.lineColor - The color of the arrow's border
 * @param {Color} item.fillColor - The color to fill this item with
 * @param {integer} item.rotate - The angle in degrees to rotate, 0 degrees points ???
 * @param {number} item.scaleLength - Scale to make longer or shorter arrows, (0, 1]
 * @param {number} item.scaleWidth - Scale to make skinnier or thicker arrows, (0, 1]
 * @param {onClick=} item.onClick - The callback to use when clicking the arrow
 * @returns {external:Item} The paper.js Item representing the arrow
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getDrawnItem = function(item) {

    var arrow = new paper.Path({
                segments: [[-this.hexDefinition.hexagon_edge_to_edge_width/2, 0], //left pointy point
             [0, -2*this.hexDefinition.hexagon_half_wide_width], //up and right
             [0, -this.hexDefinition.edgeSize/2], //stright down
             [this.hexDefinition.hexagon_edge_to_edge_width/2, -this.hexDefinition.edgeSize/2], //right
             [this.hexDefinition.hexagon_edge_to_edge_width/2, this.hexDefinition.edgeSize/2], //down
             [0, this.hexDefinition.edgeSize/2], //left
             [0, 2*this.hexDefinition.hexagon_half_wide_width]], //down
             fillColor: item.fillColor,
             strokeWidth: item.lineWidth,
             strokeColor: item.lineColor,
             closed: true});
             arrow.scale(item.scaleLength, item.scaleWidth);
             arrow.rotate(item.rotation);
             arrow.scale(1, this.hexDefinition.vScale);
    arrow.data.item = item;
    return arrow;
};

