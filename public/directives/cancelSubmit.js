/**
 * Created by Jörg Amelunxen on 30.11.14.
 */

controllersModule.directive('cancelSubmit', function() {
    return {
        scope: {
            cancel: '=cancel',
            submit: '=submit'
        },
        restrict: 'E',
        templateUrl: '/assets/directives/cancelSubmit.html'
    };
});