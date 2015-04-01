/**
 * Created by Jörg Amelunxen on 07.01.15.
 */

describe('Testsuite for the MediaGalleryController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var routeParams = {};
    var storageObject = "";

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        storageObject = [{
            uID: "uID_1",
            list: ["type#newName","key1#value1","key2#value2"]
        }];

        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();
        controller = $controller('GalleryCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to delete a picture', function () {
        /* init KeyValueService */
        $httpBackend.expect('GET', '/admin/types').respond(200, {});
        $httpBackend.flush();

        controller.deletePicture('1');

        $httpBackend.expectDELETE('/admin/picture/1').respond(200,{});

        $httpBackend.flush();
    });

    it('is able to append an image to the content of the given topic', function () {
        /* init KeyValueService */
        $httpBackend.expect('GET', '/admin/types').respond(200, {});
        $httpBackend.flush();

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

    it('is able to update the type of a given image', function () {
        /* init KeyValueService */
        var typeObject = {
            uID: "uID_new",
            name: 'newName',
            extendsType: 'root',
            system: false,
            keys: ['ownAttr'],
            values: ['myValue']
        };

        $httpBackend.expect('GET', '/admin/types').respond(200, [typeObject]);
        $httpBackend.flush();

        /* prepare test case */
        var mockStore = {
            uID: "storeUID",
            keys: [],
            list: [],
            type: "demo"
        };

        controller.store = mockStore;

        var newType = {
          uID: "new",
          name: "newName"
        };

        var expectJSON = {
            uID: "storeUID",
            list: ["type#newName"]
        };

        /* run */
        controller.updateType(newType);

        /* set type */
        $httpBackend.expect('PUT', '', expectJSON).respond(200,{});

        /* update missing fields */
        $httpBackend.expect('GET', '/admin/kv/storeUID').respond(200,storageObject);
        $httpBackend.expect('PUT', '/admin/kv/storeUID/ownAttr#initMe').respond(200,{});
        $httpBackend.flush();
    });
});