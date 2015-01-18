/**
 * Created by Jörg Amelunxen on 28.11.14.
 *
 * @class angular_module.overlayModule.OverlayCtrl
 *
 * This controller is needed to toggle the overlay. It is used within the fullscreen overlay directive.
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