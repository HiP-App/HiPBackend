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

}]);