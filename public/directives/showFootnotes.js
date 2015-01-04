/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.directive('showFootnotes', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: '/assets/directives/showFootnotes.html'
    };
});