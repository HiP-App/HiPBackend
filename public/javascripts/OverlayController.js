/**
 * Created by jorgamelunxen on 28.11.14.
 */

controllersModule.controller('OverlayCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.overlayIsShown = false;

    this.toggleOverlay = function(){
        that.overlayIsShown = !that.overlayIsShown;
    }
}]);