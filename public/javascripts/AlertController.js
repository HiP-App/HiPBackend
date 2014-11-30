/**
 * Created by jorgamelunxen on 28.11.14.
 */

/**
 * Created by joerg on 29.10.2014.
 */

alertModule.controller('AlertCtrl', ['$scope',function($scope) {
    var that = this;

    $scope.alerts = [
    ];

    this.addAlert = function(msg, type) {
        var found=false;

        $scope.alerts.forEach(function(a){
           if(a.msg == msg)
            found=true;
        });

        if(!found){
            $scope.alerts.push({
                msg: msg,
                type:type
            });
        }
    };

    this.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

}]);