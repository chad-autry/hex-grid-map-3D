/*
 * Defines an isometric hexagonal board for web games
 */
 
 
 /*
  * Constructor for the hex board, accepts all options as a map of parameters
  */
function hexBoardDefinition(params) {

    //Add this board as a listener to the cell dataSource. this.onCellDataChanged will be called when items change.
    params.cellDataSource.addListener(this);
    
    //Get the factory which will provide the paper.js Item to draw
    var drawnItemFactory = params.drawnItemFactory;

     // having an edge width be a multiple of 5 makes for integer co-ordinates
     var hexDimensions = new hexDefinition(params.edgeSize)
     var rotation = 0;
     var dx = 0; //The current translation in x of the map
     var dy = 0; // the current translation in y of the map
     var stackStep = 5;// the number of pixels to leave between stack items //TODO let the spacing be specified by instantiating app, modify for perspective
     var gridLineWidth = params.edgeWidth;
     var cellData;
     var gridColor='silver'; //TODO let let style be supplied by instantiating app
     var paths; //Paths which can be drawn on the board
     var cellGroupsMap = {}; //empty map object to reference the cell groups from
     var zindexSplayTree = new SplayTree(); // A search tree used to keep the s groups sorted for insertion into the cell group

     var canvas = document.getElementById(params.containerId);

    var board = this;

     paper.setup(canvas);

     //Instantiate the groups in the desired z-index order
     var gridGroup = new paper.Group;
     var cellsGroup = new paper.Group;

     //Set the pivot points, else paper.js will try to re-compute it to the center
     gridGroup.pivot = new paper.Point(0, 0);
     cellsGroup.pivot = new paper.Point(0, 0);

    //TODO Migrate re-setable orientation, perspective, and grid line style to its own method

    //TODO See if rasterizing the hex grid improves performance
    //Create the half-hex path which will be duplicated (with different z values) to create the hex grid
    var halfHex = new paper.Path();
    halfHex.pivot = new paper.Point(0,0); //Set the pivot point, else paper.js will try to re-compute it to the center
    halfHex.add(new paper.Point(0, 0));
    halfHex.add(new paper.Point(0, -hexDimensions.edgeSize));
    halfHex.add(new paper.Point(hexDimensions.hexagon_height/2, -(hexDimensions.edgeSize + hexDimensions.h)));
    halfHex.add(new paper.Point(hexDimensions.hexagon_height, -hexDimensions.edgeSize));
    
    halfHex.strokeColor = gridColor;
    halfHex.strokeWidth = params.edgeWidth;

    //Note: Since paper.js is SVG based, this scaling is of the path co-ordinates, but does not scale the line width (the angles do not become thinner than the verticals)
    halfHex.scale(1, .5); //TODO Provide feature to set dimetric/isometric scaling

    //Re-position so the hex is centered on 0,0 and not an intersection TODO the scaling parameter in on Y
    halfHex.position = new paper.Point(-hexDimensions.hexagon_height/2, (hexDimensions.edgeSize/2)/2);

    // Create a symbol from the path. Set "don't center" to true. If left default of false, then instances seem to have their co-ordinates recentered to their bounding box
    var halfHexSymbol = new paper.Symbol(halfHex, true);

    //Create a duplicate looking set of segments to use to overlay groups so their items appear to go below gridlines
    var overHex = new paper.Group;
    overHex.pivot = new paper.Point(0,0); //Set the pivot point, else paper.js will try to re-compute it to the center
    overHex.addChild(new paper.Path.Line(new paper.Point(0, 0), new paper.Point(0, hexDimensions.edgeSize)));
    overHex.addChild(new paper.Path.Line(new paper.Point(0, 0), new paper.Point(hexDimensions.hexagon_height/2, -hexDimensions.h)));
    overHex.addChild(new paper.Path.Line(new paper.Point(0, 0), new paper.Point(-hexDimensions.hexagon_height/2, -hexDimensions.h)));
    
    overHex.strokeColor = gridColor;
    overHex.strokeWidth = params.edgeWidth;
    //Note: Since paper.js is SVG based, this scaling is of the path co-ordinates, but does not scale the line width (the angles do not become thinner than the verticals)
    overHex.scale(1, .5); //TODO Provide feature to set dimetric/isometric scaling

    //Re-position so the hex is centered on 0,0 and not an intersection TODO the scaling parameter in on Y
    overHex.position = new paper.Point(0, (hexDimensions.hexagon_wide_width/2)/2);

    // Create a symbol from the path. Set "don't center" to true. If left default of false, then instances seem to have their co-ordinates recentered to their bounding box
    var overHexSymbol = new paper.Symbol(overHex, true);

    //TODO Provide feature to set dimetric/isometric scaling (the Y dimension from getPixelCoordinaes is divided by 2, and the Y dimension of getReferenePoint is multiplied by 2)
    //For every hex, place an instance of the symbol. It will fill in the top and left half 3 segments, while the symbols from the 3 adjacent hexes will provide the bottom and right segments
    //Top left hex is 0,0
    var bottomRight = hexDimensions.getReferencePoint( paper.view.size.width,2*paper.view.size.height);
    var topRight = hexDimensions.getReferencePoint(paper.view.size.width, 0);

    
    
    //TODO This loop is assuming default orientation of the grid

    //Note: The (+2) and (-2) values are to give extra slack around the edges for scrolling, don't want to see an incomplete grid appear
    for (var i =  -2; i <= bottomRight.u + 2; i++) {
        for (var j =  -Math.abs(Math.round(i/2)) - 2; j < topRight.v - Math.ceil(i/2) + 2; j++) {
            var pixelCoordinates = hexDimensions.getPixelCoordinates(i, j);
            pixelCoordinates.y = pixelCoordinates.y/2
            var instance = halfHexSymbol.place();
            instance.pivot = new paper.Point(0,0); //Set the pivot point, Instances do not inherit the parent symbol's pivot!
            instance.position = new paper.Point(pixelCoordinates.x, pixelCoordinates.y);
            gridGroup.addChild(instance);
        }
    }
    
    paper.view.draw();
    
    
    var tool = new paper.Tool();

    
     //Set up the psuedo drag for the grid
     var down = false;
     var mousemoved = false;
     latestX=0;
     latestY=0;
     clickedY=0;
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

    //TODO Impliment configurable isometric/diametric angles. The division by 2 is to support traditional game diametric (nearly isometric)
    var dyModulo = (hexDimensions.hexagon_wide_width + hexDimensions.edgeSize)/2;
    tool.onMouseMove = function(e) {
         if (down == false) {
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
                 clickedGroup.baseGroup.position.y = clickedGroup.originalYPosition + dy; //Still setting the position absolutely, not relative to the cell group's group
                 clickedGroup.dy = 0;
             } else if(dragDy > maxGroupDy || clickedGroup.dy + eventDy > clickedGroup.maxDy) {
                 clickedGroup.baseGroup.position.y = clickedGroup.originalYPosition + dy + clickedGroup.maxDy; //Still setting the position absolutely, not relative to the cell group's group
                 clickedGroup.dy = clickedGroup.maxDy;
             } else {
                //Neither too hot, or too cold. Drag the group up or down, and set the item visibillity
             	clickedGroup.baseGroup.position.y = clickedGroup.baseGroup.position.y + eventDy;
             	clickedGroup.dy = clickedGroup.dy + eventDy;

             	board.windowCell(clickedGroup);
             }
             
         } else {
            //general dragging, translate all cell groups. Position the grid to look infinite
             dx = dx + e.point.x - latestX;
	     dy = dy + e.point.y - latestY;
	     latestX = e.point.x;
             latestY = e.point.y;
             //document.getElementById("result").innerHTML += "dx:"+dx+" dy:"+dy;
             //TODO The modulo operations assume a pointy side up orientation
             gridGroup.position.x = dx%hexDimensions.hexagon_height;
             gridGroup.position.y = dy%dyModulo;
             cellsGroup.position.x = dx;
             cellsGroup.position.y = dy;
         }
         //paper.view.update();
     };
     
     
     /**
      * If someone wants to make a fancier windowing function, this is where to do it
      * Maybe have items split apart on the edges of windowing, maybe have them shrink and grow,
      */
     this.windowCell = function(cellGroup) {
             	
	//TODO hard coded windowing for the hard coded 5 px split
	//re-set items visibillity and opacity
	var windowStartIndex = Math.floor(cellGroup.dy / 5);
	var itemGroup = cellGroup.childGroup;
	for (var i = 0; i < cellGroup.drawnItemCount; i++) {
	    if (i < windowStartIndex - 5) {
		//Below the window, and the transition
		itemGroup.drawnItem.visible = false;
	    } else if (i == windowStartIndex - 1) {
		//Single translucent item below the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .9;
	    } else if (i == windowStartIndex - 2) {
		//Single translucent item below the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .7;
	    } else if (i == windowStartIndex - 3) {
		//Single translucent item below the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .5;
	    } else if (i == windowStartIndex - 4) {
		//Single translucent item below the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .3;
	    } else if (i == windowStartIndex - 5) {
		//Single translucent item below the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .1;
	    } else if (i > windowStartIndex + 10) {
		//Above the window
		itemGroup.drawnItem.visible = false;
	    } else if (i == windowStartIndex + 6) {
		//Single translucent item above the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .9;
	    } else if (i == windowStartIndex + 7) {
		//Single translucent item above the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .7;
	    } else if (i == windowStartIndex + 8) {
		//Single translucent item above the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .5;
	    } else if (i == windowStartIndex + 9) {
		//Single translucent item above the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .3;
	    } else if (i == windowStartIndex + 10) {
		//Single translucent item above the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = .1;
	    } else {
		//Inside the window
		itemGroup.drawnItem.visible = true;
		itemGroup.drawnItem.opacity = 1;
	    }
	    itemGroup = itemGroup.childGroup;
	}
     };
     
     //TODO onMouseOut does not seem to work. However, mouse events still seem to happen when outside of the paper.js view. So the annoying effects onMouseOut was intended to fix don't show up anyways
     tool.onMouseLeave = function(e) {
         if (down == false) {
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
     *Called when objects are added to cells, removed from cells, re-ordered in cells, 
     */
    this.onCellDataChanged = function(event) {
        //TODO Allow transition animations to be implimented for various changes, with examples.
        
        //Currentlly cell moves are done by re-adding an item with new cell co-ordinates, no z-index param, need to add/re-add all items in the desired order
        //Can do removes individually though

        for (var i = 0; i < event.removed.length; i++) {
            var item = event.removed[i];
            var groupKey = item.u+":"+item.v;
            var cellGroup;
            if (cellGroupsMap.hasOwnProperty(groupKey)) {
                cellGroup = cellGroupsMap[groupKey];
            }
            if (!cellGroup) {
                //Invalid item! Throw a hissy fit!
                continue;
            }
            var itemGroup = cellGroup[item.key];
            //Clean up the reference
            //delete cellGroup[item.key];
            var parentGroup = itemGroup.parent;
            if (itemGroup.children.length == 2) {
                //The itemGroup has both an item and a child,
                itemGroup.children[1].position = itemGroup.position;
                parentGroup.addChild(itemGroup.children[1]);
                itemGroup.remove();
                
            } else {
                //This item had been the tail group
                cellGroup.tailGroup = parentGroup;
                itemGroup.remove();
            }
            
            cellGroup.drawnItemCount--;
            //TODO Hard coding the windowing here. It will work with my example drawn item factory, but might not work with other's customizations
            if (cellGroup.drawnItemCount > 5) {
            	cellGroup.maxDy = 5 * (cellGroup.drawnItemCount - 5); //allow to scroll 5 px for each item.outside the allowed window of 5 items
                board.windowCell(cellGroup);
                if (cellGroup.dy > cellGroup.maxDy) {
                   cellGroup.baseGroup.position.y = cellGroup.baseGroup.position.y - (cellGroup.dy - cellGroup.maxDy);
                   cellGroup.dy = cellGroup.maxDy;
                }
            } else if (cellGroup.drawnItemCount == 5) {
            	//We can no longer scroll the items,
            	cellGroup.maxDy = 0;
            	if (cellGroup.dy > cellGroup.maxDy) {
		    cellGroup.baseGroup.position.y = cellGroup.baseGroup.position.y - (cellGroup.dy - cellGroup.maxDy);
		    cellGroup.dy = cellGroup.maxDy;
                }
            } 
            board.windowCell(cellGroup);
            
        }

        for (var i = 0; i < event.added.length; i++) {
            var item = event.added[i];
            var drawnItem = drawnItemFactory.getDrawnItemForCellItem(item);
            var itemGroup = new paper.Group;
            itemGroup.pivot = new paper.Point(0, 0);
            itemGroup.addChild(drawnItem);
            itemGroup.drawnItem = drawnItem;
            //Save where the next item in the cell should go relative to this item
            //TODO Add in the item's height. Do so according to the perspective (the items from the test all have 0 height)
            itemGroup.telescopePoint = new paper.Point(0, -stackStep);
            
            //Get the cell group the drawn item should be a part of
            var groupKey = item.u+":"+item.v;
            var cellGroup;
            if (cellGroupsMap.hasOwnProperty(groupKey)) {
                cellGroup = cellGroupsMap[groupKey];
            } else {
                //create group
                cellGroup = new paper.Group;
                cellGroup.pivot = new paper.Point(0, 0);
                cellGroup.tailGroup = cellGroup;
                cellGroup.telescopePoint = new paper.Point(0, 0);
                
                var pixelCoordinates = hexDimensions.getPixelCoordinates(item.u, item.v);
                cellGroup.position = new paper.Point(pixelCoordinates.x + dx, pixelCoordinates.y/2 + dy);
                cellGroupsMap[groupKey] = cellGroup;
                //decorate the cell group with various information we'll need
                cellGroup.mouseDown = false;
                cellGroup.originalYPosition = pixelCoordinates.y/2;
                cellGroup.dy = 0;
                cellGroup.maxDy = 0;
                cellGroup.drawnItemCount = 0;
                
                //Set an on click to the cellGroup to allow for cell item paging/scrolling
                cellGroup.onMouseDown = function(e) {
		    clickedGroup = this;
                };

                //Use a search tree with the unmodified Y co-ord as primary index, and unmodified X coordinate as the secondary
                zindex = parseFloat(pixelCoordinates.y +"."+pixelCoordinates.x);
                zindexSplayTree.insert(zindex, cellGroup);
                //Insert group into cellsGroup before the found child
                var node = zindexSplayTree.findGreatestLessThan(zindex);
                if (!!node) {
                   cellGroup.insertAbove(node.value);
                } else {
                   cellsGroup.insertChild(0, cellGroup);
                }
                
                var instance = overHexSymbol.place();
		instance.pivot = new paper.Point(0,0); //Set the pivot point, Instances do not inherit the parent symbol's pivot!
                instance.position = cellGroup.position;
                cellGroup.addChild(instance);
                cellGroup.overHex = instance;
            }
            
            //add the itemGroup with the item's key to the cellgroup so it can be removed easily
            cellGroup[item.key] = itemGroup;
            
            //add the drawnItem, to the tail of the telescope chain,
            cellGroup.tailGroup.addChild(itemGroup);
            cellGroup.drawnItemCount++;
            
            if (cellGroup.drawnItemCount == 1) {
                cellGroup.baseGroup = itemGroup;
            }

            //set the position to where the telescope group says it should go. Paper.js positions aren't relative, though further translation will be applied to both parent and child
            itemGroup.position = new paper.Point(cellGroup.tailGroup.telescopePoint.x + cellGroup.tailGroup.position.x, 
                cellGroup.tailGroup.telescopePoint.y + cellGroup.tailGroup.position.y);
            //set the item group as the new group
            cellGroup.tailGroup.childGroup = itemGroup;
            cellGroup.tailGroup = itemGroup;
            
            //TODO Hard coding the windowing here. It will work with my example drawn item factory, but might not work with other's customizations
            if (cellGroup.drawnItemCount > 5) {
            	cellGroup.maxDy = 5 * (cellGroup.drawnItemCount - 5); //allow to scroll 5 px for each item.outside the allowed window of 5 items
                board.windowCell(cellGroup);
            } else {
                cellGroup.maxDy = 0;   
            }
            cellGroup.overHex.bringToFront();
        }
        paper.view.update();
    
    }
};


/*
 * This function defines the base datasource for cell items. Expect client applications to impliment their own datasources which will listen to this one, and add filtering/sorting etc
 */
function baseCellDataSource() {
    var listeners = []; //The listeners registered for change events
    var items = []; //The data items

    this.addListener = function(listener) {
        listeners.push(listener);
    }
    
    this.addItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
	    listeners[i].onCellDataChanged({added:items, removed:[]});
        }
    }

    this.removeItems = function(items) {
        for (var i = 0; i < listeners.length; i++) {
	    listeners[i].onCellDataChanged({added:[], removed:items});
        }
    }
};


/*
 * This is a temporary drawnItemFactory for testing. Will move to its own file so it need not be included in apps which impliment their own
 */
function exampleDrawnItemFactory() {
    
    /**
     * This is the one method required of the factory. Returns the paper.js Item to be drawn for the cellItem
     * My expectation is the application will provide cell items which have the data required to create a paper.js drawn item
     * Maybe they give an SVG image, maybe they provide info to create a regular polygon, maybe they do a mix.
     */
     this.getDrawnItemForCellItem = function(cellItem) {
         var drawnItem = new paper.Path.RegularPolygon({
             center: [0, 0],
             sides: cellItem.sides,
             radius: cellItem.radius,
             fillColor: cellItem.color,
             strokeColor: 'black'
         });
         drawnItem.scale(1, .5);
         return drawnItem;

     }

    /**
     * Need to clean up cached Symbols like I do? Register for cellDataChanged events!
     * Make note that the exampleDrawnItemFactory registers second, so that it is called second on changes
     */
    this.onCellDataChanged = function(event) {
        //TODO Allow transition animations to be implimented for various changes, with examples
    
    }
};