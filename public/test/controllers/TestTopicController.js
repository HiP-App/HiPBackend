/**
 * Created by Jörg Amelunxen on 14.12.14.
 */

describe('Testsuite for the TopicController:', function () {
    var controller = null, $scope = null, $httpBackend = null;
    var gc = {};
    var routeParams = {};
    routeParams.topicID = 1;
    routeParams.userID = "anUser";

    function initTestVariables() {
        var demoTopic1 = {
            uID: "1",
            name: "aTopic",
            group: "groupID1",
            createdBy: "anUser",
            content: "...",
            status: "wip",
            constraints: ["constraintA"]
        };
        var demoTopic2 = {
            uID: "2",
            name: "aTopic2",
            group: "groupID1",
            createdBy: "anUser",
            content: "...",
            status: "wip",
            constraints: ["constraintA"]
        };
        var demoConstraint = {
            uID: "constraintA",
            name: "character_limitation",
            topic: "1",
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };
        return {demoTopic1: demoTopic1, demoTopic2: demoTopic2, demoConstraint: demoConstraint};
    }

    var __ret           = initTestVariables();
    var demoTopic1      = __ret.demoTopic1;
    var demoTopic2      = __ret.demoTopic2;
    var demoConstraint  = __ret.demoConstraint;
    var demoTopicList   = [demoTopic1, demoTopic2];

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;

        $httpBackend.when('GET', '/admin/topicbyuser/anUser')
            .respond(demoTopicList);

        $httpBackend.when('GET', '/admin/topicbyuser/1')
            .respond([demoTopic1]);

        $httpBackend.when('GET', '/admin/topicbyuser/2')
            .respond([demoTopic2]);

        $httpBackend.when('GET', '/admin/topic/1')
            .respond([demoTopic1]);

        $httpBackend.when('GET', '/admin/constraints/1')
            .respond([demoConstraint]);

        $httpBackend.when('POST','/admin/constraints')
            .respond(200,{});

        $httpBackend.when('POST','/admin/topic')
            .respond(200,{});

        $scope = $rootScope.$new();

        /* Mock user controller */
        var uc = {};
        uc.email = "anUser";

        /* Mock for group controller */
        gc.setTopicAtGroup = function(){};
        gc.createNotificationAtGroup = function(){};
        gc.createNotificationAtGroupAndSetTopic = function(){};

        /* add mocked user controller resp.
         group controller to scope */
        $scope.uc = uc;
        $scope.gc = gc;

        /* create controller */
        controller = $controller('TopicCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });

        var __ret           = initTestVariables();
        demoTopic1      = __ret.demoTopic1;
        demoTopic2      = __ret.demoTopic2;
        demoConstraint  = __ret.demoConstraint;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initController() {
        $httpBackend.flush();

        /* check getTopicByTopicID */
        expect(controller.currentTopic.uID).toBe('1');
        expect(controller.currentTopic.name).toBe('aTopic');

        /* check getTopicsByUserID */
        expect(controller.currentUserTopics[0].uID).toBe('1');
        expect(controller.currentUserTopics[0].name).toBe('aTopic');

        /* check getConstraintsForThisTopic */
        expect(controller.constraintsForThisTopic[0].uID).toBe('constraintA');
    }

    it('fetches the topic data on init', function () {
        initController();
    });

    it('updates a topic with the updateTopic function', function () {
        initController();

        var updateTopic = {
            uID: demoTopic1.uID,
            name: demoTopic1.name,
            group: demoTopic1.group,
            createdBy: demoTopic1.createdBy,
            content: demoTopic1.content,
            status: demoTopic1.status,
            constraints: demoTopic1.constraints[0]
        };
        /* prepare controller
            => set the needed String representation manually
         */
        controller.modifyTopicID            = demoTopic1.uID;
        controller.modifyTopicName          = demoTopic1.name;
        controller.modifyTopicContent       = demoTopic1.content;
        controller.modifyTopicGroup         = demoTopic1.group;
        controller.modifyTopicStatus        = demoTopic1.status;
        controller.modifyTopicCreatedBy     = demoTopic1.createdBy;
        controller.modifyTopicConstraints   = demoTopic1.constraints[0];

        /* update */
        controller.updateTopic();

        $httpBackend.expectPUT('/admin/topic', updateTopic)
            .respond(200,{});
        $httpBackend.flush();
    });

    it('updates a topic with the updateStatus function', function (){
        initController();

        /* mock for alert controller and
        language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatus(mockAC,mockLC,msg);

        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.expectPUT('/admin/constraints')
            .respond(200,{});
        $httpBackend.flush();

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('deletes the current topic with the deleteCurrentTopic function', function () {
        initController();

        /* prepare controller
         => set the needed String representation manually
         */
        controller.modifyTopicID = demoTopic1.uID;

        controller.deleteCurrentTopic();

        $httpBackend.expectDELETE('/admin/topic/'+demoTopic1.uID)
            .respond(200,{});
        $httpBackend.flush();
    });

    it('creates a new topic with the create topic function', function() {
        initController();

        spyOn(gc,'setTopicAtGroup');
        spyOn(gc,'createNotificationAtGroup');
        spyOn(gc,'createNotificationAtGroupAndSetTopic');

        /* prepare controller */
        controller.currentTopicSubTopicsAsString = "";

        /* create topic */
        controller.createTopic();

        //expect(gc.setTopicAtGroup).toHaveBeenCalled();
        //expect(gc.createNotificationAtGroup).toHaveBeenCalled();
        expect(gc.createNotificationAtGroupAndSetTopic).toHaveBeenCalled();

        $httpBackend.flush();
    });

    it('checks if the Group id of the currently loaded topic is set with the' +
        'currentTopicGroupIdIsSet function', function () {
        initController();

        controller.currentTopic.groupID = "anID";

        expect(controller.currentTopicGroupIdIsSet()).toBe(true);
    });

    it('checks if the Group id of the currently loaded topic is set with the' +
        'currentTopicGroupIdIsSet function and returns false iff it is not' +
        'the case', function () {
        initController();

        controller.currentTopic.groupID = undefined;

        expect(controller.currentTopicGroupIdIsSet()).toBe(false);
    });

    it('is able to send a new alert to the alert system with the sendAlert function', function () {
        initController();

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.sendAlert(mockAC,mockLC,msg);

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('is able to update the constraints of the current topic with the ' +
        'updateConstraints function if the constraint is a character_limitation' +
        'constraint', function () {
        initController();

        controller.updateConstraints();

        var constraintInController = controller.constraintsForThisTopic[0];

        var checkAgainstThisConstraint = constraintInController;

        /* update length */
        checkAgainstThisConstraint.valueInTopic = ""+demoTopic1.content.length;

        /* expect and check the PUT request */
        $httpBackend.expectPUT('/admin/constraints', checkAgainstThisConstraint)
            .respond(200,{});
        $httpBackend.flush();
    });

    it('is able to update the constraints of the current topic with the ' +
        'updateConstraints function if the constraint is a img_limitation' +
        'constraint', function () {
        initController();

        /* modify constraint to a image limitation one */
        controller.constraintsForThisTopic[0].name          = "img_limitation";
        controller.constraintsForThisTopic[0].valueInTopic  = "0";

        /* modify topic content */
        controller.currentTopic.content = "<img>";

        /* call the update function */
        controller.updateConstraints();

        var constraintInController = controller.constraintsForThisTopic[0];

        var checkAgainstThisConstraint = constraintInController;

        /* update length */
        checkAgainstThisConstraint.valueInTopic = "1";

        /* expect and check the PUT request */
        $httpBackend.expectPUT('/admin/constraints', checkAgainstThisConstraint)
            .respond(200,{});
        $httpBackend.flush();
    });

    it('is able to check if the constraints for the current topic are fulfilled', function () {
        initController();

        expect(controller.constraintsFulfilled()).toBe(true);
    });

    it('is able to check if the constraints for the current topic are fulfilled' +
        'and returns false if it is not the case', function () {
        initController();

        controller.constraintsForThisTopic[0].fulfilled = false;

        expect(controller.constraintsFulfilled()).toBe(false);
    });

    it('updates the status iff all constraints are fulfilled', function () {
        initController();

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(){};

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatusIfAllowedByContraints(mockAC,mockLC,msg);

        $httpBackend.expectPUT('/admin/topic')
            .respond(200,{});

        $httpBackend.expectPUT('/admin/constraints')
            .respond(200,{});
        $httpBackend.flush();

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('updates the status iff all constraints are fulfilled and sends an alert ' +
        'if not all constraints are fulfilled', function () {
        initController();

        controller.constraintsForThisTopic[0].fulfilled = false;

        /* mock for alert controller and
         language controller */
        var mockAC = {};
        var mockLC = {};

        mockAC.addAlert = function(){};
        mockLC.getTerm  = function(term){
            if(term == 'notification_alert_failDueToContraints'){
                return "notification_alert_failDueToContraints";
            }
            else{
                return "unknown";
            }
        };

        /* create the spy */
        spyOn(mockAC,'addAlert');
        spyOn(mockLC,'getTerm');

        var msg = "aMessage";

        controller.updateStatusIfAllowedByContraints(mockAC,mockLC,msg);

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });
});