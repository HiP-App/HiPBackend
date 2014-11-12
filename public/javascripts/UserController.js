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

    if(that.debug)
        console.log("info UserCtrl: init with email " + this.email);

}]);