/**
 * Created by jorgamelunxen on 30.11.14.
 */

chatModule.directive('chatBox', function() {
    return {
        restrict: 'E',
        templateUrl: '/assets/directives/chatBox.html'
    };
});

chatModule.directive('chatBoxBig', function() {
    return {
        restrict: 'E',
        templateUrl: '/assets/directives/chatBoxBig.html'
    };
});