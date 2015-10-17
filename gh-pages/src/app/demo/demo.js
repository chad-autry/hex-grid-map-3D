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
var DrawnItemContext = require('../../../../src/contexts/DrawnItemContext.js');
var DataSource = require('../../../../src/dataSources/DataSource.js');
var CellDrawnItemFactory = require('../../../../src/drawnItemFactories/RegularPolygonDrawnItemFactory');
var SphereDrawnItemFactory = require('../../../../src/drawnItemFactories/SphereDrawnItemFactory');
var FieldOfSquaresDrawnItemFactory = require('../../../../src/drawnItemFactories/FieldOfSquaresDrawnItemFactory');
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

.controller( 'DemoCtrl', function DemoCtrl( $scope, $rootScope ) {
    $scope.contexts = [];
    $scope.hexDimensions = new HexDefinition(55, 0.5, 0, 3);
    $scope.contexts.push(new BackgroundContext());
    
    //Create the cell items datasource, drawnItemFactories, and special compound contex
    $scope.cellDataSource = new DataSource();
    $scope.simpleDrawnItemFactory = new CellDrawnItemFactory($scope.hexDimensions);
    $scope.sphereDrawnItemFactor = new SphereDrawnItemFactory($scope.hexDimensions);
    $scope.arrowDrawnItemFactory = new ArrowDrawnItemFactory($scope.hexDimensions);
    
    //For Asteroids we use brown grey, brownish grey, greyish brown, grey brown. For debris would probablly go more blue-grey
    $scope.asteroidFieldDrawnItemFactory = new FieldOfSquaresDrawnItemFactory($scope.hexDimensions, 9, 20, ["#8d8468", "#86775f", "#7a6a4f", "#7f7053"]);
    $scope.cellDrawnItemFactoryMap = {simple: $scope.simpleDrawnItemFactory, sphere: $scope.sphereDrawnItemFactor, arrow: $scope.arrowDrawnItemFactory, asteroids: $scope.asteroidFieldDrawnItemFactory};
    $scope.cellDrawnItemFactory = new DelegatingDrawnItemFactory($scope.cellDrawnItemFactoryMap);
    $scope.cellContext = new CellContext($scope.cellDataSource, $scope.cellDrawnItemFactory, 5, $scope.hexDimensions);
    
    
    //Push the below grid portion of the cell context
    $scope.contexts.push($scope.cellContext.belowGridContext);
    
    //Create and push the grid context
    $scope.contexts.push(new GridContext($scope.hexDimensions));

    //Define and push the paths DataSource, DrawnItemFactory, and Context
    $scope.pathDataSource = new DataSource();
    $scope.pathDrawnItemFactory = new PathDrawnItemFactory($scope.hexDimensions);
    $scope.contexts.push(new DrawnItemContext($scope.pathDataSource, $scope.pathDrawnItemFactory, $scope.hexDimensions));
    
    //Definte and push the vector DataSource, DrawnItemFactory, and Context
    $scope.vectorDataSource = new DataSource();
    $scope.vectorDrawnItemFactory = new VectorDrawnItemFactory($scope.hexDimensions);
    $scope.contexts.push(new DrawnItemContext($scope.vectorDataSource, $scope.vectorDrawnItemFactory, $scope.hexDimensions));
    
    //Push the above grid cell context defined earlier
    $scope.contexts.push($scope.cellContext);

    //Create and push the LensFlareContext
    $scope.contexts.push(new ForegroundContext([{u:0, v:0}], $scope.hexDimensions));
    $scope.globalMouseClicked = function(dx, x, dy, y){
        var hexagonalCoordinates = $scope.hexDimensions.getReferencePoint(x - dx, y - dy);
        $rootScope.$broadcast('addAlert',{type:'info', msg:'Clicked U:'+hexagonalCoordinates.u + ' V:' +hexagonalCoordinates.v});
    };
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
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: 1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: 0, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: -1, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //gravity around the planet
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 6, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 5, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 4, fillColor: 'grey', lineWidth: 0, lineColor: 'grey', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //unfilled gravity around the moon
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 9, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 8, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 7, fillColor: 'black', lineWidth: 3, lineColor: 'grey', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
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
        
        //A small asteroid field. Double asteroids in the middle
        var onClickAsteroids = function() {
            $rootScope.$broadcast('addAlert',{type:'success', msg:"Asteroids"});
        };
        $scope.cellDataSource.addItems([{type:'asteroids', u:-1, v:10, onClick:onClickAsteroids}, {type:'asteroids', u:-2, v:10, onClick:onClickAsteroids},{type:'asteroids', u:-3, v:10, onClick:onClickAsteroids}]);
        $scope.cellDataSource.addItems([{type:'asteroids', u:-3, v:11, onClick:onClickAsteroids}, {type:'asteroids', u:-2, v:11, onClick:onClickAsteroids},{type:'asteroids', u:-2, v:10, onClick:onClickAsteroids}]);
        $scope.cellDataSource.addItems([{type:'asteroids', u:-1, v:9, onClick:onClickAsteroids}, {type:'asteroids', u:-2, v:9, onClick:onClickAsteroids}]);
        
        //A blue 'space station'
        var onClickStation = function() {
            $rootScope.$broadcast('addAlert',{type:'success', msg:"Do you believe I'm a space station? Use your imagination"});
        };
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 5, color: 'blue', u:6, v:5, onClick:onClickStation}]);
        
        
        //Dave
        var onClickDave = function() {
            if (!$scope.isDaveGoing) {
               $scope.isDaveGoing = true;
               $scope.vectorDataSource.addItems([{id:'daveVelocity', shaftWidth: 5, color: 'green', sourceU:0, sourceV:4, destU:0, destV:6}]);
	       $rootScope.$broadcast('addAlert',{type:'success', msg:'This is Dave. Dave is going places. Go Dave, go.'});
	    } else {
	       $scope.isDaveGoing = false;
	       $rootScope.$broadcast('addAlert',{type:'', msg:'Dave, slow down man.'});
	    
	       $scope.vectorDataSource.removeItems([{id:'daveVelocity'}]);
	    }
        };
        
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'green', u:0, v:4, onClick:onClickDave}]);

        //Poetry
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'white', u:3, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'One ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'white', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'white', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'red', u:5, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Red ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: 'blue', u:6, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Blue ship'});}}]);
        
        //A path around the Sun, Could represent the danger area for radiation
        $scope.pathDataSource.addItems([{width: 5, color: 'orange', closed: true, points: [[0,-2],[-2, 0],[-2, 2],[0, 2],[2, 0],[2, -2]], onClick:function(){$rootScope.$broadcast('addAlert',{type:'warning', msg:'Radiation! Beware!'});}}]);
    });
})

;
