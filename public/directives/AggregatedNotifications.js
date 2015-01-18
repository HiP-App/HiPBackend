/**
 * Created by Jörg Amelunxen on 18.01.15.
 */
controllersModule.directive('aggregatedNotifications', function() {
    return {
        restrict: 'E',
        scope: {
            lc: '=languagecontroller',
            gc: '=groupcontroller',
            uc: '=usercontroller'
        },
        templateUrl: '/assets/directives/aggregatedNotifications.html',
        link: function(scope){
            scope.showGroup = function(group, all) {
                var result = {};

                angular.forEach(all, function(entry, key) {
                    if(group == undefined){
                        result[key] = entry;
                    }else if (entry.group == group) {
                        result[key] = entry;
                    }
                });

                return result;
            };
        }

    };
});