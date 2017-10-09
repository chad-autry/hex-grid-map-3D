"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module CellContext
 */

/**
 * This is the context object which manages the click interaction of Cell items
 * @implements {Context}
 * @constructor
 * @param {CellDataSource} cellDataSource - The dataSource of items to draw
 */
module.exports = function CellContext() {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof CellContext)) {
    return new CellContext();
  }
  var context = this;

  // Documentation inherited from Context#init
  this.init = function(scene) {
    context.scene = scene;
  };

  // Documentation inherited from Context#mouseDown
  this.mouseDown = function(clickedX, clickedY) {
    var mousePickResult = context.scene.pick(clickedX, clickedY, function(
      mesh
    ) {
      return !!mesh.isCellItem;
    });
    if (mousePickResult.hit) {
      this.clickedItem = mousePickResult.pickedMesh;
      return true;
    }
  };

  // Documentation inherited from Context#updatePosition
  this.updatePosition = function() {
    //Do nothing, the camera moves and the world stay stationary
  };

  // Documentation inherited from Context#mouseDragged
  this.mouseDragged = function(screenX, screenY, planarX, planarY) {
    if (this.clickedItem.data.item.onDrag) {
      this.clickedItem.data.item.onDrag(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    }
  };

  // Documentation inherited from Context#mouseReleased
  this.mouseReleased = function(screenX, screenY, planarX, planarY, wasDrag) {
    if (!wasDrag && !!this.clickedItem.data.item.onClick) {
      this.clickedItem.data.item.onClick(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    } else if (wasDrag && !!this.clickedItem.data.item.onRelease) {
      this.clickedItem.data.item.onRelease(
        screenX,
        screenY,
        planarX,
        planarY,
        this.clickedItem
      );
    }
  };

  /*
     * Listen for added items which can claim the mouse down for dragging
     */
  this.setDataSource = function(dataSource) {
    this.dataSource = dataSource;
    var context = this;
    dataSource.addListener("dataChanged", function(event) {
      for (var i = 0; i < event.added.length; i++) {
        if (event.added[i].isCellItem && !!event.added[i].data.item.dragged) {
          //The item was 'dragged' into existence and should take over the mouse interaction
          context.clickedItem = event.added[i];
        }
      }
    });
  };
};
