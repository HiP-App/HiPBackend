/**
 * Created by Jörg Amelunxen on 30.11.14.
 */

overlayModule.directive('hipOverlay', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: '/assets/directives/hipOverlay.html'
    };
});