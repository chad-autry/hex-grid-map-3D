var paper = require('browserifyable-paper');
/**
 * This is the context which managed the overlay items that appear right on top of the grid
 * The most generic of all the contexts, delegates to the drawnItemFactory for most everything. 
 * //TODO maybe the foreground and background could be handled similarlly?
 */
 
/**
 * The context object constructor
 */
function GridOverlayContext(overlayDataSource, drawnItemFactory, hexDimensions) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof GridOverlayContext)) {
        return new GridOverlayContext(params);
    }
    var context = this;
    this.overlayDataSource = overlayDataSource;
    this.drawnItemFactory = drawnItemFactory;
    this.hexDimensions = hexDimensions;
    this.dx = 0;
    this.dy = 0;


    //Add this as a listener to the overlay dataSource. this.onOverlayDataChanged will be called when items change.
    overlayDataSource.addListener(this);
    /**
     * The method to be passed to the hex board to instantiate (or re-instantiate) the background
     */
    this.init = function(gridOverlayGroup) {
        context.gridOverlayGroup = gridOverlayGroup;
    };

    /**
     * The method called on mouse down, to hit check the above grid items
     * Return true if claiming further drag/mouseup events
     */
    this.onMouseDown = function(clickedX, clickedY) {
        //Hit test for items
        var clickedItem = context.gridOverlayGroup.hitTest(new paper.Point(clickedX, clickedY));
        if (clickedItem) {
            //Check if the clickedItem is one the layer claims further mouse events for
        }
        return;
        
    };

    /**
     * Method called to update the position of the global view, either through drags or programmatic manpulation
     */
    this.updatePosition = function( dx, dy) {
        context.gridOverlayGroup.position.x = dx;
        context.gridOverlayGroup.position.y = dy;
        context.dx = dx;
        context.dy = dy;
    };

    /**
     * The method called when the user drags the mouse, and this context has claimed that drag
     */
    this.mouseDragged = function( x, y, eventDx, eventDy, dx, dy) {

    };
}


/**
 * Called when objects are added to datasource, removed from datasource, re-ordered in datasource,
 */
GridOverlayContext.prototype.onDataChanged = function(event) {

    //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
    var i, item, itemGroup, groupKey, cellGroup, drawnItem;
    //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
    //Can do removes individually though

    for (i = 0; i < event.removed.length; i++) {
        item = event.removed[i];
        drawnItem = this.drawnItemFactory.getDrawnItem(item);
        var sourcePixelCoordinates = this.hexDimensions.getPixelCoordinates(item.sourceU, item.sourceV);
        drawnItem.position.x = this.dx + sourcePixelCoordinates.x;
        drawnItem.position.y = this.dy + sourcePixelCoordinates.y;
        this.gridOverlayGroup.addChild(drawnItem);

    }

    for (i = 0; i < event.added.length; i++) {
        item = event.added[i];
        drawnItem = this.drawnItemFactory.getDrawnItem(item);
        var sourcePixelCoordinates = this.hexDimensions.getPixelCoordinates(item.sourceU, item.sourceV);
        drawnItem.position.x = this.dx + sourcePixelCoordinates.x;
        drawnItem.position.y = this.dy + sourcePixelCoordinates.y;
        this.gridOverlayGroup.addChild(drawnItem);
    }

    paper.view.update();
};

module.exports = GridOverlayContext;