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
  $rootScope.srcroot = "https://github.com/chad-autry/hex-widget/blob/master/src/";
  $scope.rootScope = $rootScope;
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | hex-widget' ;
    }
    $scope.isDemo = $state.includes('demo');

    //Add the isIndexed property for all routes which have an index
    $scope.isIndexed = $state.includes('jsdoc');
  });
})

;

