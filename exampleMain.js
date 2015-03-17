var Board = require('./hexBoard.js');
var BackgroundContext = require('./exampleBackgroundContext.js');
var CellDataSource = require('./baseCellDataSource.js');
var DrawnItemFactory = require('./exampleDrawnItemFactory');

var ExampleContext = function() {
    var context = this;
    var board;
    var cellDataSource;
    var backgroundContext = new BackgroundContext();
    var container = document.getElementById("myBoard");
    cellDataSource = new CellDataSource();
    var drawnItemFactory = new DrawnItemFactory();
    var items = [];
    var keyId = 0;

    this.onLoad = function() {
        board = new Board({containerId:"myBoard", edgeSize:55, edgeWidth:3, width:900, height:800, cellDataSource: cellDataSource, drawnItemFactory: drawnItemFactory,
        initBackground:backgroundContext.initBackground, updateBackgroundPosition: backgroundContext.updateBackgroundPosition});

        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'purple', u:1, v:1}, {radius: 30, sides: 3, color: 'red', u:1, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 5, color: 'purple', u:1, v:0}, {radius: 30, sides: 9, color: 'red', u:0, v:1}]);
        cellDataSource.addItems([{radius: 30, sides: 6, color: 'purple', u:4, v:2}, {radius: 30, sides: 3, color: 'red', u:5, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 7, color: 'purple', u:1, v:0}, {radius: 30, sides: 4, color: 'red', u:0, v:4}]);
        cellDataSource.addItems([{radius: 30, sides: 8, color: 'purple', u:1, v:5}, {radius: 30, sides: 6, color: 'red', u:3, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
        cellDataSource.addItems([{radius: 30, sides: 3, color: 'green', u:1, v:0}, {radius: 30, sides: 3, color: 'blue', u:6, v:0}]);
    };


    this.addItem = function() {
        var item = {radius: 30, sides: 3, color: 'blue', u:0, v:0, key: 'test' + keyId++};
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