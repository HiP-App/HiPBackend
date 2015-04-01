/**
 * Created by Jörg Amelunxen on 21.03.15.
 */
controllersModule.directive('userGallery', function() {
    return {
        scope: {
            modus: '@modus',
            gc: '=groupcontroller',
            lc: '=languagecontroller',
            uc: '=usercontroller'
        },
        restrict: 'E',
        templateUrl: '/assets/directives/userGallery.html'
    };
});