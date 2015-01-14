/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.directive('showFootnotes', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
          uc: '=uc',
          tc: '=tc',
          gc: '=gc'
        },
        templateUrl: '/assets/directives/showFootnotes.html'
    };
});