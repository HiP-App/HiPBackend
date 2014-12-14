/**
 * Created by Jörg Amelunxen on 09.12.14.
 */

describe('Testsuite for the OverlayController:', function () {
    var controller = null, $scope = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.overlay');
    });

    beforeEach(inject(function ($controller, $rootScope){
        $scope = $rootScope.$new();

        controller = $controller('OverlayCtrl', {
            $scope: $scope
        });
    }));

    it('toggles the shown overlay with the toggleOverlay method', function(){
        controller.overlayIsShown = false;
        controller.toggleOverlay();
        expect(controller.overlayIsShown).toBe(true);

        controller.toggleOverlay();
        expect(controller.overlayIsShown).toBe(false);
    });

});