/**
 * Created by joerg on 05.11.2014.
 */

controllersModule.controller('MessageCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messages = [{ }];

    /* functions */
    this.getMessagesByReceiverName = function(recName){
        $http.get('/admin/messages/'+recName).
            success(function(data, status, headers, config) {

                that.messages = data;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data");
                }
            }).
            error(function(data, status, headers, config) {

                that.messages  = that.errorObject;
            });
    };

    /* update parameter if needed */
    if($routeParams.recName != undefined){
        that.getMessagesByReceiverName($routeParams.recName);
    }

}]);