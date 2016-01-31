"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module CellContext
 */
 
/**

 */
 
/**
 * This is the context object which manages the items in their cells
 * Unlike other contexts, it has two layers it manages, above grid and below grid
 * Produce a Context object for the belowgrid group and mouse interaction
 * @implements {Context}
 * @constructor
 * @param {CellDataSource} cellDataSource - The dataSource of items to draw
 * @param {DrawnItemFactory} drawnItemFactory - The factory which controls how items are drawn
 * @param {integer} stackStep - The distance in pixels to keep between items
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function CellContext(drawnItemFactory, stackStep, hexDimensions) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof CellContext)) {
        return new CellContext(drawnItemFactory, stackStep);
    }
    var context = this;
    this.drawnItemFactory = drawnItemFactory;
    this.dx = 0;
    this.dy = 0;
    this.stackStep = stackStep;
    this.hexDimensions = hexDimensions;
    this.cellGroupsMap = {}; //empty map object to reference the individual cell groups by co-ordinate

    // Documentation inherited from Context#init
    this.init = function(scene) {
        context.scene = scene;
    };
    

    // Documentation inherited from Context#mouseDown
    this.mouseDown = function(clickedX, clickedY) {
         var mousePickResult = context.scene.pick(clickedX, clickedY,
               function(mesh) {
                   return !!mesh.isCellItem;
               });
         if (mousePickResult.hit) {
             this.clickedItem = mousePickResult.pickedMesh;
             return true;
         }
    };


    // Documentation inherited from Context#updatePosition
    this.updatePosition = function( middleX, middleY) {
        //Do nothing, the camera moves and the world stay stationary
    };
    
    // Documentation inherited from Context#mouseDragged
    this.mouseDragged = function( x, y, eventDx, eventDy) {
        //Don't have any logic to directlly drag cell items
    };
    

    
    // Documentation inherited from Context#mouseReleased
    this.mouseReleased = function(wasDrag) {
        if (!wasDrag && this.clickedItem.data.item.hasOwnProperty('onClick')) {
            this.clickedItem.data.item.onClick();
        }
    };
    
    // Documentation inherited from Context#reDraw
    this.reDraw = function(screenResized, mapRotated, mapScaled) {
        //Eh, don't do anything yet. Only screen resized implemented which this context doesn't care about
    };
    
    this.setDataSource = function(dataSource) {
        this.dataSource = dataSource;
        var context = this;
        dataSource.addListener('dataChanged', function(event){context.onDataChanged.call(context, event);});
    };
};

/**
 * Called when objects are added to cells, removed from cells, re-ordered in cells,
 */
module.exports.prototype.onDataChanged = function(event) {
    var changedGroups = {};

    //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
    var i, item, itemGroup, groupKey, cellGroup, drawnItem;
    //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
    //Can do removes individually though

    for (i = 0; i < event.removed.length; i++) {
        item = event.removed[i];
        groupKey = item.u+":"+item.v;
        cellGroup = null;
        if (this.cellGroupsMap.hasOwnProperty(groupKey)) {
            cellGroup = this.cellGroupsMap[groupKey];
        }
        if (!cellGroup) {
            //Invalid item! Throw a hissy fit!
            continue;
        }

        drawnItem = cellGroup.data.drawnItems[item.key];
        drawnItem.dispose();
        delete cellGroup.data.drawnItems[item.key];

        drawnItem.previousDrawnItem.nextDrawnItem = drawnItem.nextDrawnItem;
        drawnItem.nextDrawnItem.previousDrawnItem = drawnItem.previousDrawnItem;


        cellGroup.drawnItemCount--;

        //Clean up and delete the empty cellGroups
        if (cellGroup.drawnItemCount === 0) {
            delete this.cellGroupsMap[groupKey];
        } else {
            changedGroups[groupKey] = cellGroup;
        }
    }

    for (i = 0; i < event.added.length; i++) {
        item = event.added[i];
        drawnItem = this.drawnItemFactory.getDrawnItem(item, this.scene);
        drawnItem.isCellItem = true;
        if (!drawnItem) {
            //There is no capabillity to draw the item
            continue;
        }
            var pixelCoordinates = this.hexDimensions.getPixelCoordinates(item.u, item.v);
            drawnItem.position.x = pixelCoordinates.x;
            drawnItem.position.y = pixelCoordinates.y;
        //Get the cell group the drawn item should be a part of
        groupKey = item.u+":"+item.v;
        cellGroup = null;
        if (this.cellGroupsMap.hasOwnProperty(groupKey)) {
                cellGroup = this.cellGroupsMap[groupKey];
        } else {
            //create the group
            //keep most of the meta data attached the the above grid group
            cellGroup = {};
            cellGroup.data = {};

            this.cellGroupsMap[groupKey] = cellGroup;
                //decorate the cell group with various information we'll need
            cellGroup.mouseDown = false;
            cellGroup.drawnItemCount = 0;

            //Use a search tree with the unmodified Y co-ord as primary index, and unmodified X coordinate as the secondary
            var zindex = parseFloat(pixelCoordinates.y +"."+pixelCoordinates.x);
            cellGroup.zindex = zindex;

            //Set the doubly linked list references, makes a circle with the cellGroup itself as a node. Means don't need to null check
            cellGroup.previousDrawnItem = cellGroup;
            cellGroup.nextDrawnItem = cellGroup;
            
            //Prepare the map of drawn items by id
            cellGroup.data.drawnItems = {};
        }
        changedGroups[groupKey] = cellGroup;

        //Update the group with the drawn item, all items get added to the top, so must be above grid
        cellGroup.drawnItemCount++;
        //Map the drawn items by id so they can be removed
        if (!!item.key) {
            cellGroup.data.drawnItems[item.key] = drawnItem;
        }

        //Some circular logic here. Pun intended
        cellGroup.previousDrawnItem.nextDrawnItem = drawnItem;
        drawnItem.previousDrawnItem = cellGroup.previousDrawnItem;
        cellGroup.previousDrawnItem = drawnItem;
        drawnItem.nextDrawnItem = cellGroup;
    }

    //For each changed group
    for (var key in changedGroups) {
        if (changedGroups.hasOwnProperty(key)) {
            cellGroup = changedGroups[key];

            //Reposition each item of the group, according to its index
            drawnItem = cellGroup.nextDrawnItem;
            for (i = 0; i < cellGroup.drawnItemCount; i++) {
                    drawnItem.position.z = this.stackStep * i;
                    drawnItem = drawnItem.nextDrawnItem;
            }
        }
    }
};