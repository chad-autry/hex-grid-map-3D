'use strict';

var angular = require('angular'),
    ui_router = require('angular-ui-router'),
    app_demo = require('./demo/demo'),
    ui_bootstrap_collapse =  require('ui.bootstrap.collapse');

module.exports = angular.module( 'hexWidget', [
  app_demo.name,
  ui_router,
  ui_bootstrap_collapse
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/demo' );
})

.run( function run () {
})

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | hex-widget' ;
    }
  });
})

;

