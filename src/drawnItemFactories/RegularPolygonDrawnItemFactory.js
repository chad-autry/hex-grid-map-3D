"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module RegularPolygonDrawnItemFactory
 */
 
var paper = require('browserifyable-paper');

/**
 * Factory which delegates to the paper.js RegularPoloygon constructor
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 * @see {@link http://paperjs.org/reference/path/#path-regularpolygon-object | RegularPolygon }
 */
module.exports = function RegularPolygonDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
};

/**
 * Return an arrow path item for the given object
 * @override
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.lineColor - The color of the arrow's border
 * @param {Color} item.fillColor - The color to fill this item with
 * @param {integer} item.radius - The radius of the item
 * @param {number} item.sides - The number of sides of the item
 * @param {onClick=} item.onClick - The callback to use when this item is clicked
 * @returns {external:Item} The paper.js Item for the given parameters
 * @implements {DrawnItemFactory#getDrawnItem}
 * @todo consider using symbols for performance
 */
module.exports.prototype.getDrawnItem = function(item) {
 var drawnItem = new paper.Path.RegularPolygon({
     center: [0, 0],
     sides: item.sides,
     radius: item.radius,
     fillColor: item.color,
     strokeColor: 'black'
 });
 drawnItem.scale(1, this.hexDefinition.vScale);
 if (!!item.onClick) {
     drawnItem.onClick = item.onClick;
 }
 return drawnItem;
};
