'use strict';

var angular = require('angular'),
    ui_router = require('angular-ui-router'),
    ui_router_extras_sticky = require('ct.ui.router.extras.sticky'),
    app_demo = require('./demo/demo'),
    app_jsdoc = require('../../../target/jsdoc/jsdoc'), //This is generated
    ui_bootstrap =  require('ui.bootstrap');

module.exports = angular.module( 'hexWidget', [
  app_demo.name,
  app_jsdoc.name,
  ui_router,
  ui_router_extras_sticky,
  ui_bootstrap
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $stickyStateProvider ) {
  $urlRouterProvider.otherwise( '/demo' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $rootScope, $location, $state ) {
  $rootScope.srcroot = "https://github.com/chad-autry/hex-grid-map/blob/master/src/";
  $scope.version = 'master';
  $scope.alerts = [];
  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.$on('addAlert', function(event, data){
      $scope.alerts.push({type:data.type, msg: data.msg});
      $scope.$apply();
  });
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | hex-grid-map-3D' ;
    }
    $scope.isDemo = $state.includes('demo');
    
    $scope.menuCollapsed = true;
    //We auto-expand for the base jsdoc state, and collapse for everything else
    if ($state.is('jsdoc')) {
        $rootScope.$broadcast('showIndex');
        $scope.showIndex = true;
    } else {
        $rootScope.$broadcast('hideIndex');
        $scope.showIndex = false;
    }
  });
})

;

