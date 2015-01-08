/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.directive('dropzone', function () {
    return function (scope, element, attrs) {
        var config, dropzone, topic;

        config = scope[attrs.dropzone];

        // create a Dropzone for the element with the given options
        dropzone = new Dropzone(element[0], config.options);

        // bind the given event handlers
        angular.forEach(config.eventHandlers, function (handler, event) {
            dropzone.on(event, handler);
        });
    };
});

controllersModule.directive('uploadBox', function() {
    return {
        restrict: 'E',
        scope: {
            topic: '=topic',
            label: '=label',
            tc: '=tc'
        },
        templateUrl: '/assets/directives/uploadBox.html'
    };
});