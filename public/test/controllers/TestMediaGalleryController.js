/**
 * Created by Jörg Amelunxen on 07.01.15.
 */

describe('Testsuite for the MediaGalleryController:', function () {
    var controller = null, $scope = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();
        controller = $controller('GalleryCtrl', {
            $scope: $scope
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to delete a picture', function () {
        controller.deletePicture('1');

        $httpBackend.expectDELETE('/admin/picture/1').respond(200,{});

        $httpBackend.flush();
    });

    it('is able to append an image to the content of the given topic', function () {
        /* create a mock topic controller */
        var mockTc = {};
        mockTc.appendToContent = function(){ /* empty function */};

        /* spy on it */
        spyOn(mockTc, 'appendToContent');

        /* call the function */
        controller.sendTo(mockTc, "TestMessage");

        /* expect call */
        expect(mockTc.appendToContent).toHaveBeenCalledWith("<img src='/admin/picture/TestMessage' width='20%' height='20%'>");
    });
});