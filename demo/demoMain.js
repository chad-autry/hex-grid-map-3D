"use strict";
var Board = require('../src/HexBoard.js');
var BackgroundContext = require('../src/contexts/BackgroundContext.js');
var ForegroundContext = require('../src/contexts/ForegroundContext.js');
var GridContext = require('../src/contexts/GridContext.js');
var CellContext = require('../src/contexts/CellContext.js');
var VectorDrawnItemFactory = require('../src/drawnItemFactories/VectorDrawnItemFactory.js');
var PathDrawnItemFactory = require('../src/drawnItemFactories/PathDrawnItemFactory.js');
var ArrowDrawnItemFactory = require('../src/drawnItemFactories/ArrowDrawnItemFactory.js');
var DelegatingDrawnItemFactory = require('../src/drawnItemFactories/DelegatingDrawnItemFactory.js');
var GridOverlayContext = require('../src/contexts/GridOverlayContext.js');
var DataSource = require('../src/dataSources/DataSource.js');
var CellDrawnItemFactory = require('../src/drawnItemFactories/RegularPolygonDrawnItemFactory');
var SphereDrawnItemFactory = require('../src/drawnItemFactories/SphereDrawnItemFactory');
var HexDefinition = require('canvas-hexagon');

var ExampleContext = function() {
    var hexDimensions = new HexDefinition(55, 0.5);
    var context = this;
    var board;
    var backgroundContext = new BackgroundContext();
    var foregroundContext = new ForegroundContext([{u:0, v:0}]);
    var gridContext = new GridContext();
    var container = document.getElementById("myBoard");
    var cellDataSource = new DataSource();
    var simpleDrawnItemFactory = new CellDrawnItemFactory();
    var sphereDrawnItemFactor = new SphereDrawnItemFactory(hexDimensions);
    var arrowDrawnItemFactory = new ArrowDrawnItemFactory(hexDimensions);
    var cellDrawnItemFactoryMap = {simple: simpleDrawnItemFactory, sphere: sphereDrawnItemFactor, arrow: arrowDrawnItemFactory};
    var cellDrawnItemFactory = new DelegatingDrawnItemFactory(cellDrawnItemFactoryMap);
    var pathDrawnItemFactory = new PathDrawnItemFactory(hexDimensions);
    var cellContext = new CellContext(cellDataSource, cellDrawnItemFactory, 5);
    var gridOverlayDataSource = new DataSource();
    var vectorDrawnItemFactory = new VectorDrawnItemFactory(hexDimensions);
    var gridOverlayDrawnItemFactoryMap = {vector: vectorDrawnItemFactory, path: pathDrawnItemFactory};
    var gridOverlayDrawnItemFactory = new DelegatingDrawnItemFactory(gridOverlayDrawnItemFactoryMap);
    var gridOverlayContext = new GridOverlayContext(gridOverlayDataSource, gridOverlayDrawnItemFactory, hexDimensions);
    var items = [];
    var keyId = 0;

    this.onLoad = function() {
        board = new Board(hexDimensions, {containerId:"myBoard", edgeWidth:3, width:900, height:800,
        initBackground:backgroundContext.initBackground, updateBackgroundPosition: backgroundContext.updateBackgroundPosition,
        initForeground:foregroundContext.initForeground, updateForegroundPosition: foregroundContext.updateForegroundPosition,
        initGrid: gridContext.initGrid, updateGridPosition: gridContext.updateGridPosition}, cellContext, gridOverlayContext);


        cellDataSource.addItems([{type:'arrow', u: 0, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: -1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: -1, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 0, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 1, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);
        
        cellDataSource.addItems([{type:'arrow', u: 5, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 4, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 4, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 5, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 6, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 6, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);
        
        cellDataSource.addItems([{type:'arrow', u: 3, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 2, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 2, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 3, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 4, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        cellDataSource.addItems([{type:'arrow', u: 4, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);

        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'purple', u:1, v:1}, {type:'simple', radius: 30, sides: 3, color: 'red', u:1, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 5, color: 'purple', u:1, v:0}, {type:'simple', radius: 30, sides: 9, color: 'red', u:0, v:1}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 6, color: 'purple', u:4, v:2}, {type:'simple', radius: 30, sides: 3, color: 'red', u:5, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 7, color: 'purple', u:1, v:0}, {type:'simple', radius: 30, sides: 4, color: 'red', u:0, v:4}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 8, color: 'purple', u:1, v:5}, {type:'simple', radius: 30, sides: 6, color: 'red', u:3, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        
        cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:6, v:-4}]);
        
        gridOverlayDataSource.addItems([{id: 'path1', type:'vector', shaftWidth: 5, color: 'green', sourceU: 6, sourceV: -4, destU: 5, destV: -2}]);
        
        gridOverlayDataSource.addItems([{id: 'path2', type:'path', width: 5, color: 'blue', points:[[0,0],[0,3],[1,5]]},
                                        {id: 'path3', type:'path', width: 5, color: 'purple', points:[[0,0],[1,3],[1,5]]}]);
        gridOverlayDataSource.removeItems([{id: 'path2', type:'path', width: 5, color: 'blue', points:[[0,0],[0,3],[1,5]]}]);
        
        
        //The rotation is the "nearly isometric" converted to radians.
        cellDataSource.addItems([{type:'sphere', size: 100, rotation: 63.435*(Math.PI/180), lineWidth: 3, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: 'orange', backgroundColor: 'yellow', borderStar: {radius1: 3, radius2: 6, points: 20, borderColor: 'orange'}, u:0, v:0}]);
        
        
        cellDataSource.addItems([{type:'sphere', size: 66, rotation: 63.435*(Math.PI/180), lineWidth: 3, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: '#653700', backgroundColor: 'blue', borderWidth: 2, borderColor: 'white', u:5, v:5}]);
        cellDataSource.addItems([{type:'sphere', size: 33, rotation: 63.435*(Math.PI/180), lineWidth: 2, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: 'grey', backgroundColor: '#E1E1D6', borderWidth: 3, borderColor: 'black', u:3, v:8}]);
        
        
    };
    

    this.addItem = function() {
        var item = {type:'simple', radius: 30, sides: 3, color: 'blue', u:-1, v:0, key: 'test' + keyId++};
        items.push(item);
        cellDataSource.addItems([item]);
    };
    this.removeItem = function() {
        var item = items.pop();
        cellDataSource.removeItems([item]);
    };
    this.centerOnCell = function(u, v) {
        board.centerOnCell(u, v);
    };
};

module.exports = ExampleContext;