/**
 * Created by jorgamelunxen on 30.11.14.
 */

overlayModule.directive('fullscreenOverlay', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: '/assets/directives/fullscreenOverlay.html'
    };
});