/**
 * Created by Jörg Amelunxen on 28.11.14.
 */

overlayModule.controller('OverlayCtrl', ['$scope', function($scope) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.overlayIsShown = false;

    /**
     * Toggles the overlay: on/off
     */
    this.toggleOverlay = function(){
        that.overlayIsShown = !that.overlayIsShown;
    }
}]);