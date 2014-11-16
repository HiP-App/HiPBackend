/**
 * Created by joerg on 05.11.2014.
 */

controllersModule.controller('ProposeCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.propose = {};

    this.proposeTopic = function(receiver,sender,proposeString){
        var currentPropID = Sha1.hash(that.propose.name + Math.floor((Math.random() * 100000) + 1));

        var proposement = {
            uID : currentPropID,
            receiver : receiver,
            sender  : sender,
            title : proposeString + " " + that.propose.name,
            content : that.propose.content
        }

        $http.post('/admin/messages', proposement).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }
}]);