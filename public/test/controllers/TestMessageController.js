/**
 * Created by Jörg Amelunxen on 09.12.14.
 */

var testMessage1 = {
    uID: '1',
    receiver: 'rec',
    sender: 'sender1',
    title: 'dummyTitle',
    content: 'somecontent'
};

var testMessage2 = {
    uID: '2',
    receiver: 'rec',
    sender: 'sender2',
    title: 'anotherDummyTitle',
    content: 'againSomecontent'
};

var formMessage = {
    receiver: "receiver",
    sender: "sender",
    title: "title",
    content: "content"
};

function initMessageData($scope, $httpBackend){
    $httpBackend.expectGET('/admin/messages/all/dummy');
    $httpBackend.expectGET('/admin/messages/view/1');
    $httpBackend.flush();
}

function fillFormValues(controller){
    controller.messageThatGetsCurrentlyCreated.title      = "title";
    controller.messageThatGetsCurrentlyCreated.receiver   = "receiver";
    controller.messageThatGetsCurrentlyCreated.content    = "content";
};

describe('Testsuite for the MessageController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var routeParams = {};
    routeParams.messageID = 1;
    routeParams.recName = "dummy";

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;

        $httpBackend.when('GET','/admin/messages/all/dummy')
            .respond([testMessage1,testMessage2]);

        $httpBackend.when('GET','/admin/messages/view/1')
            .respond([testMessage1]);

        $scope = $rootScope.$new();

        controller = $controller('MessageCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('fetches the message data for all messages and a specific one', function () {
        initMessageData($scope, $httpBackend);
    });

    it('sends a message with the send message function', function(){
        initMessageData($scope, $httpBackend);

        fillFormValues(controller);

        controller.sendMessage('sender');

        formMessage.uID = Tooling.lastGeneratedRandomUID;
        $httpBackend.expectPOST('/admin/messages',formMessage).respond(200,{});
        $httpBackend.flush();
    });

    it('deletes a message with the deleteMessage function', function(){
        initMessageData($scope, $httpBackend);

        var amountOfMessagesInSystem = controller.messages.length;
        controller.deleteMessage('1');

        $httpBackend.expectDELETE('/admin/messages/1').respond(200,{});
        $httpBackend.flush();

        expect(controller.messages.length)
            .toBe(amountOfMessagesInSystem-1);
    });

});