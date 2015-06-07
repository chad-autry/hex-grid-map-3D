"use strict";
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
   
    //Get the x, y for the vector
    var sourcePixelCoordinates = this.hexDefinition.getPixelCoordinates(item.sourceU, item.sourceV);
    var destPixelCoordinates = this.hexDefinition.getPixelCoordinates(item.destU, item.destV);
    var normalizedPixelCoordinates = {x: destPixelCoordinates.x - sourcePixelCoordinates.x, y: destPixelCoordinates.y - sourcePixelCoordinates.y};
    
    //Get the angle (clockwise in degrees) of the vector
    var angle = Math.acos(normalizedPixelCoordinates.x / (Math.sqrt(normalizedPixelCoordinates.x*normalizedPixelCoordinates.x + normalizedPixelCoordinates.y*normalizedPixelCoordinates.y))) * 180 / Math.PI;
    if (normalizedPixelCoordinates.y < 0) {
        angle = - angle;
    }
    //First draw the vector in black 1 pixel larger for a border
    var shaftBorder = new paper.Path.Line({
         from: [sourcePixelCoordinates.x, sourcePixelCoordinates.y],
         to: [destPixelCoordinates.x, destPixelCoordinates.y],
         strokeColor: 'black',
         strokeCap: 'butt',
         strokeWidth: item.shaftWidth + 2
    });
    vectorGroup.data.shaftBorder = shaftBorder;
    
    vectorGroup.addChild(shaftBorder);
    var headBorder = new paper.Path({
        segments: [[-2*item.shaftWidth, 0], [0, 0], [0, -2*item.shaftWidth]],
        strokeColor: 'black',
        strokeWidth: item.shaftWidth + 2,
        strokeCap: 'round'
    });
    headBorder.setPivot(new paper.Point(0, 0));
    headBorder.position.x = destPixelCoordinates.x;
    headBorder.position.y = destPixelCoordinates.y;
    //already rotated 45 degrees
    headBorder.rotate (angle - 45);
    
    vectorGroup.addChild(headBorder);
    vectorGroup.data.headBorder = headBorder;
    
    var vectorShaft = new paper.Path.Line({
         from: [sourcePixelCoordinates.x, sourcePixelCoordinates.y],
         to: [destPixelCoordinates.x, destPixelCoordinates.y],
         strokeColor: item.color,
         strokeCap: 'butt',
         strokeWidth: item.shaftWidth
    });
    vectorGroup.addChild(vectorShaft);
    vectorGroup.data.vectorShaft = vectorShaft;

    // The head of the vector
    //Figure out rotation
    var vectorHead = new paper.Path({
        segments: [[-2*item.shaftWidth, 0], [0, 0], [0, -2*item.shaftWidth]],
        strokeColor: item.color,
        strokeWidth: item.shaftWidth,
        strokeCap: 'round'
    });
    vectorHead.setPivot(new paper.Point(0, 0));
    vectorHead.position.x = destPixelCoordinates.x;
    vectorHead.position.y = destPixelCoordinates.y;
    //already rotated 45 degrees
    vectorHead.rotate (angle - 45);
    //vectorHead.scale(1, 0.5);
    vectorGroup.addChild(vectorHead);
    vectorGroup.data.vectorHead = vectorHead;
    //Will be used to test if the click was near enough to the head
    vectorGroup.data.isDrag = function(x, y) {
        return true;
    };
    
    vectorGroup.data.lastRotation = angle;
         
    vectorGroup.data.onDrag = function(x, y, eventDx, eventDy, dx, dy) {
        var normalizedX = x - this.shaftBorder.firstSegment.point.x;
        var normalizedY = y - this.shaftBorder.firstSegment.point.y;
        //Get the angle (clockwise in degrees) of the vector
        var angle = Math.acos(normalizedX / (Math.sqrt(normalizedX*normalizedX + normalizedY*normalizedY))) * 180 / Math.PI;
        if (normalizedY < 0) {
            angle = - angle;
        }

        this.shaftBorder.firstSegment.next.point.x = x;
        this.shaftBorder.firstSegment.next.point.y = y;
        this.headBorder.rotate(angle - this.lastRotation);
        this.headBorder.position.x = x;
        this.headBorder.position.y = y;
        this.vectorShaft.firstSegment.next.point.x = x;
        this.vectorShaft.firstSegment.next.point.y = y;
        this.vectorHead.rotate(angle - this.lastRotation);
        this.vectorHead.position.x = x;
        this.vectorHead.position.y = y;
        this.lastRotation = angle;
        
    };
         
    return vectorGroup;
};
module.exports = VectorDrawnItemFactory;