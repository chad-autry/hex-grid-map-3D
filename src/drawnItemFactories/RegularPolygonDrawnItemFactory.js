"use strict";
var paper = require('browserifyable-paper');
/*
 * This is a drawn item factory which will return RegularPolygons for the input item
 */
function RegularPolygonDrawnItemFactory() {
    
    /**
     * This is the one method required of the factory. Returns the paper.js Item to be drawn for the cellItem
     * My expectation is the application will provide cell items which have the data required to create a paper.js drawn item
     * Maybe they give an SVG image, maybe they provide info to create a regular polygon, maybe they do a mix.
     */
     this.getDrawnItem = function(cellItem) {
         var drawnItem = new paper.Path.RegularPolygon({
             center: [0, 0],
             sides: cellItem.sides,
             radius: cellItem.radius,
             fillColor: cellItem.color,
             strokeColor: 'black'
         });
         drawnItem.scale(1, 0.5);
         return drawnItem;
     };
}

module.exports = RegularPolygonDrawnItemFactory;