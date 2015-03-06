/**
 * Created by Jörg Amelunxen on 18.01.15.
 *
 * This service contains functions that are needed by multiple controllers.
 * Note that it needs the Tooling Object for testing reasons.
 */
servicesModule.service('commonTaskService', function(){
    var that = this;

    var DEBUG = false;

    this.possibleContraints = Config.possibleContraints;

    /**
     * Generates a uID for a given input String
     *
     * @param inputString   some text, e.g., a group name
     * @returns {string}    the corresponding -random- uID
     */
    this.generateUID = function(inputString){
        var timestamp = Math.round(new Date().getTime() / 1000);

        if(inputString == undefined){
            console.log("Warning: undefined input String in generateUID function. Using " +
                "static seed.");
            inputString = "seed";
        }

        var uID = Sha1.hash(inputString + Math.floor((Math.random() * 100000) + 1) + timestamp);

        Tooling.secondlastGeneratedRandomUID = Tooling.lastGeneratedRandomUID;
        Tooling.lastGeneratedRandomUID = uID;
        return uID;
    };

    /**
     * The function creates a message object with the given data
     *
     * @param uID           uID of the message object
     * @param receiver      receiver of the message object
     * @param sender        sender of the message object
     * @param title         title of the message
     * @param content       content of the message
     * @returns {{uID: *, receiver: *, sender: *, title: *, content: *}}
     */
    this.createMessageObject = function(uID, receiver, sender, title, content){
        return {
            uID: uID,
            receiver:   receiver,
            sender:     sender,
            title:      title,
            content:    content
        };
    };

    /**
     * The function creates an empty history object
     * @param topicID the topic ID of the topic that is used for this history object
     * @param content
     * @param editor
     * @param versionNumber
     * @returns {{uID: string, content: string, editor: string, topicID: *, versionNumber: string, timeStamp: string}}
     */
    this.createHistoryObject = function(topicID, content, editor, versionNumber){
        Tooling.lastUsedTimeStamp = new Date().getTime();

        var returnObject = {
            uID: that.generateUID(topicID),
            content: "",
            editor: "System",
            topicID: topicID,
            versionNumber: "1",
            timeStamp: Tooling.lastUsedTimeStamp+""
        };

        if(content != undefined){
            returnObject.content = content;
        }

        if(editor != undefined){
            returnObject.editor = editor;
        }

        if(versionNumber != undefined){
            returnObject.versionNumber = versionNumber;
        }

        return returnObject;
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
    this.createFootnote = function(uID, content, creator, linkedToTopic){
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
     * @param tagstore
     * @param linkedTopics
     * @param maxCharTreshold
     * @param gps
     * @returns {{uID: *, name: *, group: *, createdBy: *, content: *, status: *, constraints: *}}
     */
    this.createTopicObject = function(uID, topicname, groupID, createdBy, content, topicStatus, constraintArray, deadline,
        tagstore, linkedTopics, maxCharTreshold, gps){

        if(tagstore == undefined){
            tagstore = [];
        }

        if(linkedTopics == undefined){
            linkedTopics = [];
        }

        if(maxCharTreshold == undefined){
            maxCharTreshold = "80";
        }

        if(gps == undefined){
            gps = ["",""];
        }

        return {
            uID:        uID,
            name:       topicname,
            group:      groupID,
            createdBy:  createdBy,
            content:    content,
            status:     topicStatus,
            constraints:constraintArray,
            deadline:   deadline,
            tagStore:   tagstore,
            linkedTopics: linkedTopics,
            maxCharThreshold: maxCharTreshold,
            gps: gps
        };
    };

    /**
     * Adds the fitting language term to a given constraint in JSON format
     *
     * @param constraintJSON    the constraint in JSON format that should get the
     *                          language term
     */
    this.addLanguageTermToConstraint = function (constraintJSON) {
        if (constraintJSON.name == 'character_limitation') {
            constraintJSON.languageTerm = 'system_amount_chars';
        } else if (constraintJSON.name == 'img_limitation') {
            constraintJSON.languageTerm = 'system_amount_pics';
        } else if (constraintJSON.name == 'max_character_limitation') {
            constraintJSON.languageTerm = 'system_amount_maxchars';
        }
    };

    /**
     * This method creates a chat with the given information
     *
     * @param $http
     * @param uID       uID of the chat - is in most cases the same ID of the object that owns the
     *                  chat, e.g., groups, topics, etc.
     * @param name      the name of the chat
     */
    this.createChat = function($http, uID, name){
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
    this.deleteChat = function($http, uID){
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
    this.createConstraints = function($http, subTopicJSON){
        that.possibleContraints.forEach(function(constraint){
            var constraintJSON = {
                uID: that.generateUID(constraint),
                name: constraint,
                topic: subTopicJSON.uID,
                valueInTopic: "0",
                value: "0",
                fulfilled: true
            };

            that.addLanguageTermToConstraint(constraintJSON);
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
     * Factory function for a type object
     * @param name
     * @param extendsType
     * @param keys
     * @param values
     * @param system
     * @returns {{uID: *, name: *, extendsType: *, keys: *, values: *, system: *}}
     */
    this.createTypeObject = function(name, extendsType, keys, values, system){
        return {
            uID: that.generateUID(name),
            name: name,
            extendsType: extendsType,
            keys: keys,
            values: values,
            system: system
        };
    };

    /**
     * Create only missing constraints for the given topicID. Furthermore, it returns the
     * created constraints.
     *
     * @param $http
     * @param constraints
     * @param topicID
     * @returns {Array}
     */
    this.createMissingConstraint = function($http, constraints, topicID){
        var createdConstraints = [];

        that.possibleContraints.forEach(function(con){
            var found = false;
            for(var i=0; i < constraints.length; i++){
                if(constraints[i].name == con){
                    found = true;
                }
            }

            if(!found){
                /* create it */
                var constraintJSON = {
                    uID: that.generateUID(topicID),
                    name: con,
                    topic: topicID,
                    valueInTopic: "0",
                    value: "0",
                    fulfilled: true
                };

                that.addLanguageTermToConstraint(constraintJSON);

                createdConstraints.push(constraintJSON);

                if (DEBUG){
                    console.log("info CTS: posting constraint ");
                    console.log(constraintJSON);
                }

                $http.post('/admin/constraints', constraintJSON).
                    success(function (data, status, headers, config) {
                    }).
                    error(function (data, status, headers, config) {
                    });
            }
        });

        return createdConstraints;
    };

    /**
     * The function sends a private message.
     *
     * @param $http         dependency needed for posting data to the REST interface
     * @param tempMessage   the message that should be sent
     * @param debugFlag     debug true/false
     */
    this.sendPrivateMessage = function ($http, tempMessage, debugFlag) {
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
    this.createTopic = function (topicname, subTopicsAsString, groupID, refToGrpController, mainTopicCreatedBy, $http,
                                      deadline) {
        var currentTopicID = that.generateUID(topicname);

        /* create all sub-topics */
        if (subTopicsAsString == undefined)
            subTopicsAsString = "";
        else {
            var subtopics = subTopicsAsString.split(',');
            subtopics.forEach(function (subTopic) {
                var currentSubTopicID = that.generateUID(subTopic);

                var subTopicJSON = that.createTopicObject(currentSubTopicID, subTopic, groupID, currentTopicID, "",
                    "wip", [], deadline);

                that.createConstraints($http, subTopicJSON);

                $http.post('/admin/topic', subTopicJSON).
                    success(function () {
                        /* create empty history */
                        var historyObject = that.createHistoryObject(currentSubTopicID);
                        $http.post('/admin/history', historyObject);
                    }).
                    error(function (data, status, headers, config) {
                    });
            });
        }

        /* create actual main topic */
        var topic = that.createTopicObject(currentTopicID, topicname, groupID, mainTopicCreatedBy, "", "wip", [], deadline);
        that.createConstraints($http, topic);

        if (DEBUG) {
            console.log("info TopicController: posting topic with name: " + topic.name)
        }

        // post
        $http.post('/admin/topic', topic).
            success(function () {
                /* create empty history */
                var historyObject = that.createHistoryObject(currentTopicID);
                $http.post('/admin/history', historyObject);
            }).
            error(function (data, status, headers, config) {
                console.log("Error commonTaskService: Could not create history entry");
            });

        if (groupID != "" || groupID != "undefined") {
            // adding notification
            if (DEBUG) {
                console.log("info TopicController: posting notification to group with ID " + groupID);
            }

            refToGrpController.createNotificationAtGroupAndSetTopic(groupID,
                currentTopicID, "system_notification_groupTopicChanged", [topicname]);
        }
    };

    /**
     * Copies the given topic with all given subtopics
     *
     * @param topic
     * @param listOfSubTopics
     * @param $http
     * @param refToGrpController
     */
    this.copyTopic = function(topic, listOfSubTopics, $http, refToGrpController){
        /* clear constraints */
        topic.constraints = [];

        listOfSubTopics.forEach(function(stopic){
            stopic.constraints = [];
        });

        /* use creation of constraints function */
        that.createConstraints($http, topic);

        listOfSubTopics.forEach(function(stopic){
            that.createConstraints($http, stopic);
        });

        /*  push stuff   */
        function pushTopic(pushThisTopic) {
            $http.post('/admin/topic', pushThisTopic).
                success(function () {
                    /* create empty history */
                    var historyObject = that.createHistoryObject(pushThisTopic.uID);
                    $http.post('/admin/history', historyObject);
                });
        }

        pushTopic(topic);
        refToGrpController.createNotificationAtGroupAndSetTopic(topic.group,
            topic.uID, "system_notification_groupTopicChanged", [topic.name]);

        listOfSubTopics.forEach(function(stopic){
            pushTopic(stopic);
        });
    };

});
