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
      this.priorMapX = e.mapX;
      this.priorMapY = e.mapY;
      this.priorCanvasX = e.canvasX;
      this.priorCanvasY = e.canvasY;
    }
  });
  this.mode = "pan";
  this.zoomMultiplier = 5;
  this.rotateMultiplier = 1 / 500; //should externally set this based on screen size for consistency
  this.board.addListener("mouseDragged", e => {
    if (!e.clickedItem) {
      let dx = 0;
      let dy = 0;
      if (this.mode === "pan") {
        //Find how the camera needs to move, in order to keep the mouse over the same point on the plane
        dx = this.priorMapX - e.mapX;
        dy = this.priorMapY - e.mapY;
        //this.priorMapX = e.mapX;
        //this.priorMapY = e.mapY;
        this.board.pan(dx, dy);
      } else if (this.mode === "tilt") {
        dx = this.priorCanvasX - e.canvasX;
        dy = this.priorCanvasY - e.canvasY;
        this.priorCanvasX = e.canvasX;
        this.priorCanvasY = e.canvasY;
        this.board.tilt(Math.PI * (dx + dy) * this.rotateMultiplier);
      } else if (this.mode === "spin") {
        let dx = this.priorCanvasX - e.canvasX;
        let dy = this.priorCanvasY - e.canvasY;
        this.priorCanvasX = e.canvasX;
        this.priorCanvasY = e.canvasY;
        this.board.spin(Math.PI * (dx + dy) * this.rotateMultiplier);
      } else if (this.mode === "zoom") {
        dx = this.priorCanvasX - e.canvasX;
        dy = this.priorCanvasY - e.canvasY;
        this.priorCanvasX = e.canvasX;
        this.priorCanvasY = e.canvasY;
        this.board.zoom((dx + dy) * this.zoomMultiplier);
      }
    }
  });

  this.setMode = mode => {
    this.mode = mode;
  };
};
