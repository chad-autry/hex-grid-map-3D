var angular = require('angular');
var Board = require('../../../../src/HexBoard.js'); //
module.exports = angular.module( 'hexBoard', [] )

.directive( 'hexBoard', ['$window', function($window) {
  return {
    link: function( scope, element, attrs ) {
    

      scope.board = new Board(element[0], $window);
      scope.$emit('boardInitialized');
      
      
    }
  };
}])

;
