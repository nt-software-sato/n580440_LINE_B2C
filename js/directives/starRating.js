/**
 * Created by Administrator on 2015/7/23.
 */

//rating ����
WeChat.directive("starRating", function () {
    return {
        restrict: "EA",
        template: "<section layout-align='center center' layout-sm='column' layout='row'>" +
        "  <md-button ng-repeat='star in stars' ng-click='toggle($index)'>" +
        "    <i class='fa fa-star'></i>" + //&#9733
        "  </md-button>" +
        "</section>",
        scope: {
            ratingValue: "=ngModel",
            max: "=?", //optional: default is 5
            onRatingSelected: "&?",
            readonly: "=?"
        },
        link: function (scope, elem, attrs) {
            if (scope.max == undefined) { scope.max = 5; }
            function updateStars() {
                scope.stars = [];
                for (var i = 0; i < scope.max; i++) {
                    scope.stars.push({
                        filled: i < scope.ratingValue
                    });
                }
            };
            scope.toggle = function (index) {
                if (scope.readonly == undefined || scope.readonly == false) {
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({
                        rating: index + 1
                    });
                }
            };
            scope.$watch("ratingValue", function (oldVal, newVal) {
                if (newVal) { updateStars(); }
            });
        }
    };
});
