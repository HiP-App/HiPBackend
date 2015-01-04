/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.directive('createFootnotes', function() {
    return {
        restrict: 'E',
        transclude: true,
        templateUrl: '/assets/directives/createFootnotes.html'
    };
});