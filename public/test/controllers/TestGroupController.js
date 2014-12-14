/**
 * Created by jorgamelunxen on 12.12.14.
 */

var demoGroup = {
    name: "Dummy",
    member: "someOne",
    createdBy: "Tester",
    topic: "someTopic",
    subtopics: "test",
    notifications: [""]
};

var demoGroup2 = {
    name: "AnotherDummy",
    member: "someOne2",
    createdBy: "Tester",
    topic: "someTopicAgain",
    subtopics: "test",
    notifications: [""]
};

describe('Testsuite for the GroupController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var gc = {};
    var routeParams = {};
    routeParams.uID = 1;

    beforeEach(function () {
        module('myApp.groups');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        $httpBackend.when('GET','/admin/group/1')
            .respond(200,[demoGroup]);

        $httpBackend.when('GET','/admin/groups')
            .respond(200,[demoGroup, demoGroup2]);

        $httpBackend.when('GET','/admin/topic/someTopic')
            .respond(200,[{}]);

        $httpBackend.when('POST','/admin/constraints')
            .respond(200,{});

        $httpBackend.when('POST','/admin/topic')
            .respond(200,{});

        /* Mock for user controller */
        var uc = {
          email: "Tester"
        };

        /* Mock for group controller */
        gc.setTopicAtGroup = function(){};
        gc.createNotificationAtGroup = function(){};

        /* Included mocked user controller and group controller in scope */
        $scope = {
            uc: uc,
            gc: gc
        };

        /* create controller */
        controller = $controller('GroupCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

        /* reset test data */
        demoGroup = {
            name: "Dummy",
            member: "someOne",
            createdBy: "Tester",
            topic: "someTopic",
            notifications: [""]
        };

        demoGroup2 = {
            name: "AnotherDummy",
            member: "someOne2",
            createdBy: "Tester",
            topic: "someTopicAgain",
            notifications: [""]
        };
    });

    function initGroupController() {
        /* all needed calls are handled via $httpBackend.when(...) */
        $httpBackend.flush();

        var nameOfTheDetailedGroupFetchedViaUID = controller.bufferedGroup.name;
        expect(nameOfTheDetailedGroupFetchedViaUID).toBe("Dummy");

        var lengthOfTheArrayForStoredGroups = controller.groups.length;
        expect(lengthOfTheArrayForStoredGroups).toBe(2);
    }

    it('fetches the needed Groups for the currently logged in user on startup and' +
        'the needed details about Group 1 because uID=1 within the routeParams', function(){
        initGroupController();
    });

    it('sets a topic at a group with the setTopicAtGroup function', function(){
        initGroupController();

        controller.setTopicAtGroup('1','topicID');

        /* call handled directly  - see above -
        $httpBackend.expectGET('/admin/group/1') */

        var changedGroup = demoGroup;
        changedGroup.topic = 'topicID';

        $httpBackend.expectPOST('/admin/modify/group',changedGroup)
            .respond('200',{});

        $httpBackend.flush();
    });

    it('creates a new notification at a grp with the createNotification function', function(){
        initGroupController();

        controller.createNotificationAtGroup('1','system_notification_groupCreated',['dummy']);

        var now = new Date();
        var notification = {
            groupID : '1',
            notification: 'system_notification_groupCreated,dummy ('+now.toLocaleString()+')'
        };

        $httpBackend.expectPOST('/admin/notification',notification)
            .respond('200',{});

        $httpBackend.flush();
    });

    it('creates a new group with the createGroup function', function(){
        initGroupController();

        spyOn(gc,'setTopicAtGroup');
        spyOn(gc,'createNotificationAtGroup');

        /* prepare controller */
        controller.userInGroupArray = ["dummy"];
        controller.currentGroup = demoGroup;

        var currentGroupTopic = {
            topic: "bla",
            subtopic: "..."
        };

        controller.currentGroupTopic = currentGroupTopic;

        /* create group */
        controller.createGroup('creator','John');

        expect(gc.setTopicAtGroup).toHaveBeenCalled();
        expect(gc.createNotificationAtGroup).toHaveBeenCalled();

        $httpBackend.expectPOST('/admin/group',demoGroup).respond(200,{});

        $httpBackend.flush();
        /* FIXME create chat system */
    });

    it('deletes a group with the deleteGroup function', function(){
        initGroupController();

        controller.deleteGroup('1');

        $httpBackend.expectDELETE('/admin/group/1').respond('200',{});
        $httpBackend.expectDELETE('/admin/chat/1').respond('200',{});

        $httpBackend.flush();
    });
});