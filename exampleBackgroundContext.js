var paper = require('browserifyable-paper');
/**
 * This is an example context with methods to draw and update the background of a hexBoard
 * Drawing a starry background, since I'm personally interested in making a space game.
 * However, you could draw water or clouds if doing an ocean or flight game
 */
 
/**
 * The context object constructor
 */
function exampleBackgroundContext() {
    var context = this;

    /**
     * The method to be passed to the hex board to instantiate (or re-instantiate) the background
     */
    this.initBackground = function(paper, backgroundGroup) {
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

    /**
     * The method to be passed to the hex board which will be called on drags to update the background
     */
    this.updateBackgroundPosition = function(backgroundGroup, dx, dy) {
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
}

/**
 * Generate a random integer between min and max
 */
exampleBackgroundContext.prototype.random = function (min, max) {
        return Math.round((Math.random() * max - min) + min);
};

exampleBackgroundContext.prototype.STAR_COLOURS = ["#ffffff", "#ffe9c4", "#d4fbff"];

/**
 * Helper method, generates a raster containing randomly generated stars*
 */
exampleBackgroundContext.prototype.createStarGroup = function( maxBrightness, maxRadius, width, height, star_number) {
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

module.exports = exampleBackgroundContext;