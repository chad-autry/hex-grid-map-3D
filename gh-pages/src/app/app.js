'use strict';

var angular = require('angular'),
    ui_router = require('angular-ui-router'),
    ui_router_extras_sticky = require('ct.ui.router.extras.sticky'),
    app_demo = require('./demo/demo'),
    app_jsdoc = require('../../../target/jsdoc/jsdoc'), //This is generated
    ui_bootstrap_collapse =  require('ui.bootstrap.collapse');

module.exports = angular.module( 'hexWidget', [
  app_demo.name,
  app_jsdoc.name,
  ui_router,
  ui_router_extras_sticky,
  ui_bootstrap_collapse
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider, $stickyStateProvider ) {
  $urlRouterProvider.otherwise( '/demo' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location, $state ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | hex-widget' ;
    }
    $scope.isDemo = $state.includes('demo');
  });
})

;

