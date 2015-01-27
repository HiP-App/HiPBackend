/**
 * Created by Jörg Amelunxen on 20.11.14.
 *
 * @class angular_module.controllersModule.RoleCtrl
 *
 * This controller is needed for role management. Is offers an interface for changing roles.
 */
controllersModule.controller('RoleCtrl', ['$scope','$http', function($scope,$http) {
    var that = this;

    this.debug = false;

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
                console.log("Error RoleCtrl: Could not update a role");
            });
    }
}]);