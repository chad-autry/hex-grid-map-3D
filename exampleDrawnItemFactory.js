var paper = require('browserifyable-paper');
/*
 * This is a drawn item factory used for testing and as an example
 */
function exampleDrawnItemFactory() {
    
    /**
     * This is the one method required of the factory. Returns the paper.js Item to be drawn for the cellItem
     * My expectation is the application will provide cell items which have the data required to create a paper.js drawn item
     * Maybe they give an SVG image, maybe they provide info to create a regular polygon, maybe they do a mix.
     */
     this.getDrawnItemForCellItem = function(cellItem) {
         var drawnItem = new paper.Path.RegularPolygon({
             center: [0, 0],
             sides: cellItem.sides,
             radius: cellItem.radius,
             fillColor: cellItem.color,
             strokeColor: 'black'
         });
         drawnItem.scale(1, .5);
         return drawnItem;
     };
     
    /**
     * Need to clean up cached Symbols like I do? Register for cellDataChanged events!
     * Make note that the exampleDrawnItemFactory registers second, so that it is called second on changes
     */
    this.onCellDataChanged = function(event) {
        //TODO Allow transition animations to be implimented for various changes, with examples
    };
};

module.exports = exampleDrawnItemFactory;