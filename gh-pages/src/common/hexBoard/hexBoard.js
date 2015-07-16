var angular = require('angular');
var Board = require('../../../../src/HexBoard.js'); //
module.exports = angular.module( 'hexBoard', [] )

.directive( 'hexBoard', function() {
  return {
    link: function( scope, element, attrs ) {
      scope.board = new Board(scope.hexDimensions, {canvas:element[0], edgeWidth:3,
            initBackground:scope.backgroundContext.initBackground, updateBackgroundPosition: scope.backgroundContext.updateBackgroundPosition,
            initForeground:scope.foregroundContext.initForeground, updateForegroundPosition: scope.foregroundContext.updateForegroundPosition,
        initGrid: scope.gridContext.initGrid, updateGridPosition: scope.gridContext.updateGridPosition}, scope.cellContext, scope.gridOverlayContext);
      scope.$emit('boardInitialized');
    }
  };
})

;

