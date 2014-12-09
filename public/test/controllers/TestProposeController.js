/**
 * Created by Jörg Amelunxen on 09.12.14.
 */
function addDefaultData(controller) {
    controller.propose = {};
    controller.propose.name     = "DefaultName";
    controller.propose.content  = "DefaultContent";
}

describe('Testsuite for the ProposeController:', function () {
    var controller = null, $scope = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        controller = $controller('ProposeCtrl', {
            $scope: $scope
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to propose a new topic, which is internally stored, to the server via HTTP POST', function(){
        addDefaultData(controller);

        controller.proposeTopic('DefaultReceiver', 'DefaultSender', 'DefaultLanguageString');
        $httpBackend.expectPOST('/admin/messages',{
            uID:        Tooling.lastGeneratedRandomUID,
            receiver:   'DefaultReceiver',
            sender:     'DefaultSender',
            title:      'DefaultLanguageString DefaultName',
            content:    'DefaultContent'
        }).respond(200,{

        });
        $httpBackend.flush();

    });

});