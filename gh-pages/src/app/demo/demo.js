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
var DrawnItemDataLink = require('../../../../src/dataLinks/DrawnItemDataLink');
var PlanarPositioningDataLink = require('../../../../src/dataLinks/PlanarPositioningDataLink');
var ZStackingDataLink = require('../../../../src/dataLinks/ZStackingDataLink');
var CloningDataLink = require('../../../../src/dataLinks/CloningDataLink');
var ConnectingDataLink = require('../../../../src/dataLinks/ConnectingDataLink');
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
    $scope.cellContext = new CellContext();
    $scope.drawnItemDataLink = new DrawnItemDataLink($scope.cellDrawnItemFactory);
    $scope.drawnItemDataLink.setDataSource($scope.cellDataSource);

    $scope.cloningDataLink = new CloningDataLink();
    $scope.cloningDataLink.setDataSource($scope.drawnItemDataLink);

    $scope.planarPositioningDataLink = new PlanarPositioningDataLink($scope.hexDimensions);
    $scope.planarPositioningDataLink.setDataSource($scope.cloningDataLink);
    
    $scope.ZStackingDataLink = new ZStackingDataLink(10);
    $scope.ZStackingDataLink.setDataSource($scope.planarPositioningDataLink);
    
    $scope.ConnectingDataLink = new ConnectingDataLink();
    $scope.ConnectingDataLink.setDataSource($scope.ZStackingDataLink);
    
    $scope.connectingDataSource = new EmittingDataSource();
    $scope.ConnectingDataLink.setDataSource($scope.connectingDataSource);
    
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


    $scope.cellContext.setDataSource($scope.ZStackingDataLink);
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
        $scope.ConnectingDataLink.scene = $scope.board.scene;
        
       $scope.drawnItemDataLink.setScene($scope.board.scene);

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
        $scope.cellDataSource.addItems([{id:'sa1', type:'arrow', u: 0, v: -1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'sa2',type:'arrow', u: -1, v: 0, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'sa3',type:'arrow', u: -1, v: 1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'sa4',type:'arrow', u: 0, v: 1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'sa5',type:'arrow', u: 1, v: 0, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'sa6',type:'arrow', u: 1, v: -1, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //gravity around the planet
        $scope.cellDataSource.addItems([{id:'ea1',type:'arrow', u: 5, v: 4, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ea2',type:'arrow', u: 4, v: 5, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ea3',type:'arrow', u: 4, v: 6, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ea4',type:'arrow', u: 5, v: 6, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ea5',type:'arrow', u: 6, v: 5, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ea6',type:'arrow', u: 6, v: 4, fillColor: '#929591', lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //unfilled gravity around the moon
        $scope.cellDataSource.addItems([{id:'ma1',type:'arrow', u: 3, v: 7, lineWidth: 3, lineColor: '#929591', rotation: 180, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ma2',type:'arrow', u: 2, v: 8, lineWidth: 3, lineColor: '#929591', rotation: 240, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ma3',type:'arrow', u: 2, v: 9, lineWidth: 3, lineColor: '#929591', rotation: 300, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ma4',type:'arrow', u: 3, v: 9, lineWidth: 3, lineColor: '#929591', rotation: 0, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ma5',type:'arrow', u: 4, v: 8, lineWidth: 3, lineColor: '#929591', rotation: 60, scaleLength: 0.75, scaleWidth:0.75}]);
        $scope.cellDataSource.addItems([{id:'ma6',type:'arrow', u: 4, v: 7, lineWidth: 3, lineColor: '#929591', rotation: 120, scaleLength: 0.75, scaleWidth:0.75}]);
        
        //Add a fleet of red 'ships' (triangles) on the dark side of the moon, and a fleet of green ships at the sun
        $scope.cellDataSource.addItems([{id:'gs1',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs1',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs2',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs2',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs3',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs3',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs4',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs4',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs5',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs5',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs6',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs6',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs7',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs7',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs8',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs8',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs9',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs9',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs10',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs10',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);
        $scope.cellDataSource.addItems([{id:'gs11',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:1, v:0}, {id:'rs11',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:2, v:9}]);

        //A small asteroid field. Double asteroids in the middle
        var onClickAsteroids = function() {
            $rootScope.$broadcast('addAlert',{type:'success', msg:"Asteroids"});
        };
        $scope.cellDataSource.addItems([{id:'asteroids1',type:'asteroids', u:-1, v:10, onClick:onClickAsteroids}, {id:'asteroids2', type:'asteroids', u:-2, v:10, onClick:onClickAsteroids},{id:'asteroids3', type:'asteroids', u:-3, v:10, onClick:onClickAsteroids}]);
        $scope.cellDataSource.addItems([{id:'asteroids4', type:'asteroids', u:-3, v:11, onClick:onClickAsteroids}, {id:'asteroids5', type:'asteroids', u:-2, v:11, onClick:onClickAsteroids},{id:'asteroids6', type:'asteroids', u:-2, v:10, onClick:onClickAsteroids}]);
        $scope.cellDataSource.addItems([{id:'asteroids7', type:'asteroids', u:-1, v:9, onClick:onClickAsteroids}, {id:'asteroids8', type:'asteroids', u:-2, v:9, onClick:onClickAsteroids}]);
        
        //A blue 'space station'
        var onClickStation = function() {
            $rootScope.$broadcast('addAlert',{type:'success', msg:"Do you believe I'm a space station? Use your imagination"});
        };
        $scope.cellDataSource.addItems([{id:'station', type:'simple', diameter: 40, thickness:5, sides: 5, color: '#0343df', u:6, v:5, onClick:onClickStation}]);
        
        
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
        
        
        var daveMiniMe = {id:'daveVelocity', type:'clone', clonesId:'dave', cloneAlpha:0.5, cloneScale: 0.75, dragged:true, u:0, v:4};
        daveMiniMe.onDrag = function(screenX, screenY, planarX, planarY, mesh) {
            if (!this.lastPlanarX) {
                this.lastPlanarX = planarX;
                this.lastPlanarY = planarY;
                this.skipCellCentering = true;
                $scope.connectingDataSource.addItems([{id:mesh.position.x, target:daveMiniMe.id, source: 'dave'}]);
            }

            var dx = planarX - this.lastPlanarX;
            var dy = planarY - this.lastPlanarY;
            this.lastPlanarX = planarX;
            this.lastPlanarY = planarY;
            mesh.position.x = mesh.position.x + dx;
            mesh.position.y = mesh.position.y + dy;
            //TODO Directlly update any interested item (like a graphics connection) that this position has changed
            
        }
        
        var onDragDave = function(screenX, screenY, planarX, planarY) {
            if (!this.hasVelocity) {
                $scope.cellDataSource.addItems([daveMiniMe, {target:daveMiniMe.id, source: 'dave'}]);
                this.hasVelocity = true;
            }
        }
        
        $scope.cellDataSource.addItems([{id:'dave', type:'simple', diameter: 40, thickness:5, sides: 3, color: '#15b01a', u:0, v:4, onClick:onClickDave, onDrag: onDragDave}]);

        //Poetry
        $scope.cellDataSource.addItems([{id:'oneShip',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#ffffff', u:3, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'One ship'});}}]);
        $scope.cellDataSource.addItems([{id:'twoShip',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#ffffff', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{id:'twoShip2',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#ffffff', u:4, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Two ship'});}}]);
        $scope.cellDataSource.addItems([{id:'redShip',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#e50000', u:5, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Red ship'});}}]);
        $scope.cellDataSource.addItems([{id:'blueShip',type:'simple', diameter: 40, thickness:5, sides: 3, color: '#0343df', u:6, v:0, onClick:function(){$rootScope.$broadcast('addAlert',{type:'info', msg:'Blue ship'});}}]);
        
        //A path around the Sun, Could represent the danger area for radiation
        $scope.pathDataSource.addItems([{width: 10, color: '#f97306', closed: true, points: [[0,-2],[-2, 0],[-2, 2],[0, 2],[2, 0],[2, -2]], onClick:function(){$rootScope.$broadcast('addAlert',{type:'warning', msg:'Radiation! Beware!'});}}]);
    });
})

;
