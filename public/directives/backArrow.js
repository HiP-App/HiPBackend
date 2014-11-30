/**
 * Created by jorgamelunxen on 30.11.14.
 */

controllersModule.directive('backArrow', function() {
    return {
        scope: {
            backURL: '=backurl'
        },
        restrict: 'E',
        templateUrl: '/assets/directives/backArrow.html'
    };
});