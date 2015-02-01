/**
 * Created by Jörg Amelunxen on 01.02.15.
 */

controllersModule.directive('createTopicLinks', function() {
    return {
        restrict: 'E',
        scope: {
            lc: '=languagecontroller',
            uc: '=usercontroller',
            gc: '=groupcontroller',
            tc: '=topiccontroller'
        },
        templateUrl: '/assets/directives/createTopicLinks.html'
    };
});

controllersModule.directive('showTopicLinks', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            uc: '=usercontroller',
            tc: '=topiccontroller',
            gc: '=groupcontroller'
        },
        templateUrl: '/assets/directives/showTopicLinks.html'
    };
});