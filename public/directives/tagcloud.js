/**
 * Created by jorgamelunxen on 02.03.15.
 */

controllersModule.directive('tagCloud', function() {
    return {
        restrict: 'E',
        scope: {
          lc: '=languagecontroller',
          tc: '=topiccontroller'
        },
        templateUrl: '/assets/directives/tagcloud.html'
    };
});