"use strict";
/**
 * Since only a single constructor is being exported as module.exports this comment isn't documented.
 * The class and module are the same thing, the contructor comment takes precedence.
 * @module RandomStaryBackgroundContext
 */
 
var paper = require('browserifyable-paper');
 
/** 
 * The constructor of a context object to generate a random stary background.
 * This is an example context with methods to draw and update the background of a hexBoard
 * Drawing a starry background, since I'm personally interested in making a space game.
 * However, you could draw water or clouds if doing an ocean or flight game
 * @implements {Context}
 * @constructor
 * @todo This context is a bit hard coded for the demo, needs to be made more useful
 */
 module.exports = function RandomStaryBackgroundContext() {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof RandomStaryBackgroundContext)) {
        return new RandomStaryBackgroundContext();
    }
    var context = this;

    // Documentation inherited from Context#init
    this.init = function(backgroundGroup) {
        //Create a stationary background of dimmer, denser stars
        var farLayer = context.createStarGroup(0.5, 1.1, paper.view.size.width, paper.view.size.height, 1000);
        backgroundGroup.addChild(farLayer);
        
        //Create a parallax background of fewer, brighter stars. Make it 4 times the view window in size
        var nearLayer = context.createStarGroup(1, 2.1, 4*paper.view.size.width, 4*paper.view.size.height, 1000);
        nearLayer.position.x = -0.5*paper.view.size.width;
        nearLayer.position.y = -0.5*paper.view.size.height;
        backgroundGroup.addChild(nearLayer);
        context.nearLayer = nearLayer;
    };

    // Documentation inherited from Context#updatePosition
    this.updatePosition = function(dx, dy) {
        //Scroll more slowly than the grid, and cap out position. Don't want to bother generating an infinite star field, most of the action will be in the middle
        if (dx > 0) {
            context.nearLayer.position.x = Math.min( -0.5*paper.view.size.width + dx / 10, 0);
        } else {
            context.nearLayer.position.x = Math.max( -0.5*paper.view.size.width + dx / 10, -paper.view.size.width);
        }

        if (dy > 0) {
            context.nearLayer.position.y = Math.min( -0.5*paper.view.size.height + dy / 10, 0);
        } else {
            context.nearLayer.position.y = Math.max( -0.5*paper.view.size.height + dy / 10, -paper.view.size.height);
        }
    };
    
    this.reDraw = function(screenResized, mapRotated, mapScaled) {
        //Eh, don't do anything yet. Only screen resized implemented which this context doesn't care about
    };
};

/**
 * Helper method for generating a random number
 * @param {integer} min - The minimum number to generate
 * @param {integer} max - The maximum number to generate
 */
module.exports.prototype.random = function (min, max) {
        return Math.round((Math.random() * max - min) + min);
};

module.exports.prototype.STAR_COLOURS = ["#ffffff", "#ffe9c4", "#d4fbff"];

/**
 * Heleper method to create the star group with some variables
 * @ param {integer} maxBrightness - Controls how bright the stars can be
 * @ param {integer} maxBrightness - Controls how large the stars can be
 * @ param {integer} width - The width of the rectangle to generate stars for
 * @ param {integer} height - The height of the rectangle to generate stars for
 * @ param {integer} star_number - The number of stars to generate
 */
module.exports.prototype.createStarGroup = function( maxBrightness, maxRadius, width, height, star_number) {
    var starGroup = new paper.Group();
    starGroup.pivot = new paper.Point(0, 0);
    var x, // x position of the star
    y; // y position of the star
 	 
    for (var i = 0; i < star_number; i++) {
        x = Math.random() * width; // random x position
        y = Math.random() * height; // random y position
 
        var star = new paper.Shape.Circle(new paper.Point(x, y), Math.random() * maxRadius);
        star.fillColor = this.STAR_COLOURS[this.random(0,this. STAR_COLOURS.length)];
        starGroup.addChild(star);
    }
    var starRaster = starGroup.rasterize();
    starGroup.remove();
    starRaster.pivot = new paper.Point(0 - starRaster.position.x, 0 - starRaster.position.y);
    return starRaster;
};

// Documentation inherited from Context#mouseDown
module.exports.prototype.mouseDown = function( x, y) {
    //This is nothing to click, always return false
    return false;
};

// Documentation inherited from Context#mouseDragged
module.exports.prototype.mouseDragged = function( x, y, dx, dy) {
    //We never claim mouseDown, so this actually will never be called
};

// Documentation inherited from Context#mouseReleased
module.exports.prototype.mouseReleased = function(wasDrag) {
    //We never claim mouseDown, so this actually will never be called
};