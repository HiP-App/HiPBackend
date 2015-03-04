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
    this.selectedUser = "";             // stores a selected user in the userList
    this.selectedUserMetadata = "";     // stores the meta data of the selected user

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
     * Fetches the meta data for the given user
     *
     * @param userID        userID of the searched user
     * @param callback      callback function that contains the dataobject as a first parameter
     */
    this.getMetaData = function(userID, callback){
        $http.get('/admin/role/'+userID).
            success(function(data) {
                var returnObj = {
                    role:   data[0].role,
                    master: data[0].master,
                    admin:  data[0].admin
                };

                callback(returnObj);
            }).
            error(function() {
                console.log("Error getting metadata of the user")
            });
    };

    /**
     * This function updates the meta data for the currently selected user
     */
    this.updateMetadataForSelectedUser = function(){
        that.getMetaData(that.selectedUser.userid, function(meta){
            meta.admin  = (meta.admin === 'true');
            meta.master = (meta.master === 'true');
            that.selectedUserMetadata = meta;
        })
    };

    /**
     * Updates the currently stored user
     */
    this.updateUser = function(){
        var metadata = {
            userid :    that.selectedUser.userid,
            email :     that.selectedUser.userid,
            role  :     that.selectedUserMetadata.role,
            templates:  '',
            admin:      that.selectedUserMetadata.admin+'',
            master:     that.selectedUserMetadata.master+''
        };

        // post
        $http.put('/admin/roles', metadata).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                console.log("Error RoleCtrl: Could not update a metadata");
            });
    };

    /**
     * Fetches the role of the current user if needed (a.k.a, on init)
     */
    if(that.role == 'unset'){
        that.getMetaData(that.email, function(returnData){
            that.role   = returnData.role;
            that.admin  = returnData.admin;
            that.master = returnData.master;
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