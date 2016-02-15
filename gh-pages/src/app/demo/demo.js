var angular = require('angular');
var template = require("./demo.tpl.html");
var ui_router = require('angular-ui-router');
var ui_router_extras_sticky = require('ct.ui.router.extras.sticky');
var hexBoard = require("../../common/hexBoard/hexBoard");
var BackgroundContext = require('../../../../src/contexts/RandomStaryBackgroundContext.js');
var GridContext = require('../../../../src/contexts/InverseGridContext.js');
var CellContext = require('../../../../src/contexts/CellContext.js');
var VectorDrawnItemFactory = require('../../../../src/drawnItemFactories/VectorDrawnItemFactory.js');
var PathDrawnItemFactory = require('../../../../src/drawnItemFactories/PathDrawnItemFactory.js');
var ArrowDrawnItemFactory = require('../../../../src/drawnItemFactories/ArrowDrawnItemFactory.js');
var DelegatingDrawnItemFactory = require('../../../../src/drawnItemFactories/DelegatingDrawnItemFactory.js');
var DrawnItemContext = require('../../../../src/contexts/DrawnItemContext.js');
var CellDrawnItemFactory = require('../../../../src/drawnItemFactories/RegularPolygonDrawnItemFactory');
var SphereDrawnItemFactory = require('../../../../src/drawnItemFactories/SphereDrawnItemFactory');
var FieldOfSquaresDrawnItemFactory = require('../../../../src/drawnItemFactories/FieldOfSquaresDrawnItemFactory');
var HexDefinition = require('cartesian-hexagonal'); //external project required in constructors
var EmittingDataSource = require('data-chains/src/EmittingDataSource.js');

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
    $scope.hexDimensions = new HexDefinition(55, 1, 0, 3);
    //$scope.contexts.push(new BackgroundContext());
    
    //Create the cell items datasource, drawnItemFactories, and special compound contex
    $scope.cellDataSource = new EmittingDataSource();
    $scope.simpleDrawnItemFactory = new CellDrawnItemFactory($scope.hexDimensions);
    $scope.sphereDrawnItemFactory = new SphereDrawnItemFactory($scope.hexDimensions);
    $scope.arrowDrawnItemFactory = new ArrowDrawnItemFactory($scope.hexDimensions);
    
    //For Asteroids we use brown grey, brownish grey, greyish brown, grey brown. For debris would probablly go more blue-grey
    $scope.asteroidFieldDrawnItemFactory = new FieldOfSquaresDrawnItemFactory($scope.hexDimensions, 9, 20, ["#8d8468", "#86775f", "#7a6a4f", "#7f7053"]);
    $scope.cellDrawnItemFactoryMap = {simple: $scope.simpleDrawnItemFactory, sphere: $scope.sphereDrawnItemFactory,  asteroids: $scope.asteroidFieldDrawnItemFactory, arrow: $scope.arrowDrawnItemFactory};
    $scope.cellDrawnItemFactory = new DelegatingDrawnItemFactory($scope.cellDrawnItemFactoryMap);
    $scope.cellContext = new CellContext($scope.cellDrawnItemFactory, 5, $scope.hexDimensions);
    $scope.cellContext.setDataSource($scope.cellDataSource);

    //Create and push the grid context
    $scope.contexts.push(new GridContext($scope.hexDimensions));

    //Define and push the paths DataSource, DrawnItemFactory, and Context
    $scope.pathDataSource = new EmittingDataSource();
    $scope.pathDrawnItemFactory = new PathDrawnItemFactory($scope.hexDimensions);
    $scope.pathContext = new DrawnItemContext($scope.pathDrawnItemFactory, $scope.hexDimensions);
    $scope.pathContext.setDataSource($scope.pathDataSource);
    $scope.contexts.push($scope.pathContext);
    
    //Definte and push the vector DataSource, DrawnItemFactory, and Context
    $scope.vectorDataSource = new EmittingDataSource();
    $scope.vectorDrawnItemFactory = new VectorDrawnItemFactory($scope.hexDimensions);
    var vectorContext = new DrawnItemContext($scope.vectorDrawnItemFactory, $scope.hexDimensions)
    vectorContext.setDataSource($scope.vectorDataSource);
    $scope.contexts.push(vectorContext);
    
    //Push the above grid cell context defined earlier
    $scope.contexts.push($scope.cellContext);

    //Create and push the LensFlareContext
    //$scope.contexts.push(new ForegroundContext([{u:0, v:0}], $scope.hexDimensions));
    $scope.globalMouseClicked = function(dx, x, dy, y){
        var hexagonalCoordinates = $scope.hexDimensions.getReferencePoint(x - dx, y - dy);
        $rootScope.$broadcast('addAlert',{type:'info', msg:'Clicked U:'+hexagonalCoordinates.u + ' V:' +hexagonalCoordinates.v});
    };
    $scope.$on('boardInitialized', function() {
        //Once the board has been initialized, setup the demo scene
        //set the context and mouse clicked
        $scope.board.setHexDimensions($scope.hexDimensions);
        $scope.board.setContexts($scope.contexts);
        $scope.board.setMouseClicked($scope.globalMouseClicked);
        
        //Initialize the board
        $scope.board.init();
        
        //Add a star
        //The rotation is the "nearly isometric" converted to radians. #f97306 = xkcd orange
        $scope.cellDataSource.addItems([{id:'sun', type:'sphere', size: 100, lineWidth: 5, greatCircleAngles: [0, Math.PI/3, -Math.PI/3], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6, -Math.PI/3], 
        lineColor: '#f97306', backgroundColor: '#ffff14', borderStar: {radius1: 3, radius2: 6, points: 20, borderColor: '#f97306'}, u:0, v:0}]);
        
        //Add a sphere to represent earth
        $scope.cellDataSource.addItems([{id: 'earth', type:'sphere', size: 66, lineWidth: 5, greatCircleAngles: [0, Math.PI/3, -Math.PI/3], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6, -Math.PI/3], 
        lineColor: '#653700', backgroundColor: '#0343df', borderWidth: 2, borderColor: '#ffffff', u:5, v:5}]);
        
        //Add a sphere to represent the moon
        $scope.cellDataSource.addItems([{id:'moon', type:'sphere', size: 33, lineWidth: 2.5, greatCircleAngles: [0, Math.PI/3, -Math.PI/3], latitudeAngles: [0, Math.PI/6, Math.PI/3, -Math.PI/6, -Math.PI/3], 
        lineColor: '#929591', backgroundColor: '#e1e1d6', borderWidth: 3, borderColor: 'black', u:3, v:8}]);
        
        
        
        //Add arrows to represent gravity
        //Gravity around the sun
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: -1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 0, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: -1, v: 1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 0, v: 1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: 0, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 1, v: -1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //gravity around the planet
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 4, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 5, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 6, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 5, v: 6, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 5, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 6, v: 4, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //unfilled gravity around the moon
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 7, lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 8, lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 2, v: 9, lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 3, v: 9, lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 8, lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{type:'arrow', u: 4, v: 7, lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //Add a fleet of red 'ships' (triangles) on the dark side of the moon, and a fleet of green ships at the sun
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 55, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:1, v:0}, {type:'simple', radius: 30, sides: 3, color: '#e50000', u:2, v:9}]);
        
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
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 5, color: '#0343df', u:6, v:5, onClick:onClickStation}]);
        
        
        //Dave
        var onClickDave = function() {
            if (!$scope.isDaveGoing) {
               $scope.isDaveGoing = true;
               $scope.vectorDataSource.addItems([{id:'daveVelocity', shaftWidth: 5, color: '#15b01a', sourceU:0, sourceV:4, destU:0, destV:6}]);
	       $rootScope.$broadcast('addAlert',{type:'success', msg:'This is Dave. Dave is going places. Go Dave, go.'});
	    } else {
	       $scope.isDaveGoing = false;
	       $rootScope.$broadcast('addAlert',{type:'', msg:'Dave, slow down man.'});
	    
	       $scope.vectorDataSource.removeItems([{id:'daveVelocity'}]);
	    }
        };
        
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#15b01a', u:0, v:4, onClick:onClickDave}]);

        //Poetry
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#ffffff', u:3, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'One ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#ffffff', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#ffffff', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#e50000', u:5, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Red ship'});}}]);
        $scope.cellDataSource.addItems([{type:'simple', radius: 30, sides: 3, color: '#0343df', u:6, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Blue ship'});}}]);
        
        //A path around the Sun, Could represent the danger area for radiation
        $scope.pathDataSource.addItems([{width: 10, color: '#f97306', closed: true, points: [[0,-2],[-2, 0],[-2, 2],[0, 2],[2, 0],[2, -2]], onClick:function(){$rootScope.$broadcast('addAlert',{type:'warning', msg:'Radiation! Beware!'});}}]);
    });
})

;
