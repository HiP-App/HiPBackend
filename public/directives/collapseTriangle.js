/**
 * Created by Jörg Amelunxen on 01.02.15.
 */
controllersModule.directive('collapseTriangle', function() {
    return {
        scope: {
            condition: '=condition'
        },
        restrict: 'E',
        templateUrl: '/assets/directives/collapseTriangle.html'
    };
});