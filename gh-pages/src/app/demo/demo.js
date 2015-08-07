var angular = require('angular');
var template = require("./demo.tpl.html");
var ui_router = require('angular-ui-router');
var ui_router_extras_sticky = require('ct.ui.router.extras.sticky');
var hexBoard = require("../../common/hexBoard/hexBoard");
var BackgroundContext = require('../../../../src/contexts/RandomStaryBackgroundContext.js');
var ForegroundContext = require('../../../../src/contexts/LensFlareForegroundContext.js');
var GridContext = require('../../../../src/contexts/GridContext.js');
var CellContext = require('../../../../src/contexts/CellContext.js');
var VectorDrawnItemFactory = require('../../../../src/drawnItemFactories/VectorDrawnItemFactory.js');
var PathDrawnItemFactory = require('../../../../src/drawnItemFactories/PathDrawnItemFactory.js');
var ArrowDrawnItemFactory = require('../../../../src/drawnItemFactories/ArrowDrawnItemFactory.js');
var DelegatingDrawnItemFactory = require('../../../../src/drawnItemFactories/DelegatingDrawnItemFactory.js');
var GridOverlayContext = require('../../../../src/contexts/GridOverlayContext.js');
var DataSource = require('../../../../src/dataSources/DataSource.js');
var CellDrawnItemFactory = require('../../../../src/drawnItemFactories/RegularPolygonDrawnItemFactory');
var SphereDrawnItemFactory = require('../../../../src/drawnItemFactories/SphereDrawnItemFactory');
var HexDefinition = require('cartesian-hexagonal'); //external project required in constructors

module.exports = angular.module( 'hexWidget.demo', [
  ui_router,
  ui_router_extras_sticky,
  hexBoard.name,
  template.name
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'demo', {
    url: '/demo',
    sticky: true,
    views: {
      "demo": {
        controller: 'DemoCtrl',
        templateUrl: 'demo.tpl.html'
      }
    },
    data:{ pageTitle: 'Demo' }
  });
})

.controller( 'DemoCtrl', function DemoCtrl( $scope ) {
    $scope.contexts = [];
    $scope.hexDimensions = new HexDefinition(55, 0.5, 0, 3);
    $scope.contexts.push(new BackgroundContext());
    
    $scope.contexts.push(new GridContext($scope.hexDimensions));
    $scope.contexts.push(new ForegroundContext([{u:0, v:0}], $scope.hexDimensions));
    $scope.cellDataSource = new DataSource();
    $scope.simpleDrawnItemFactory = new CellDrawnItemFactory();
    $scope.sphereDrawnItemFactor = new SphereDrawnItemFactory($scope.hexDimensions);
    $scope.arrowDrawnItemFactory = new ArrowDrawnItemFactory($scope.hexDimensions);
    $scope.cellDrawnItemFactoryMap = {simple: $scope.simpleDrawnItemFactory, sphere: $scope.sphereDrawnItemFactor, arrow: $scope.arrowDrawnItemFactory};
    $scope.cellDrawnItemFactory = new DelegatingDrawnItemFactory($scope.cellDrawnItemFactoryMap);
    $scope.pathDrawnItemFactory = new PathDrawnItemFactory($scope.hexDimensions);
    $scope.cellContext = new CellContext($scope.cellDataSource, $scope.cellDrawnItemFactory, 5, $scope.hexDimensions);
    $scope.contexts.push($scope.cellContext.belowGridContext);
    $scope.contexts.push(new GridContext($scope.hexDimensions));
    $scope.contexts.push($scope.cellContext);
    $scope.contexts.push(new ForegroundContext([{u:0, v:0}], $scope.hexDimensions));
    $scope.gridOverlayDataSource = new DataSource();
    $scope.vectorDrawnItemFactory = new VectorDrawnItemFactory($scope.hexDimensions);
    $scope.gridOverlayDrawnItemFactoryMap = {vector: $scope.vectorDrawnItemFactory, path: $scope.pathDrawnItemFactory};
    $scope.gridOverlayDrawnItemFactory = new DelegatingDrawnItemFactory($scope.gridOverlayDrawnItemFactoryMap);
    $scope.gridOverlayContext = new GridOverlayContext($scope.gridOverlayDataSource, $scope.gridOverlayDrawnItemFactory, $scope.hexDimensions);
    
    $scope.$on('boardInitialized', function() {
        //Once the board has been initialized, setup the demo scene
        
        //Add a star
        //The rotation is the "nearly isometric" converted to radians.
        $scope.cellDataSource.addItems([{type:'sphere', size: 100, rotation: 63.435*(Math.PI/180), lineWidth: 3, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: 'orange', backgroundColor: 'yellow', borderStar: {radius1: 3, radius2: 6, points: 20, borderColor: 'orange'}, u:0, v:0}]);
        
        //Add a sphere to represent earth
        $scope.cellDataSource.addItems([{type:'sphere', size: 66, rotation: 63.435*(Math.PI/180), lineWidth: 3, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: '#653700', backgroundColor: 'blue', borderWidth: 2, borderColor: 'white', u:5, v:5}]);
        
        //Add a sphere to represent the moon
        $scope.cellDataSource.addItems([{type:'sphere', size: 33, rotation: 63.435*(Math.PI/180), lineWidth: 2, greatCircleAngles: [-Math.PI/6, Math.PI/6, Math.PI/2], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6], 
        lineColor: 'grey', backgroundColor: '#E1E1D6', borderWidth: 3, borderColor: 'black', u:3, v:8}]);
        
        
        
        //Add arrows to represent gravity
        //Gravity around the sun
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);
        
        //gravity around the planet
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);
        
        //unfilled gravity around the moon
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 180, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 240, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 300, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 0, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 60, scaleX: 0.75, scaleY:0.75*0.5}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 120, scaleX: 0.75, scaleY:0.75*0.5}]);
        
        //Add a fleet of red 'ships' (triangles) on the dark side of the moon, and a fleet of green ships at the sun
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: 'red', u:2, v:9}]);
        
        //A blue 'space station'
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 5, color: 'blue', u:6, v:5}]);
    });
})

;
