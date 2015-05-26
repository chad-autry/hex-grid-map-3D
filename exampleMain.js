var Board = require('./hexBoard.js');
var BackgroundContext = require('./exampleBackgroundContext.js');
var ForegroundContext = require('./exampleForegroundContext.js');
var GridContext = require('./GridContext.js');
var CellContext = require('./CellContext.js');
var VectorDrawnItemFactory = require('./VectorDrawnItemFactory.js');
var PathDrawnItemFactory = require('./PathDrawnItemFactory.js');
var DelegatingDrawnItemFactory = require('./DelegatingDrawnItemFactory.js');
var GridOverlayContext = require('./GridOverlayContext.js');
var DataSource = require('./DataSource.js');
var CellDrawnItemFactory = require('./exampleDrawnItemFactory');
var SphereDrawnItemFactory = require('./SphereDrawnItemFactory');
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
    var cellDrawnItemFactoryMap = {simple: simpleDrawnItemFactory, sphere: sphereDrawnItemFactor};
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
        cellDataSource.addItems([{type:'sphere', size: 100, rotation: 63.435*(Math.PI/180), lineWidth: 3, greatCircleAngles: [0, Math.PI/4, -Math.PI/4], latitudeAngles: [Math.PI/8, Math.PI/4, -Math.PI/8], lineColor: 'yellow', backgroundColor: 'black', u:0, v:0}]);
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