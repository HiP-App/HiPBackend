/**
 * Created by Jörg Amelunxen on 09.12.14.
 */
function addDefaultUserWithRole(controller) {
    controller.currentRole = {};
    controller.currentRole.userid = "dummy";
    controller.currentRole.email = "dummy@dummy.com";
    controller.currentRole.role = "student";
}

describe('Testsuite for the RoleController:', function () {
    var controller = null, $scope = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        controller = $controller('RoleCtrl', {
            $scope: $scope
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to send a role, which is internally stored, to the server via HTTP PUT', function(){
        addDefaultUserWithRole(controller);

        controller.createOrUpdateRole();
        $httpBackend.expectPUT('/admin/roles').respond(200,{

        });
        $httpBackend.flush();

    });

});