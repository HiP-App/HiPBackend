/**
 * Created by Jörg Amelunxen on 09.12.14.
 */

function addBufferedGroupInGroupControllerToScope($scope) {
    $scope.gc = {};
    $scope.gc.bufferedGroup = {};
    $scope.gc.bufferedGroup.name = "Dummy-Stub";
}

function initChatControllerAndFetchGroupWithUID1($scope, $httpBackend) {
    addBufferedGroupInGroupControllerToScope($scope);

    $httpBackend.expectGET('/admin/chat/1').respond(200, {
    });
    $httpBackend.expectPOST('/admin/chat/true').respond(200, {
    });
    $httpBackend.flush();
}

function addChatMessagesToTheTestChat(controller) {
    controller.chat.message = [];
    controller.chat.sender = [];
    controller.chat.message.push("message1");
    controller.chat.message.push("message2");
    controller.chat.sender.push("sender1");
    controller.chat.sender.push("sender2");
}

describe('Testsuite for the ChatController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var routeParams = {};
    routeParams.uID = 1;

    beforeEach(function () {
        module('myApp.chat');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        controller = $controller('ChatCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('fetches the chat with uID 1 and initializes a new chat', function () {
        initChatControllerAndFetchGroupWithUID1($scope, $httpBackend);
    });

    it('sends a new message while using the postMessage(false,...) function', function () {
        initChatControllerAndFetchGroupWithUID1($scope, $httpBackend);

        controller.postMessage(false,"dummy");
        $httpBackend.expectPOST('/admin/chat/false').respond(200, {
            name: "dummy",
            message: "dummyMessage",
            sender: "dummy"
        });
        $httpBackend.flush();
    });

    it('reverses the order of the internal chat messages with the prepareChatMessages function', function(){
        initChatControllerAndFetchGroupWithUID1($scope, $httpBackend);

        addChatMessagesToTheTestChat(controller);

        controller.prepareChatMessages();

        expect(controller.chat.message[0]).toBe(controller.messagesJSON[1].content);
        expect(controller.chat.message[1]).toBe(controller.messagesJSON[0].content);

        expect(controller.chat.sender[0]).toBe(controller.messagesJSON[1].sender);
        expect(controller.chat.sender[1]).toBe(controller.messagesJSON[0].sender);
    });
});