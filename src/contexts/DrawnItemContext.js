"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module DrawnItemContext
 */

/**
 * A generic context that draws items from the provided dataSource using the provided factory with no special interactions
 * Can do paths, vectors, badges and more without needing to impliment a new context
 * @implements {Context}
 * @constructor
 * @param {module:DataSource} dataSource - The source of item DTOs to draw
 * @param {DrawnItemFactory} drawnItemFactory - The factory which produces the paper.js representation of the dataSource items
 * @param {external:cartesian-hexagonal} hexDimensions - The DTO defining the hex <--> cartesian relation
 */
module.exports = function DrawnItemContext(drawnItemFactory, hexDimensions) {
  //Protect the constructor from being called as a normal method
  if (!(this instanceof DrawnItemContext)) {
    return new DrawnItemContext(drawnItemFactory, hexDimensions);
  }
  var context = this;
  this.drawnItemFactory = drawnItemFactory;
  this.hexDimensions = hexDimensions;
  this.dx = 0;
  this.dy = 0;
  this.drawnItemCache = {};

  // Documentation inherited from Context#init
  this.init = function(scene) {
    context.scene = scene;
  };

  // Documentation inherited from Context#mouseDown
  this.mouseDown = function(clickedX, clickedY) {
    var mousePickResult = context.scene.pick(clickedX, clickedY, function(
      mesh
    ) {
      return !!mesh.isGenericContextItem;
    });
    if (mousePickResult.hit) {
      context.clickedItem = mousePickResult.pickedMesh;
      return true;
    }
  };

  /**
     * Method called to update the position of the global view, either through drags or programmatic manpulation
     */
  this.updatePosition = function() {
    //Do nothing, the camera moves and the world stay stationary
  };

  // Documentation inherited from Context#mouseDragged
  this.mouseDragged = function(x, y, eventDx, eventDy) {
    if (context.clickedItem.data.hasOwnProperty("onDrag")) {
      context.clickedItem.data.onDrag(x, y, eventDx, eventDy);
    }
  };

  // Documentation inherited from Context#mouseReleased
  this.mouseReleased = function(wasDrag) {
    if (!wasDrag && context.clickedItem.data.item.hasOwnProperty("onClick")) {
      context.clickedItem.data.item.onClick();
    }
  };

  // Documentation inherited from Context#reDraw
  this.reDraw = function() {
    //Eh, don't do anything yet. Only screen resized implemented which this context doesn't care about
  };

  this.setDataSource = function(dataSource) {
    this.dataSource = dataSource;
    var context = this;
    dataSource.addListener("dataChanged", function(event) {
      context.onDataChanged.call(context, event);
    });
  };
};

/**
 * Called when objects are added to datasource, removed from datasource, re-ordered in datasource,
 */
module.exports.prototype.onDataChanged = function(event) {
  //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
  var i, item, drawnItem;
  //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
  //Can do removes individually though

  for (i = 0; i < event.removed.length; i++) {
    item = event.removed[i];
    drawnItem = this.drawnItemCache[item.id];
    drawnItem.dispose();
    delete this.drawnItemCache[item.id];
  }

  for (i = 0; i < event.added.length; i++) {
    item = event.added[i];

    drawnItem = this.drawnItemFactory.getDrawnItem(item, this.scene);
    if (item.hasOwnProperty("sourceU")) {
      var sourcePixelCoordinates = this.hexDimensions.getPixelCoordinates(
        item.sourceU,
        item.sourceV
      );
      drawnItem.position.x = sourcePixelCoordinates.x;
      drawnItem.position.y = sourcePixelCoordinates.y;
    }
    drawnItem.isGenericContextItem = true;
    this.drawnItemCache[item.id] = drawnItem;
  }
};
