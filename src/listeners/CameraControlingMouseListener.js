"use strict";

/**
 * Listens to mouse events on the given board, and calls in to change the boards camera
 */
module.exports = function CameraControllingMouseListener(board) {
  if (!(this instanceof CameraControllingMouseListener)) {
    return new CameraControllingMouseListener(board);
  }
  this.board = board;
  this.board.addListener("mouseDown", e => {
    if (!e.clickedItem) {
      this.mouseDownX = e.mapX;
      this.mouseDownY = e.mapY;
    }
  });
  this.board.addListener("mouseDragged", e => {
    if (!e.clickedItem) {
      //Find how the camera needs to move, in order to keep the mouse over the same point on the plane
      let dx = this.mouseDownX - e.mapX;
      let dy = this.mouseDownY - e.mapY;

      this.board.pan(dx, dy);
    }
  });
};
