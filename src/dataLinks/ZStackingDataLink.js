"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module ZStackingDataLink
 */
 
 var makeDataLink = require('data-chains/src/DataLinkMixin');
 
/**
 * This DataLink expects events with meshes, it will stack the meshes (Z height) which are in the same U, V cell
 * @constructor
 * @param {integer} stackStep - The distance in pixels to keep between items
 */
module.exports = function ZStackingDataLink(stackStep) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof ZStackingDataLink)) {
        return new ZStackingDataLink(stackStep);
    }
    this.stackStep = stackStep;
    makeDataLink.call(this);
    this.meshMap = {};
    this.cellGroupsMap = {};
};

module.exports.prototype.onDataChanged = function(event) {

    var i, mesh, item, groupKey, cellGroup;
    //TODO, do removed first
    //TODO Then do updated
    for (i = 0; i < event.added.length; i++) {
        mesh = event.added[i];
        item = mesh.data.item;
        groupKey = item.u+":"+item.v;
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

            //Set the doubly linked list references, makes a circle with the cellGroup itself as a node. Means don't need to null check
            cellGroup.previousDrawnItem = cellGroup;
            cellGroup.nextDrawnItem = cellGroup;
            
            //Set it up so the base item will be a z = 0
            cellGroup.position = {};
            cellGroup.position.z = -1 * this.stackStep;
        }
        mesh.position.z = cellGroup.previousDrawnItem.position.z + this.stackStep;
        
        //Some circular logic here. Pun intended
        cellGroup.previousDrawnItem.nextDrawnItem = mesh;
        mesh.previousDrawnItem = cellGroup.previousDrawnItem;
        cellGroup.previousDrawnItem = mesh;
        mesh.nextDrawnItem = cellGroup;
        
        
        
    }
    
    this.emitEvent('dataChanged', [{added:event.added, removed:event.removed, updated:event.updated}]);
};

module.exports.prototype.setScene = function(scene) {
    this.scene = scene;
};



