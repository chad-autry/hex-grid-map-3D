"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DrawnItemContext
 */
 
var paper = require('browserifyable-paper');

/**
 * A generic context that draws items from the provided dataSource using the provided factory
 * Can do paths, vectors, badges and more without needing to impliment a new context
 * @implements {Context}
 * @constructor
 * @param {module:DataSource} dataSource - The source of item DTOs to draw
 * @param {DrawnItemFactory} drawnItemFactory - The factory which produces the paper.js representation of the dataSource items
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function DrawnItemContext(dataSource, drawnItemFactory, hexDimensions) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof DrawnItemContext)) {
        return new DrawnItemContext(dataSource, drawnItemFactory, hexDimensions);
    }
    var context = this;
    this.dataSource = dataSource;
    this.drawnItemFactory = drawnItemFactory;
    this.hexDimensions = hexDimensions;
    this.dx = 0;
    this.dy = 0;
    this.drawnItemCache = {};

    //Add this as a listener to the dataSource. this.onDataChanged will be called when items change.
    dataSource.addListener(this);
    
    // Documentation inherited from Context#init
    this.init = function(group) {
        context.group = group;
    };

    // Documentation inherited from Context#mouseDown
    this.mouseDown = function(clickedX, clickedY) {
        //Hit test for items
        var result = context.group.hitTest(new paper.Point(clickedX, clickedY));
        if (result) {
            context.clickedItem = result.item.parent;
            return true;
            //Check if the clickedItem is one the layer claims further mouse events for
        }
        return;
        
    };

    /**
     * Method called to update the position of the global view, either through drags or programmatic manpulation
     */
    this.updatePosition = function( dx, dy) {
        context.group.position.x = dx;
        context.group.position.y = dy;
        context.dx = dx;
        context.dy = dy;
    };

    // Documentation inherited from Context#mouseDragged
    this.mouseDragged = function( x, y, eventDx, eventDy) {
        context.clickedItem.data.onDrag( x, y, eventDx, eventDy, context.dx, context.dy);
    };
};


/**
 * Called when objects are added to datasource, removed from datasource, re-ordered in datasource,
 */
module.exports.prototype.onDataChanged = function(event) {

    //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
    var i, item, itemGroup, groupKey, cellGroup, drawnItem;
    //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
    //Can do removes individually though

    for (i = 0; i < event.removed.length; i++) {
        item = event.removed[i];
        drawnItem = this.drawnItemCache[item.id];
        drawnItem.remove();
        delete this.drawnItemCache[item.id];
    }

    for (i = 0; i < event.added.length; i++) {
        item = event.added[i];
        
        drawnItem = this.drawnItemFactory.getDrawnItem(item);
        this.drawnItemCache[item.id] = drawnItem;
        var sourcePixelCoordinates = this.hexDimensions.getPixelCoordinates(item.sourceU, item.sourceV);
        this.group.addChild(drawnItem);
    }

    paper.view.update();
};