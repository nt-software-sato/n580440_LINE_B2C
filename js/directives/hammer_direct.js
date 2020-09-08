WeChat.directive('onTap', function() {
  return function($scope, $element, $attrs) {
    return $($element).hammer({
      prevent_default: false,
      drag_vertical: false
    }).bind("tap", function(ev) {
      return scope.$apply($attrs['onTap']);
    });
  };
}).directive('toggle', [function() {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      'ngModel': '='
    },
    template: '<label class="ro-switch"><input type="checkbox" ng-model="ngModel" ng-checked="ngModel"><div class="slider"><div class="slider-thumb"></div></div></label>',
    link: function(scope, elm, attr) {}
  }
}]);