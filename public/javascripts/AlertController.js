/**
 * Created by Jörg Amelunxen on 28.11.14.
 */

alertModule.controller('AlertCtrl', ['$scope',function($scope) {
    var that = this;

    // The scope contains all active alerts in the system
    $scope.alerts = [
    ];

    /**
     * Adds a new alert to the system
     *
     * @param msg {string}  that should be contained in the message
     * @param type {string} of the alert. E.g., 'info' or 'danger'
     */
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

    /**
     * Removes an alert from the system
     *
     * @param index     of the alert that should be removed
     */
    this.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

}]);