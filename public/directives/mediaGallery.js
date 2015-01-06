/**
 * Created by Jörg Amelunxen on 06.01.15.
 */

controllersModule.directive('mediaGallery', function() {
    return {
        restrict: 'E',
        scope: {
            files: '=files'
        },
        templateUrl: '/assets/directives/mediaGallery.html'
    };
});