var paper = require('browserifyable-paper');
/**
 * Converts a provided vector item into a drawn representation
 * Assumes a snap-to-center functionallity
 * Sets the pivot point to the base of the vector
 */
function VectorDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
    
    this.vectorOnDrag = function (dx, dy) {
    };
}

/**
 * Returns a vector drawn item for the given object
 * Object should have color, sourceU, sourceV, destU, destV, shaftWidth
 */
VectorDrawnItemFactory.prototype.getDrawnItem = function(item) {
    //Group together the head and shaft into one item
    var vectorGroup = new paper.Group();
    vectorGroup.pivot = new paper.Point(0, 0);
   
    //normalize the u, v co-ords
    var normalizedU = item.destU - item.sourceU;
    var normalizedV = item.destV - item.sourceV;
   
    //Get the x, y for the normalized u, v
    var pixelCoordinates = this.hexDefinition.getPixelCoordinates(normalizedU, normalizedV);
    
    
    //Get the angle (clockwise in degrees) of the vector
    var angle = Math.acos(pixelCoordinates.x / (Math.sqrt(pixelCoordinates.x*pixelCoordinates.x + pixelCoordinates.y*pixelCoordinates.y))) * 180 / Math.PI;
    if (pixelCoordinates.y < 0) {
        angle = - angle;
    }
    //First draw the vector in black 1 pixel larger for a border
    var shaftBorder = new paper.Path.Line({
         from: [0, 0],
         to: [pixelCoordinates.x, pixelCoordinates.y],
         strokeColor: 'black',
         strokeCap: 'butt',
         strokeWidth: item.shaftWidth + 2
    });
    
    vectorGroup.addChild(shaftBorder);
    var headBorder = new paper.Path({
        segments: [[-2*item.shaftWidth, 0], [0, 0], [0, -2*item.shaftWidth]],
        strokeColor: 'black',
        strokeWidth: item.shaftWidth + 2,
        strokeCap: 'round'
    });
    headBorder.setPivot(new paper.Point(0, 0));
    headBorder.position.x = pixelCoordinates.x;
    headBorder.position.y = pixelCoordinates.y;
    //already rotated 45 degrees
    headBorder.rotate (angle - 45);
    
    vectorGroup.addChild(headBorder);
    
    var vectorShaft = new paper.Path.Line({
         from: [0, 0],
         to: [pixelCoordinates.x, pixelCoordinates.y],
         strokeColor: item.color,
         strokeCap: 'butt',
         strokeWidth: item.shaftWidth
    });
    vectorGroup.addChild(vectorShaft);

    // The head of the vector
    //Figure out rotation
    var vectorHead = new paper.Path({
        segments: [[-2*item.shaftWidth, 0], [0, 0], [0, -2*item.shaftWidth]],
        strokeColor: item.color,
        strokeWidth: item.shaftWidth,
        strokeCap: 'round'
    });
    vectorHead.setPivot(new paper.Point(0, 0));
    vectorHead.position.x = pixelCoordinates.x;
    vectorHead.position.y = pixelCoordinates.y;
    //already rotated 45 degrees
    vectorHead.rotate (angle - 45);
    //vectorHead.scale(1, 0.5);
    vectorGroup.addChild(vectorHead);
         
         
    return vectorGroup;
};
module.exports = VectorDrawnItemFactory;