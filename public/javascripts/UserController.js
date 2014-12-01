/**
 * Created by jorgamelunxen on 09.11.14.
 */

controllersModule.controller('UserCtrl', ['$scope','$http', '$routeParams', '$attrs', function($scope,$http,$routeParams,$attrs) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.email      = $attrs.mail;
    this.firstname  = $attrs.firstname;
    this.role       = "unset";

    if(that.debug)
        console.log("info UserCtrl: init with email " + this.email);

    this.isStudent = function(){
        if(that.role == 'student'){
            if(that.debug)
                console.log("info UserCtrl: user is student");
            return true;
        }else{
            return false;
        }
    };

    this.isSupervisor = function(){
        if(that.role == 'supervisor'){
            if(that.debug)
                console.log("info UserCtrl: user is supervisor");
            return true;
        }else{
            return false;
        }
    };

    if(that.role == 'unset'){
        $http.get('/admin/role/'+that.email).
            success(function(data, status, headers, config) {
                that.role = data[0].role
            }).
            error(function(data, status, headers, config) {
            });
    }


}]);