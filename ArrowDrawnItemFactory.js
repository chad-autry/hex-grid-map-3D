var paper = require('browserifyable-paper');
/**
 * Creates an arrow drawn item, such as might represent gravity
 */
function ArrowDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;

}

/**
 * Return an arrow path item for the given object
 */
ArrowDrawnItemFactory.prototype.getDrawnItem = function(item) {

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
             arrow.rotate(item.rotation);
             arrow.scale(item.scaleX, item.scaleY);
    return arrow;
    
    
};

module.exports = ArrowDrawnItemFactory;
