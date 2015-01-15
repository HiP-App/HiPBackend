/**
 * Created by jorgamelunxen on 15.01.15.
 */
controllersModule.directive('topicHistory', function() {
    return {
        restrict: 'E',
        scope: {
            lc: '=languagecontroller',
            tc: '=topiccontroller',
            uc: '=usercontroller'
        },
        templateUrl: '/assets/directives/topicHistory.html',
        link: function(scope){
            scope.listRange = function(from, to, user, entries) {
                var result = {};

                angular.forEach(entries, function(entry, key) {
                    if ((entry.versionNumber >= from && entry.versionNumber <= to) || entry.editor == user) {
                        result[key] = entry;
                    }
                });

                return result;
            };
        }

    };
});

/**
 * This directive is a small bugfix for AngularJS:
 *
 */
controllersModule.directive('ngFocusAsync', ['$parse', function($parse) {
        return {
            compile: function($element, attr) {
                var fn = $parse(attr.ngFocusAsync);
                return function(scope, element) {
                    element.on('focus', function(event) {
                        scope.$evalAsync(function() {
                            fn(scope, {$event:event});
                        });
                    });
                };
            }
        };
    }]
);