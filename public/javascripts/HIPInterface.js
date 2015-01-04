/**
 * Created by Jörg Amelunxen on 28.11.14.
 */
    //FIXME put this into services
var DEBUG = false;

var Interface = {};
var Tooling = {};
Tooling.lastGeneratedRandomUID = "";

Interface.possibleContraints = ["character_limitation","img_limitation"];

/**
 * Adds the fitting language term to a given constraint in JSON format
 *
 * @param constraintJSON    the constraint in JSON format that should get the
 *                          language term
 */
Interface.addLanguageTermToConstraint = function (constraintJSON) {
    if (constraintJSON.name == 'character_limitation') {
        constraintJSON.languageTerm = 'system_amount_chars';
    } else if (constraintJSON.name == 'img_limitation') {
        constraintJSON.languageTerm = 'system_amount_pics';
    }
};

/**
 * Generates a uID for a given input String
 *
 * @param inputString   some text, e.g., a group name
 * @returns {string}    the corresponding -random- uID
 */
Tooling.generateUID = function(inputString){
    var timestamp = Math.round(new Date().getTime() / 1000);

    var uID = Sha1.hash(inputString + Math.floor((Math.random() * 100000) + 1) + timestamp);
    Tooling.lastGeneratedRandomUID = uID;
    return uID;
};

/**
 * The function creates a message object with the given data
 *
 * @param uID           uID of the message object
 * @param receiver      reciever of the message object
 * @param sender        sender of the message object
 * @param title         title of the message
 * @param content       content of the message
 * @returns {{uID: *, receiver: *, sender: *, title: *, content: *}}
 */
Tooling.createMessageObject = function(uID, receiver, sender, title, content){
    return {
        uID: uID,
        receiver:   receiver,
        sender:     sender,
        title:      title,
        content:    content
    };
};

/**
 * The function creates a footnote object with the given data
 *
 * @param uID           uID of the footnote object
 * @param content       content of the footnote
 * @param creator       creator of the footnote
 * @param linkedToTopic topic that uses this footnote
 * @returns {{uID: *, content: *, creator: *, linkedToTopic: *}}
 */
Tooling.createFootnote = function(uID, content, creator, linkedToTopic){
    return {
        uID: uID,
        content: content,
        creator: creator,
        linkedToTopic: linkedToTopic
    };
};

/**
 * The function creates a topic object with the given data
 *
 * @param uID           uID of the topic
 * @param topicname     name of the topic
 * @param groupID       id of the assigned group
 * @param createdBy     creator of this topic. This may also be another topic.
 * @param content       content of the topic
 * @param topicStatus   status of the topic. I.e., 'wip', 'ir' or 'done'
 * @param constraintArray   An array containing all constraints for this topic
 * @param deadline              the deadline for the given topic
 * @returns {{uID: *, name: *, group: *, createdBy: *, content: *, status: *, constraints: *}}
 */
Tooling.createTopicObject = function(uID, topicname, groupID, createdBy, content, topicStatus, constraintArray, deadline){
    return {
        uID:        uID,
        name:       topicname,
        group:      groupID,
        createdBy:  createdBy,
        content:    content,
        status:     topicStatus,
        constraints:constraintArray,
        deadline:   deadline
    };
};

/**
 * This method creates a chat with the given information
 *
 * @param $http
 * @param uID       uID of the chat - is in most cases the same ID of the object that owns the
 *                  chat, e.g., groups, topics, etc.
 * @param name      the name of the chat
 */
Interface.createChat = function($http, uID, name){
    var chat = {
        uID     : uID,
        name    : name,
        message : [""],
        sender  : [""]
    };

    $http.post('/admin/chat/true', chat).
        success(function(data, status, headers, config) {
        }).
        error(function(data, status, headers, config) {
        });
};

/**
 * This function deletes an existing chat
 *
 * @param $http     dependency of the function
 * @param uID       of the chat that should be deleted
 */
Interface.deleteChat = function($http, uID){
    $http.delete('/admin/chat/'+uID).
        success(function(data, status, headers, config) {
        }).
        error(function(data, status, headers, config) {
        });
};

/**
 * Creates all needed/possible constraints for a given topic in JSON format
 *
 * @param $http         dependency needed for posting data to the REST interface
 * @param subTopicJSON  the corresponding topic in JSON format
 */
Interface.createConstraints = function($http, subTopicJSON){
    Interface.possibleContraints.forEach(function(constraint){
        var constraintJSON = {
            uID: Tooling.generateUID(constraint),
            name: constraint,
            topic: subTopicJSON.uID,
            valueInTopic: "0",
            value: "0",
            fulfilled: true
        };

        Interface.addLanguageTermToConstraint(constraintJSON);
        subTopicJSON.constraints.push(constraintJSON.uID);

        if (DEBUG){
            console.log("info TopicController: posting constraint ");
            console.log(constraintJSON);
        }

        $http.post('/admin/constraints', constraintJSON).
            success(function (data, status, headers, config) {
            }).
            error(function (data, status, headers, config) {
            });
    });
};

/**
 * The function sends a private message.
 *
 * @param $http         dependency needed for posting data to the REST interface
 * @param tempMessage   the message that should be sent
 * @param debugFlag     debug true/false
 */
Interface.sendPrivateMessage = function ($http, tempMessage, debugFlag) {
    $http.post('/admin/messages', tempMessage).
        success(function (data, status, headers, config) {
            if (debugFlag) {
                console.log("info MessageCtrl: Message sending completed");
            }
        }).
        error(function (data, status, headers, config) {
            if (debugFlag) {
                console.log("error MessageCtrl: Error while sending message");
            }
        });
};

/**
 * Creates a new topic with the given information
 *
 * @param topicname             the name of the topic
 * @param subTopicsAsString     all sub topics
 * @param groupID               the id of the group that works on this topic
 * @param refToGrpController    reference to group controller
 * @param mainTopicCreatedBy    creator of the main topic
 * @param $http                 reference to the http interface
 * @param deadline              the deadline for the given topic
 */
Interface.createTopic = function (topicname, subTopicsAsString, groupID, refToGrpController, mainTopicCreatedBy, $http,
                                  deadline) {
    var currentTopicID = Tooling.generateUID(topicname);

    /* create all sub-topics */
    if(subTopicsAsString == undefined)
        subTopicsAsString = "";
    else{
        var subtopics = subTopicsAsString.split(',');
        subtopics.forEach(function (subTopic) {
            var currentSubTopicID = Tooling.generateUID(subTopic);

            var subTopicJSON = Tooling.createTopicObject(currentSubTopicID, subTopic, groupID, currentTopicID, "",
            "wip", [], deadline);

            Interface.createConstraints($http, subTopicJSON);

            $http.post('/admin/topic', subTopicJSON).
                success(function (data, status, headers, config) {
                }).
                error(function (data, status, headers, config) {
                });
        });
    }

    /* create actual main topic */
    var topic = Tooling.createTopicObject(currentTopicID, topicname, groupID, mainTopicCreatedBy, "", "wip", [], deadline);
    Interface.createConstraints($http, topic);

    if (DEBUG){
        console.log("info TopicController: posting topic with name: " + topic.name)
    }

    // post
    $http.post('/admin/topic', topic).
        success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    if (groupID != "" || groupID != "undefined") {
        // adding notification
        if (DEBUG) {
            console.log("info TopicController: posting notification to group with ID " + groupID);
        }

        refToGrpController.createNotificationAtGroupAndSetTopic(groupID,
            currentTopicID, "system_notification_groupTopicChanged",[topicname])
    }
};


