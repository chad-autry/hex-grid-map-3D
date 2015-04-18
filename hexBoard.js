"use strict";
var paper = require('browserifyable-paper');
var sortedSet = require('collections/sorted-set');
var HexDefinition = require('canvas-hexagon');
/*
 * Defines an isometric hexagonal board for web games
 */


/*
 * Constructor for the hex board, accepts all options as a map of parameters
 */
function HexBoard(params) {
    //Protect the constructor from being called as a normal method
    if (!(this instanceof HexBoard)) {
        return new HexBoard(params);
    }
    //Get all the variables which come from the parameters
    
    //The factory which will provide the paper.js Item to draw
    var drawnItemFactory = params.drawnItemFactory;
    var canvas = document.getElementById(params.containerId);

    var gridLineWidth = params.edgeWidth;

    //Add this board as a listener to the cell dataSource. this.onCellDataChanged will be called when items change.
    params.cellDataSource.addListener(this);
    var gridColor = params.hasOwnProperty('gridColor') ? params.gridColor:'silver';
    var stackStep = params.hasOwnProperty('stackStep') ? params.stackStep:5; // the number of pixels to leave between stack items
    var verticalScaling = params.hasOwnProperty('verticalScaling') ? params.verticalScaling:0.5; // The amount to scale the grid by vertically (.5 is traditional "near isometric")
    var hexDimensions = new HexDefinition(params.edgeSize, verticalScaling);
    //Set the background update function if it was passed in
    if(params.hasOwnProperty('updateBackgroundPosition')) {
        this.updateBackgroundPosition = params.updateBackgroundPosition;
    }

    //Set the foreground update function if it was passed in
    if(params.hasOwnProperty('updateForegroundPosition')) {
        this.updateForegroundPosition = params.updateForegroundPosition;
    }


    //Now the board variables which do not comes from the initial params
    var dx = 0; //The current translation in x of the map
    var dy = 0; // the current translation in y of the map
    

    var cellGroupsMap = {}; //empty map object to reference the individual cell groups by co-ordinate
    var cellGroupCompare = function(val1, val2) {
        return val1.zindex - val2.zindex;
    };
    var zindexSplayTree = sortedSet([], function(val1, val2){ return val1.zindex == val2.zindex;},cellGroupCompare); // A search tree used to keep the individual cell groups sorted for insertion into the parent cell group

    //A reference to the board for functions
    var board = this;

    //Setup paper.js
    paper.setup(canvas);

    //Instantiate the groups in the desired z-index order
    var backgroundGroup = new paper.Group();
    var belowGridCellsGroup = new paper.Group(); //When there is a stack some items might be drawn below grid, or if there is a large item (sphere) it might have components drawn above and below
    var gridGroup = new paper.Group();
    var cellsGroup = new paper.Group();
    var foregroundGroup = new paper.Group();

    //Set the group pivot points, else paper.js will try to re-compute it to the center
    backgroundGroup.pivot = new paper.Point(0, 0);
    belowGridCellsGroup.pivot = new paper.Point(0, 0);
    gridGroup.pivot = new paper.Point(0, 0);
    cellsGroup.pivot = new paper.Point(0, 0);
    foregroundGroup.pivot = new paper.Point(0, 0);
    
    //Init the background if there was an init method on the params
    if(params.hasOwnProperty('initBackground')) {
        params.initBackground(paper, backgroundGroup);
    }

    //Init the foreground if there was an init method on the params
    if(params.hasOwnProperty('initForeground')) {
        params.initForeground(paper, foregroundGroup, hexDimensions);
    }

    //TODO Migrate re-setable orientation, perspective, and grid line style to its own method

    //Create the half-hex path which will be duplicated (with different z values) to create the hex grid
    var halfHex = new paper.Group();
    halfHex.pivot = new paper.Point(0,0); //Set the pivot point, else paper.js will try to re-compute it to the center
    var zeroZeroPixelCoordinates = hexDimensions.getPixelCoordinates(0, 0);
    //The first point of each line is the lower "junction" point of the point up hexagon
    //Draw the vertical line first
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_half_wide_width), 
        new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_half_wide_width + 2*hexDimensions.hexagon_scaled_half_edge_size)));
    //Next the bottom right line
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_half_wide_width),
        new paper.Point(zeroZeroPixelCoordinates.x + hexDimensions.hexagon_edge_to_edge_width/2, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_scaled_half_edge_size)));
    //Next the bottom left
    halfHex.addChild(new paper.Path.Line(new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_half_wide_width),
        new paper.Point(zeroZeroPixelCoordinates.x - hexDimensions.hexagon_edge_to_edge_width/2, zeroZeroPixelCoordinates.y + hexDimensions.hexagon_scaled_half_edge_size)));

    halfHex.strokeColor = gridColor;
    halfHex.strokeWidth = params.edgeWidth;
    halfHex.strokeCap = 'square';

    // Create a symbol from the path. Set "don't center" to true. If left default of false, then instances seem to have their co-ordinates recentered to their bounding box
    var halfHexSymbol = new paper.Symbol(halfHex, true);

    //For every hex, place an instance of the symbol. It will fill in the top and left half 3 segments, while the symbols from the 3 adjacent hexes will provide the bottom and right segments
    //Top left hex is 0,0
    var bottomRight = hexDimensions.getReferencePoint( paper.view.size.width, paper.view.size.height);
    var topRight = hexDimensions.getReferencePoint(paper.view.size.width, 0);

    //TODO This loop is assuming default orientation of the grid

    //Note: The (-3) and (+1) values are to give extra slack on the top and bottom for dragging, don't want to see an incomplete grid appear.
    for (var i =  -3; i <= bottomRight.u + 1; i++) {
        //Note: The (-2) and (+2) values are to give extra slack on the left and right for dragging, don't want to see an incomplete grid appear.
        for (var j =  -Math.abs(Math.round(i/2)) - 2; j <= topRight.v - Math.ceil(i/2) + 2; j++) {
            var pixelCoordinates = hexDimensions.getPixelCoordinates(i, j);
            var instance = halfHexSymbol.place();
            instance.pivot = new paper.Point(zeroZeroPixelCoordinates.x, zeroZeroPixelCoordinates.y); //Set the pivot point, Instances do not inherit the parent symbol's pivot!
            instance.position = new paper.Point(pixelCoordinates.x, pixelCoordinates.y);
            gridGroup.addChild(instance);
        }
    }

    //Rasterize the grid to improve performance.
    var raster = gridGroup.rasterize();
    //Normalize the raster's pivot to be the current 0,0 position
    raster.pivot = new paper.Point(0 - raster.position.x, 0 - raster.position.y);

    gridGroup.remove();
    gridGroup = raster;
    paper.view.draw();

    var tool = new paper.Tool();

     //Set up the psuedo drag for the grid
     var down = false;
     var mousemoved = false;
     var latestX=0;
     var latestY=0;
     var clickedY=0;
     var clickedGroup;
     var maxGroupDy = 0;
     var minGroupDy = 0;
     tool.onMouseDown = function(e) {
         down = true;
         var mousemoved = false;
         latestX = e.point.x;
         latestY = e.point.y;
         clickedY = e.point.y;

         if (!!clickedGroup) {
             maxGroupDy = clickedGroup.maxDy - clickedGroup.dy;
             minGroupDy = -clickedGroup.dy;
         }
     };

    var dyModulo = (hexDimensions.hexagon_wide_width + 2*hexDimensions.hexagon_scaled_half_edge_size);
    var dxModulo = hexDimensions.hexagon_edge_to_edge_width;
    tool.onMouseMove = function(e) {
         if (down === false) {
             return;
         }
         

         
         if (!!clickedGroup) {
             //A group is clicked, perform cell item scrolling/dragging
             //TODO Move this to an over-rideable function of the board object
             var dragDy = e.point.y - clickedY;
             var eventDy = e.point.y - latestY;
             latestY = e.point.y;

             //If trying to scroll upwards past original position, stop at original position
             if (dragDy < minGroupDy || clickedGroup.dy + eventDy <= 0) {
                 clickedGroup.position.y = clickedGroup.originalYPosition + dy; //Still setting the position absolutely, not relative to the cell group's group
                 clickedGroup.belowGridGroup.position.y = clickedGroup.position.y;
                 clickedGroup.dy = 0;
             } else if(dragDy > maxGroupDy || clickedGroup.dy + eventDy > clickedGroup.maxDy) {
                 clickedGroup.position.y = clickedGroup.originalYPosition + dy + clickedGroup.maxDy; //Still setting the position absolutely, not relative to the cell group's group
                 clickedGroup.belowGridGroup.position.y = clickedGroup.position.y;
                 clickedGroup.dy = clickedGroup.maxDy;
             } else {
                //Neither too hot, or too cold. Drag the group up or down, and set the item visibillity
                 clickedGroup.position.y = clickedGroup.position.y + eventDy;
                 clickedGroup.belowGridGroup.position.y = clickedGroup.position.y;
                 clickedGroup.dy = clickedGroup.dy + eventDy;
             }
             board.windowCell(clickedGroup);
         } else {
            //general dragging, translate all cell groups. Position the grid to look infinite
             dx = dx + e.point.x - latestX;
             dy = dy + e.point.y - latestY;
             latestX = e.point.x;
             latestY = e.point.y;
             board.updatePostion();
         }
         //paper.view.update();
     };
     
     /**
      * Update x/y positions based on the current dx and dy
      * Will call into the background and foreground update functions
      */
     this.updatePostion = function() {
         belowGridCellsGroup.position.x = dx;
         belowGridCellsGroup.position.y = dy;
         //Modulo the grid position since it is a finite repeating pattern
         gridGroup.position.x = dx%dxModulo;
         gridGroup.position.y = dy%dyModulo;
         cellsGroup.position.x = dx;
         cellsGroup.position.y = dy;
         this.updateBackgroundPosition(backgroundGroup, dx, dy);
         this.updateForegroundPosition(foregroundGroup, dx, dy);
     };
     
     /**
      * Utility function to center the board on a cell
      */
     this.centerOnCell = function(u, v) {
         var pixelCoordinates = hexDimensions.getPixelCoordinates(u, v);
         dx = Math.floor(pixelCoordinates.x + paper.view.size.width/2);
         dy = Math.floor(pixelCoordinates.y + paper.view.size.height/2);
         this.updatePostion();
         var date1 = new Date().getTime();

         paper.view.update();
         var date2 = new Date().getTime();
         document.getElementById("result").innerHTML = "Draw Time: " + (date2 - date1) + " ms";
     };



    /**
     * If someone wants to make a fancier windowing function, this is where to do it
     * Maybe have items split apart on the edges of windowing, maybe have them shrink and grow,
     */
    this.windowCell = function(cellGroup) {
        //re-set items visibillity and opacity
        var windowStartIndex = Math.floor(cellGroup.dy / stackStep);
        var drawnItem = cellGroup.nextDrawnItem;
        for (i = 0; i < cellGroup.drawnItemCount; i++) {
            if (i < windowStartIndex - 5) {
                 //Below the window, and the transition
                drawnItem.visible = false;
            } else if (i > windowStartIndex + 9) {
                //Above the window
                drawnItem.visible = false;
            } else if (i < windowStartIndex) {
                //Ensure a part of the below grid group
                cellGroup.belowGridGroup.addChild(drawnItem);
                //Calculate opacity as a percentage of the pixels till out of the window
                drawnItem.visible = true;
                drawnItem.opacity = (1 - ((cellGroup.dy - i * stackStep) / (stackStep * 6)));
            } else if (i > windowStartIndex + 4) {
                //Ensure a part of the above grid group
                cellGroup.addChild(drawnItem);
                //Calculate opacity as a percentage of the pixels till out of the window
                drawnItem.visible = true;
                drawnItem.opacity = (1 - (((i-4) * stackStep - cellGroup.dy) / (stackStep * 6)));
            } else {
                //Inside the window
                //Ensure a part of the above grid group
                cellGroup.addChild(drawnItem);
                drawnItem.visible = true;
                drawnItem.opacity = 1;
            }
            drawnItem = drawnItem.nextDrawnItem;
        }
    };

    //TODO onMouseOut does not seem to work. However, mouse events still seem to happen when outside of the paper.js view. So the annoying effects onMouseOut was intended to fix don't show up anyways
    tool.onMouseLeave = function(e) {
        if (down === false) {
            return;
        } 
        down = false;
        clickedGroup = null;
        if (mousemoved) {
            return;
        }
    };
    tool.onMouseUp = tool.onMouseLeave;


    /**
     * Called when objects are added to cells, removed from cells, re-ordered in cells,
     */
    this.onCellDataChanged = function(event) {
        var changedGroups = {};
        
        //A reminder for the Author: Javascript variables are not at block level. These variables are used in both loops.
        var i, item, itemGroup, groupKey, cellGroup, drawnItem;
        //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
        //Can do removes individually though

        for (i = 0; i < event.removed.length; i++) {
            item = event.removed[i];
            groupKey = item.u+":"+item.v;
            cellGroup = null;
            if (cellGroupsMap.hasOwnProperty(groupKey)) {
                cellGroup = cellGroupsMap[groupKey];
            }
            if (!cellGroup) {
                //Invalid item! Throw a hissy fit!
                continue;
            }

            drawnItem = cellGroup[item.key];
            drawnItem.remove();
            delete cellGroup[item.key];


            drawnItem.previousDrawnItem.nextDrawnItem = drawnItem.nextDrawnItem;
            drawnItem.nextDrawnItem.previousDrawnItem = drawnItem.previousDrawnItem;


            cellGroup.drawnItemCount--;

            //Clean up and delete the empty cellGroups
            if (cellGroup.drawnItemCount === 0) {
                cellGroup.belowGridGroup.remove();
                cellGroup.remove();
                delete cellGroupsMap[groupKey];
            } else {
                changedGroups[groupKey] = cellGroup;
            }
        }
        
        var cellGroupOnMouseDown = function(e) {
            clickedGroup = this;
        };

        var belowGridCellGroupOnMouseDown = function(e) {
            clickedGroup = this.aboveGridGroup;
        };

        for (i = 0; i < event.added.length; i++) {
            item = event.added[i];
            drawnItem = drawnItemFactory.getDrawnItemForCellItem(item);

            
            //Get the cell group the drawn item should be a part of
            groupKey = item.u+":"+item.v;
            cellGroup = null;
            if (cellGroupsMap.hasOwnProperty(groupKey)) {
                cellGroup = cellGroupsMap[groupKey];
            } else {
                //create the above grid and below grid groups
                //keep most of the meta data attached the the above grid group
                cellGroup = new paper.Group();
                cellGroup.pivot = new paper.Point(0, 0);
                
                //Make a below grid group to handle the Z index of items in the cell below the grid
                var belowGridGroup = new paper.Group();
                belowGridGroup.pivot = new paper.Point(0, 0);
                
                cellGroup.belowGridGroup = belowGridGroup;
                belowGridGroup.aboveGridGroup = cellGroup;
                
                var pixelCoordinates = hexDimensions.getPixelCoordinates(item.u, item.v);
                cellGroup.position = new paper.Point(pixelCoordinates.x + dx, pixelCoordinates.y + dy);
                cellGroupsMap[groupKey] = cellGroup;
                //decorate the cell group with various information we'll need
                cellGroup.mouseDown = false;
                cellGroup.originalXPosition = pixelCoordinates.x;
                cellGroup.originalYPosition = pixelCoordinates.y;
                cellGroup.dy = 0;
                cellGroup.maxDy = 0;
                cellGroup.drawnItemCount = 0;
                
                //Set an on click to the cellGroup to allow for cell item paging/scrolling
                cellGroup.onMouseDown = cellGroupOnMouseDown;
                belowGridGroup.onMouseDown = belowGridCellGroupOnMouseDown;

                //Use a search tree with the unmodified Y co-ord as primary index, and unmodified X coordinate as the secondary
                var zindex = parseFloat(pixelCoordinates.y +"."+pixelCoordinates.x);
                cellGroup.zindex = zindex;
                zindexSplayTree.add(cellGroup);
                //Insert group into cellsGroup before the found child
                var node = zindexSplayTree.findGreatestLessThan({zindex:zindex});
                if (!!node) {
                   cellGroup.insertAbove(node.value);
                   belowGridGroup.insertAbove(node.value.belowGridGroup);
                } else {
                   cellsGroup.insertChild(0, cellGroup);
                   belowGridCellsGroup.insertChild(0, belowGridGroup);
                }
                
                //Set the doubly linked list references, makes a circle with the cellGroup itself as a node. Means don't need to null check
                cellGroup.previousDrawnItem = cellGroup;
                cellGroup.nextDrawnItem = cellGroup;
            }
            changedGroups[groupKey] = cellGroup;
            
            //Update the group with the drawn item, all items get added to the top, so must be above grid
            cellGroup.addChild(drawnItem);
            cellGroup.drawnItemCount++;
            //Some circular logic here. Pun intended
            cellGroup.previousDrawnItem.nextDrawnItem = drawnItem;
            drawnItem.previousDrawnItem = cellGroup.previousDrawnItem;
            cellGroup.previousDrawnItem = drawnItem;

        }
        
        //For each changed group
        for (var key in changedGroups) {
            if (changedGroups.hasOwnProperty(key)) {
                cellGroup = changedGroups[key];
                
                //Figure out the maxDy
                if (cellGroup.drawnItemCount > 5) {
                    cellGroup.maxDy = 5 * (cellGroup.drawnItemCount - 5); //allow to scroll 5 px for each item.outside the allowed window of 5 items

                } else {
                    cellGroup.maxDy = 0;
                }

                if (cellGroup.dy > cellGroup.maxDy) {
                   cellGroup.baseGroup.position.y = cellGroup.baseGroup.position.y - (cellGroup.dy - cellGroup.maxDy);
                   cellGroup.dy = cellGroup.maxDy;
                }
                
                //Reposition each item of the group, according to its index and the new dy
                drawnItem = cellGroup.nextDrawnItem;
                for (i = 0; i < cellGroup.drawnItemCount; i++) {
                    drawnItem.position = new paper.Point(cellGroup.originalXPosition + dx, cellGroup.originalYPosition + dy + cellGroup.dy - stackStep * i);
                    drawnItem = drawnItem.nextDrawnItem;
                }
                
                //Set the transluceny of each item in the group, and put in the appropriate above/below grid Z index group
                board.windowCell(cellGroup);
            }
        }
        paper.view.update();
    
    };
}

/**
 * A stub, the instantiating application should override (or alternatively provide in the params) to implement the desired background changes on grid drag
 */
HexBoard.prototype.updateBackgroundPosition = function(backgroundGroup, dx, dy) {

};

/**
 * A stub, the instantiating application should override (or alternatively provide in the params) to implement the desired foreground changes on grid drag
 */
HexBoard.prototype.updateForegroundPosition = function(foregroundGroup, dx, dy) {

};

module.exports = HexBoard;
