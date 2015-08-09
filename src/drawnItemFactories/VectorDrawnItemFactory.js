"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module VectorDrawnItemFactory
 */
 
var paper = require('browserifyable-paper');

/**
 * A factory to create the paper.js items for vectors
 * @constructor
 * @param {external:cartesian-hexagonal} hexDefinition - The DTO defining the hex <--> cartesian relation
 */
module.exports = function VectorDrawnItemFactory(hexDefinition) {
    this.hexDefinition = hexDefinition;
};

/**
 * Returns a vector drawn item for the given object
 * @param {Object} item - The DTO to produce a paper.js drawn item for
 * @param {Color} item.color - The color of the vector
 * @param {number} item.sourceU - The U coordinate of the vector source
 * @param {number} item.sourceV - The V coordinate of the vector source
 * @param {number} item.destU - The U coordinate of the vector destination
 * @param {number} item.destV - The V coordinate of the vector destination
 * @param {number} item.shaftWidth - The thickness of the vector
 * @param {string} item.id - The id to use for removals
 * @param {onDrag=} item.onDrag - The callback to use when dragging the vector
 * @param {onClick=} item.onClick - The callback to use when clicking the vector
 * @returns {external:Item} The paper.js Item representing the vector
 * @implements {DrawnItemFactory#getDrawnItem}
 */
module.exports.prototype.getDrawnItem = function(item) {
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
    if (!!item.onDrag) {
        vectorGroup.data.item = item;
        vectorGroup.data.onDrag = function(x, y, eventDx, eventDy) {
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
            vectorGroup.data.item.onDrag(x, y, eventDx, eventDy);
        };
    }
    vectorGroup.data.item = item;
    return vectorGroup;
};