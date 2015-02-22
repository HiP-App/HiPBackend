/**
 * Created by Jörg Amelunxen on 09.11.14.
 *
 * @class angular_module.controllersModule.UserCtrl
 *
 * This controller stores information about the current users. Furthermore, it can be used to evaluate the role
 * of the currently active user.
 */
controllersModule.controller('UserCtrl', ['$scope','$http', '$attrs', function($scope,$http,$attrs) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.userList   = "unset";          // list stores all users in the system

    this.email      = $attrs.mail;      // email address of the current user
    this.firstname  = $attrs.firstname; // firstname of the current user
    this.role       = "unset";          // role of the current user
    this.admin      = "unset";          // is the user an admin?
    this.master     = "unset";          // is the user a master user?

    if(that.debug)
        console.log("info UserCtrl: init with email " + this.email);

    /**
     * Returns true, if the user is a student
     *
     * @returns {boolean}
     */
    this.isStudent = function(){
        if(that.role == 'student'){
            if(that.debug)
                console.log("info UserCtrl: user is student");
            return true;
        }else{
            return false;
        }
    };

    /**
     * Returns true, if the user is a supervisor
     *
     * @returns {boolean}
     */
    this.isSupervisor = function(){
        if(that.role == 'supervisor'){
            if(that.debug)
                console.log("info UserCtrl: user is supervisor");
            return true;
        }else{
            return false;
        }
    };

    /**
     * Returns true, if the user is an admin
     *
     * @returns {boolean}
     */
    this.isAdmin = function(){
        if(that.admin == 'true'){
            return true;
        }else{
            return false;
        }
    };

    /**
     * Returns true, if the user is a master user
     *
     * @returns {boolean}
     */
    this.isMaster = function(){
        if(that.master == 'true'){
            return true;
        }else{
            return false;
        }
    };

    /**
     * Fetches the role of the current user if needed (a.k.a, on init)
     */
    if(that.role == 'unset'){
        $http.get('/admin/role/'+that.email).
            success(function(data) {
                that.role   = data[0].role;
                that.admin  = data[0].admin;
                that.master  = data[0].master;
            }).
            error(function() {
                console.log("Error getting metadata of the user")
            });
    }

    /**
     * Fetches the list of all users if needed (a.k.a, on init)
     */
    if(that.userList == 'unset'){
        $http.get('/admin/users').
            success(function(data) {
                that.userList = data;
            }).
            error(function() {
                console.log("Error getting user information")
            });
    }
}]);