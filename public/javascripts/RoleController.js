/**
 * Created by jorgamelunxen on 20.11.14.
 */

controllersModule.controller('RoleCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };


}]);