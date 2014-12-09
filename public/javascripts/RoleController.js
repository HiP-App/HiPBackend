/**
 * Created by Jörg Amelunxen on 20.11.14.
 */

controllersModule.controller('RoleCtrl', ['$scope','$http', function($scope,$http) {
    var that = this;

    this.debug = true;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.currentRole = {};

    /**
     * Creates resp. updates the role that is stored internally in that.currentRole
     */
    this.createOrUpdateRole = function(){

        var role = {
            userid :    that.currentRole.userid,
            email :     that.currentRole.userid,
            role  :     that.currentRole.role
        };

        if(that.debug){
            console.log("info RoleController: posting role for user: " + role.userid);
            console.log(role);
        }

        // post
        $http.put('/admin/roles', role).
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