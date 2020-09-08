(function() {
  'use strict';
    WeChat.controller('fabToolbarCtrl', function($scope) {
      $scope.isOpen = false;
      $scope.demo = {
        isOpen: false,
        count: 0,
        selectedAlignment: 'md-right'
      };
    });
})();