/**
 * Created by Jörg Amelunxen on 09.11.14.
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

    if(that.debug)
        console.log("info UserCtrl: init with email " + this.email);

    /**
     * Returns true, if the user is a student
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
     * Fetches the role of the current user if needed (a.k.a, on init)
     */
    if(that.role == 'unset'){
        $http.get('/admin/role/'+that.email).
            success(function(data, status, headers, config) {
                that.role = data[0].role
            }).
            error(function(data, status, headers, config) {
            });
    }

    /**
     * Fetches the list of all users if needed (a.k.a, on init)
     */
    if(that.userList == 'unset'){
        $http.get('/admin/users').
            success(function(data, status, headers, config) {
                that.userList = data;
            }).
            error(function(data, status, headers, config) {
            });
    }
}]);