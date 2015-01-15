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
        var imageLink = "<img src=\"http://blog.recrutainment.de/wp-content/uploads/2012/06/Lorem_Ipsum_Jung_von_Matt.png\" alt=\"dummyPic\">";
        var demoTopic1 = {
            uID: "1",
            name: "aTopic",
            group: "groupID1",
            createdBy: "anUser",
            content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, " +
                imageLink +
                "sed diam nonumy eirmod tempor " +
                imageLink +
                "invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
            status: "wip",
            constraints: ["constraintA"],
            deadline : "2020-01-14T23:00:00.000Z"
        };

        var demoTopic2 = {
            uID: "2",
            name: "aTopic2",
            group: "groupID1",
            createdBy: "anUser",
            content: "...",
            status: "wip",
            constraints: ["constraintA"],
            deadline : "2013-01-14T23:00:00.000Z"
        };

        var demoSubTopic = {
            uID: "3",
            name: "aSubTopic",
            group: "groupID1",
            createdBy: "1",
            content: "...",
            status: "done",
            constraints: ["constraintA"],
            deadline : "2015-01-14T23:00:00.000Z"
        };

        var demoConstraint = {
            uID: "constraintA",
            name: "character_limitation",
            topic: "1",
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };

        var footnote1 = {
            uID: "footnote1",
            content: "Foot1",
            creator: "JonDoe@dummy.com",
            linkedToTopic: "1"
        };

        var footnote2 = {
            uID: "footnote2",
            content: "Foot2",
            creator: "JonDoe@dummy.com",
            linkedToTopic: "1"
        };

        var media1 = {
            uID: "media1",
            topic: "1"
        };

        var historyObject = {
            uID: "his1",
            content: "Bla",
            editor: "John Doe",
            topicID: "1",
            versionNumber: "2"
        };

        return {demoTopic1: demoTopic1, demoTopic2: demoTopic2,
            demoSubTopic: demoSubTopic, demoConstraint: demoConstraint,
            footnote1: footnote1, footnote2: footnote2,
            media1: media1, historyObject: historyObject};
    }

    var __ret           = initTestVariables();
    var demoTopic1      = __ret.demoTopic1;
    var demoTopic2      = __ret.demoTopic2;
    var demoSubTopic    = __ret.demoSubTopic;
    var demoConstraint  = __ret.demoConstraint;
    var demoTopicList   = [demoTopic1, demoTopic2];

    var demoFootnote1   = __ret.footnote1;
    var demoFootnote2   = __ret.footnote2;
    var media1          = __ret.media1;
    var historyObject   = __ret.historyObject;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;

        $httpBackend.when('GET', '/admin/topicbyuser/anUser')
            .respond(demoTopicList);

        $httpBackend.when('GET', '/admin/topicbyuser/1')
            .respond([demoSubTopic]);

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

        $httpBackend.when('GET','/admin/footnotesByTopic/1')
            .respond(200,[demoFootnote1,demoFootnote2]);

        $httpBackend.when('GET','/admin/history/1')
            .respond(200,[historyObject]);

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
        demoTopic1          = __ret.demoTopic1;
        demoTopic2          = __ret.demoTopic2;
        demoSubTopic        = __ret.demoSubTopic;
        demoConstraint      = __ret.demoConstraint;

        demoFootnote1       = __ret.footnote1;
        demoFootnote2       = __ret.footnote2;

        media1              = __ret.media1;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initController() {
        $httpBackend.expectGET('/admin/pictureForTopic/1').respond(200,[media1]);

        $httpBackend.flush();

        /* check getTopicByTopicID */
        expect(controller.currentTopic.uID).toBe('1');
        expect(controller.currentTopic.name).toBe('aTopic');

        /* check getTopicsByUserID */
        expect(controller.currentUserTopics[0].uID).toBe('1');
        expect(controller.currentUserTopics[0].name).toBe('aTopic');

        /* check getConstraintsForThisTopic */
        expect(controller.constraintsForThisTopic[0].uID).toBe('constraintA');

        /* check version number */
        expect(controller.topicVersion).toBe('2');
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

        $httpBackend.expectPOST('/admin/history').respond(200,{});

        $httpBackend.flush();

        expect(mockAC.addAlert).toHaveBeenCalled();
        expect(mockLC.getTerm).toHaveBeenCalled();
    });

    it('deletes the current topic with the deleteCurrentTopic function and includes sub-topics' +
        'within this process', function () {
        initController();

        /* prepare controller
         => set the needed String representation manually
         */
        controller.modifyTopicID = demoTopic1.uID;

        controller.deleteCurrentTopic();

        $httpBackend.expectDELETE('/admin/topic/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of subtopic and the chat system */
        $httpBackend.expectDELETE('/admin/topic/'+demoSubTopic.uID)
            .respond(200,{});

        /* expect deletion of chat system */
        $httpBackend.expectDELETE('/admin/chat/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of history */
        $httpBackend.expectDELETE('/admin/history/'+demoTopic1.uID)
            .respond(200,{});

        /* expect deletion of chat system */
        $httpBackend.expectDELETE('/admin/chat/'+demoSubTopic.uID)
            .respond(200,{});

        /* expect deletion of history */
        $httpBackend.expectDELETE('/admin/history/'+demoSubTopic.uID)
            .respond(200,{});

        $httpBackend.flush();
    });

    it('creates a new topic with the create topic function', function() {
        initController();

        spyOn(gc,'createNotificationAtGroupAndSetTopic');

        /* prepare controller */
        controller.currentTopicSubTopicsAsString = "";

        /* create topic */
        controller.createTopic();

        expect(gc.createNotificationAtGroupAndSetTopic).toHaveBeenCalled();

        /* expect the creation of the chat */
        var expectedChat = {
            uID     : demoTopic1.uID,
            name    : demoTopic1.name + " Chat",
            message : [""],
            sender  : [""]
        };

        $httpBackend.expectPOST('/admin/chat/true',expectedChat).respond(200,{});

        /* expect creation of the history object */
        $httpBackend.expectPOST('/admin/history').respond(200,{});
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

        $httpBackend.expectPOST('/admin/history').respond(200,{});

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

    it('is able to fill the list of pictures for a given topic content', function () {
        initController();

        /*
        controller.preparePictureList(); is implicitly done in the
        init process */

        expect(controller.listOfPictures.length).toBe(2);
    });

    it('is able to check if the current time is before the deadline', function () {
        initController();

        var deadlineReached = controller.deadlineReached();

        expect(deadlineReached).toBe(false);
    });

    it('is able to check if the current time is after the deadline', function () {
        initController();

        controller.currentTopic.deadline = "2013-01-14T23:00:00.000Z";

        var deadlineReached = controller.deadlineReached();

        expect(deadlineReached).toBe(true);
    });

    it('is able to download topics by a given status', function () {
        initController();

        controller.getTopicsByStatus('done');

        $httpBackend.expectGET('/admin/topicbystatus/done').respond(200,demoSubTopic);
        $httpBackend.flush();
    });

    it('is able to get the footnotes for a given topic', function () {
        initController();

        /*
         controller.getFootnotes(uID); is implicitly done in the
         init process */

        expect(controller.footnotes.length).toBe(2);
    });

    it('is able to save a new footnote', function () {
        initController();

        var contentOfTheFootnote = "I am a footnote";
        var note = Tooling.createFootnote(Tooling.generateUID(contentOfTheFootnote), contentOfTheFootnote,
                                            "dummy@dummy.com","1");

        controller.storeFootnote(note);

        $httpBackend.expectPOST('/admin/footnote',note).respond(200,{});
        $httpBackend.flush();
    });

    it('is able to delete a specific footnote', function () {
        initController();

        controller.deleteFootnote("footnote1");

        $httpBackend.expectDELETE('/admin/footnote/footnote1').respond(200,{});
        $httpBackend.flush();
    });

    it('is able to fetch the Media list for a topic', function () {
        initController();

        /*
         controller.getMediaForTopic(topicID); is implicitly done in the
         init process */

        expect(controller.media.length).toBe(1);
    });

    it('is able to append a String to the current topic', function () {
        initController();

        var appendThis = "AppendMe";
        var oldContent = demoTopic1.content;

        controller.appendToContent(appendThis);

        expect(controller.currentTopic.content).toBe(oldContent + appendThis);
    });

    it('is able to push a new media file to the controller', function () {
        initController();

        var mediaDummy = {uID: 'DummyMedia'};

        controller.pushNewMedia(mediaDummy);

        var upper  = controller.media.pop();

        expect(upper.uID).toBe("DummyMedia");
    });

    it('is able to create a new/empty history for a given topicID', function () {
        initController();

        var topicID = "1";
        controller.initHistory(topicID);

        $httpBackend.expectPOST('/admin/history').respond(200,{});
        $httpBackend.flush();
    });


    it('is able to remove the history of a topic', function () {
        initController();

        controller.deleteHistory('1');

        $httpBackend.expectDELETE('/admin/history/1').respond(200,{});
        $httpBackend.flush();
    });
});