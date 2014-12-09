/**
 * Created by jorgamelunxen on 09.12.14.
 */

function setUserToStudent(controller) {
    controller.role = 'student';
}

function setUserToSupervisor(controller) {
    controller.role = 'supervisor';
}

describe('Testsuite for the userController', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var $attrs = {};
    $attrs.mail = "dummy@dummy.com";
    $attrs.firstname = "John";

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        controller = $controller('UserCtrl', {
            $scope: $scope,
            $attrs: $attrs
        });
    }));

    it('returns true for student if user is a student', function(){
        setUserToStudent(controller);

        expect(controller.isStudent()).toBe(true);
    });

    it('returns false for student if user is a supervisor', function(){
        setUserToSupervisor(controller);

        expect(controller.isStudent()).toBe(false);
    });

    it('returns true for supervisor if user is a supervisor', function(){
        setUserToSupervisor(controller);

        expect(controller.isSupervisor()).toBe(true);
    });

    it('returns false for supervisor if user is a student', function(){
        setUserToStudent(controller);

        expect(controller.isSupervisor()).toBe(false);
    });
});