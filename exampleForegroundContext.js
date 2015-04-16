var paper = require('browserifyable-paper');
/**
 * This is an example context with methods to draw and update the foreground of a hexBoard
 * Drawing lens flare for use with space games, something different such as clouds could be implimented.
 */
 
/**
 * The context object constructor, pass in an array of u, v points
 */
function exampleForegroundContext(points) {
    var context = this;
    context.points = points;

    /**
     * The method to be passed to the hex board to instantiate (or re-instantiate) the foreground
     */
    this.initForeground = function(paper, foregroundGroup, hexDimensions) {
        context.flares = [];
        for (var i = 0; i < context.points.length; i++) {
            context.flares[i] = {};
            //create 3 shapes for each point
            // first one is the smallest and closest, to the light source. Make it 1 hex in large
            var xyPoint = hexDimensions.getPixelCoordinates(context.points[i].u, context.points[i].v);
            context.flares[i].xyOrigin = xyPoint;
            //Unskew the hex size from the dimensions
            context.flares[i].flareOne = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 2*hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareOne.fillColor = '#fefcaf';
            context.flares[i].flareOne.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareOne);
            
            context.flares[i].flareTwo = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 2*2*hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareTwo.fillColor = '#feff7f';
            context.flares[i].flareTwo.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareTwo);
            
            context.flares[i].flareThree = new paper.Path.RegularPolygon(new paper.Point(xyPoint.x, xyPoint.y), 6, 3*2*hexDimensions.hexagon_half_wide_width);
            context.flares[i].flareThree.fillColor = '#fffd37';
            context.flares[i].flareThree.opacity = 0.5;
            foregroundGroup.addChild(context.flares[i].flareThree);
        }
        this.updateForegroundPosition(foregroundGroup, 0, 0);
    };

    /**
     * The method to be passed to the hex board which will be called on drags to update the foreground
     */
    this.updateForegroundPosition = function(foregroundGroup, dx, dy) {
        //Update the position of the individual flares for each flare set
        for (var i = 0; i < context.flares.length; i++) {
            var flare = context.flares[i];
            var xFromMid = -(paper.view.size.width / 2) + dx + context.flares[i].xyOrigin.x;
            var yFromMid = -(paper.view.size.height / 2) + dy + context.flares[i].xyOrigin.y;
            context.flares[i].flareOne.position = new paper.Point(paper.view.size.width / 2 - xFromMid, paper.view.size.height / 2 - yFromMid);
            context.flares[i].flareTwo.position = new paper.Point(paper.view.size.width / 2 - 2*xFromMid, paper.view.size.height / 2 - 2*yFromMid);
            context.flares[i].flareThree.position = new paper.Point(paper.view.size.width / 2 - 3*xFromMid, paper.view.size.height / 2 - 3*yFromMid);
        }
    };
}

module.exports = exampleForegroundContext;