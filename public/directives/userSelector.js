/**
 * Created by Jörg Amelunxen on 11.12.14.
 */

controllersModule.directive('userSelector', function() {
    return {
        restrict: 'E',
        scope: {
            directsave: '@directsave',
            gc: '=groupcontroller',
            lc: '=languagecontroller',
            uc: '=usercontroller'
        },
        templateUrl: '/assets/directives/userSelector.html'
    };
});