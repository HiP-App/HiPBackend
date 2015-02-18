/**
 * Created by Jörg Amelunxen on 11.11.14.
 *
 * @class angular_module.controllersModule.TopicCtrl
 *
 * This is the major controller of the backend. It handles the change of topics, media entries, footnotes, etc.
 * Note that it needs the existence of an user controller (uc) in the current scope to work properly.
 */
controllersModule.controller('TopicCtrl', ['$scope','$http', '$routeParams','commonTaskService','LinkCreator','$timeout', function($scope,$http,$routeParams,commonTaskService, LinkCreator, $timeout) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.map = undefined;       // Stores the HERE MAP object

    this.HEREMAPS_ID = 'DemoAppId01082013GAL';
    this.HEREMAPS_CODE = 'AJKnXv84fjrb0KIHawS0Tg';

    this.topics = [];           // contains every topic

    this.currentTopicSubTopicsAsString = "";    // contains the list of the subtopics as it is written in the view

    this.subtopics = [];

    this.currentTopic = {};

    this.currentUserTopics = [];

    this.media = [];            // contains the list of media files for the current topic

    this.topicsByStatus = [];   // contains topics as soon as they are fetched for a specific status via the getTopicsByStatus function
    this.constraintsForThisTopic = [];
    this.maxchar = -1;          // contains the value of the maximal amount of characters
    this.maxcharThreshold = -1; // contains the threshold of the yellow/green light

    this.listOfPictures = [];   // contains a list of all pictures that are used resp. shown in this topic

    this.footnotes = [];        // stores the footnotes of the current topic

    this.temporaryFootnote = {}; // stores a footnote that is going to be created

    this.topicVersion       = -1; // this variable stores the current version number of the topic
    this.historyEntries     = []; // stores the entries of the topic history
    this.linksOfThisTopic   = []; // stores the links of this topic

    this.newLink            = undefined; // contains temporary information if a new link to another topic is going to be generated

    this.supervisor         = ""; // contains the supervisor of the currently loaded topic

    this.modifyTopicID      = "";
    this.modifyTopicName    = "";
    this.modifyTopicContent = "";
    this.modifyTopicGroup   = "";
    this.modifyTopicCreatedBy   = "";
    this.modifyTopicContraints  = [];
    this.modifyTopicDeadline    = [];

    this.cachedTopicForUIDTranslation = {
        uID: "-1",
        name: "-1"
    };

    /**
     * Clears the ModifyTopic buffer
     */
    this.clearBuffer = function(){
        that.modifyTopicID      = "";
        that.modifyTopicName    = "";
        that.modifyTopicContent = "";
        that.modifyTopicGroup   = "";
        that.modifyTopicStatus  = "";
        that.modifyTopicCreatedBy = "";
        that.modifyTopicDeadline  = "";
    };

    /**
     * Accepts a bunch of data for internal use. In general, this is only a string representation of the
     * topic JSON object
     *
     * @param topicID
     * @param topicName
     * @param topicContent
     * @param topicGroup
     * @param topicStatus
     * @param topicConstraints
     * @param topicCreatedBy
     */
    this.doSomethingWithTopic = function(topicID, topicName, topicContent, topicGroup, topicStatus, topicConstraints,
        topicCreatedBy, deadline){
        that.modifyTopicID      = topicID;
        that.modifyTopicName    = topicName;
        that.modifyTopicContent = topicContent;
        that.modifyTopicGroup   = topicGroup;
        that.modifyTopicStatus  = topicStatus;
        that.modifyTopicCreatedBy = topicCreatedBy;
        that.modifyTopicDeadline  = deadline;

        var constraintsAreInitialized = topicConstraints[0] != "" || topicConstraints != undefined;
        if(constraintsAreInitialized){
            that.modifyTopicConstraints = topicConstraints;
        }
        else{
            commonTaskService.initConstraintArray(that.modifyTopicConstraints);
        }
    };

    /**
     * This function posts a new History Object to the server
     * @param historyObject
     */
    this.postHistoryObject = function(historyObject){
        $http.post('/admin/history',historyObject);
    };

    /**
     * Sends an empty history object to the server. Used as a first history entry when a new topic gets created
     * @param topicID
     */
    this.initHistory = function(topicID){
        var historyObject = commonTaskService.createHistoryObject(topicID);

        $http.post('/admin/history',historyObject);
    };

    /**
     * Creates a new topic with the internally stored information and sends it to the server
     */
    this.createTopic = function(){
        commonTaskService.createTopic(that.currentTopic.name, that.currentTopicSubTopicsAsString, that.currentTopic.groupID,
            $scope.gc, $scope.uc.email, $http);

        /* create corresponding chat system */
        commonTaskService.createChat($http, that.currentTopic.uID, that.currentTopic.name + " Chat");
    };

    /**
     * This function prepares the creation of a new footnote. I.e., it creates the JSON object containing an UID,
     * the creator and the link to the current topic
     */
    this.prepareANewFootnote = function(){
        that.temporaryFootnote = {
            uID: commonTaskService.generateUID($scope.uc.email),
            creator: $scope.uc.email,
            linkedToTopic: that.currentTopic.uID
        };
    };

    /**
     * Sets the group if of the group that will work on this topic within the internal representation
     * if the topic.
     *
     * @param grpid     of the group that will work on this topic
     */
    this.setCurrentTopicGroupID = function(grpid){
        if(that.debug){
            console.log("info TopicController: Topic will be added to group " + grpid);
        }

        that.currentTopic.groupID = grpid;
    };

    /**
     * Returns true if the group id of the current topic is set
     *
     * @returns {boolean}
     */
    this.currentTopicGroupIdIsSet = function(){
        if(that.currentTopic.groupID != undefined && that.currentTopic.groupID != "")
            return true;
        else
            return false;
    };

    /**
     * Sends a new alert to the system
     *
     * @param ac    reference to the alert controller that is responsible in this view
     * @param lc    reference to the language controller that is responsible in this view
     * @param msg   the message that should be contained in the alert
     */
    this.sendAlert = function (ac, lc, msg) {
        if (ac != undefined && lc != undefined) {
            if (msg == undefined || msg == null) {
                ac.addAlert(lc.getTerm('notification_alert_changedStatus'), "info");
            }
            else {
                if(msg.indexOf('fail')>=0){
                    ac.addAlert(lc.getTerm(msg), "danger");
                }else{
                    ac.addAlert(lc.getTerm(msg), "info");
                }
            }
        }
    };

    /**
     * Updates the topic with the given ID with the changes that are specified in the JavaScript Object
     *
     * @param uIDOfTheTopic     The topic that should be changed/updated
     * @param changes           An JS-Object containing the changes. It structure is like:
     *                          {
     *                             keys: ["changeMe"],
     *                             changeMe: "new Value"
     *                          }
     * @param append            true, if the value has to be pushed/removed to an array
     *                          false, if the value should be overwritten
     * @param deleteMode        if true -> changes are destructive the given keys are going to be deleted
     */
    this.updateTopicAndBypassHistory = function(uIDOfTheTopic, changes, append, deleteMode){
        if(deleteMode == undefined || deleteMode == false){
            $http.get('/admin/topic/'+uIDOfTheTopic)
                .success(function(topic){
                    var topic = topic[0];

                    changes.keys.forEach(function(addKey){
                        if(append){
                            topic[addKey].push(changes[addKey]);
                        }else{
                            topic[addKey] = changes[addKey];
                        }
                    });

                    /* send modified topic back */
                    $http.put('/admin/topic', topic);
                });
        }else{
            /* DeleteMode is active */
            $http.get('/admin/topic/'+uIDOfTheTopic)
                .success(function(topic){
                    var topic = topic[0];
                    changes.keys.forEach(function(modifyKey){
                        if(append){
                            var pos = jQuery.inArray(changes[modifyKey], topic[modifyKey]);

                            topic[modifyKey].splice(pos,1);

                        }else{
                            topic[modifyKey] = changes[modifyKey];
                        }
                    });

                    /* send modified topic back */
                    $http.put('/admin/topic', topic);
                });
        }
    };

    /**
     * This function updates the content of the topic while bypassing the history. It is for example used to
     * initialize a topic with a template
     *
     * @param newContent        the new content of the topic
     */
    this.updateContentOfTheCurrentTopicWhileBypassingTheHistory = function(newContent){
            that.updateTopicAndBypassHistory(that.currentTopic.uID, {
                keys: ['content'],
                content: newContent
            }, false, false);
    };

    /**
     * This function updates the GPS data while bypassing the history.
     */
    this.updateGPS = function(){
        that.updateTopicAndBypassHistory(that.currentTopic.uID, {
            keys: ['gps'],
            gps: that.currentTopic.gps
        }, false, false);
    };

    /**
     * Updates the constraints of the current topic
     */
    this.updateConstraints = function(){
        /* update threshold */
        var changes = {
            keys: ['maxCharThreshold'],
            maxCharThreshold: that.maxcharThreshold+""
        };

        that.updateTopicAndBypassHistory(that.currentTopic.uID,changes,false,false);

        /* update constraints itself */
        var constraintNotFulfilledDebugOutput = function () {
            if (that.debug) {
                console.log("info TopicController: Constraint is not fulfilled");
            }
        };

        that.constraintsForThisTopic.forEach(function(constraint, index, theArray){
            // update data
            var constraintJSON = {
                uID: constraint.uID,
                name: constraint.name,
                topic: constraint.topic,
                valueInTopic: "0",
                value: constraint.value,
                fulfilled: true,
                languageTerm: constraint.languageTerm
            };

            // general check function
            var checkConstraint = function () {
                if ((constraintJSON.name.indexOf("max_") == -1 && parseInt(constraintJSON.valueInTopic) < parseInt(constraintJSON.value)) ||
                    (constraintJSON.name.indexOf("max_") >= 0 && parseInt(constraintJSON.valueInTopic) > parseInt(constraintJSON.value))) {
                    constraintJSON.fulfilled = false;
                    theArray[index].fulfilled = false;

                    constraintNotFulfilledDebugOutput();
                } else {
                    constraintJSON.fulfilled = true;
                    theArray[index].fulfilled = true;
                }
            };

            // update value according to type
            if (constraintJSON.name == 'character_limitation') {
                constraintJSON.valueInTopic = ""+that.currentTopic.content.length;
                checkConstraint();
            }else if (constraintJSON.name == 'img_limitation') {
                constraintJSON.valueInTopic = ""+(that.currentTopic.content.split('<img').length-1);
                checkConstraint();
            }else if (constraintJSON.name == 'max_character_limitation') {
                constraintJSON.valueInTopic = ""+that.currentTopic.content.length;
                checkConstraint();
            }

            if(that.debug){
                console.log("info TopicController: Updating constraint ");
                console.log(constraintJSON);
            }

            $http.put('/admin/constraints', constraintJSON).
                success(function (data, status, headers, config) {
                }).
                error(function (data, status, headers, config) {
                });
        });
    };

    /**
     * Updates the current topic
     *
     * @param ac    reference to the alert controller that is responsible in this view
     * @param lc    reference to the language controller that is responsible in this view
     * @param msg   the message that should be contained in the alert
     */
    this.updateStatus = function(ac, lc, msg){
        var topic = commonTaskService.createTopicObject(that.currentTopic.uID,
            that.currentTopic.name,
            that.currentTopic.group,
            that.currentTopic.createdBy,
            that.currentTopic.content,
            that.currentTopic.status,
            that.currentTopic.constraints,
            that.currentTopic.deadline);

        var constraintsAreInitialized = that.currentTopic.constraints[0] != "" || that.currentTopic.constraints != undefined;
        if(!constraintsAreInitialized){
            commonTaskService.initConstraintArray(that.currentTopic.constraints);
        }

        $http.put('/admin/topic', topic).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get updated");
            });

        // updated the constraints - maybe their status has changed -
        that.updateConstraints();

        // create a new history entry and send it
        var hObj = commonTaskService.createHistoryObject(that.currentTopic.uID,
                    that.currentTopic.content,
                    $scope.uc.email,
                    parseInt(that.topicVersion)+1+"");
        that.postHistoryObject(hObj);

        // update also the GUI
        that.historyEntries.push(hObj);
        that.topicVersion++;

        // send the fitting alert
        this.sendAlert(ac, lc, msg);

        // send a group notification
        if($scope.gc != undefined && $scope.uc.email != undefined)
            $scope.gc.createNotificationAtGroup(that.currentTopic.group, 'system_notification_groupTopicUpdated',
                [that.currentTopic.name, $scope.uc.email]);
    };

    /**
     * This function checks if the constraints are fulfilled
     * @returns {boolean}: true, if all constraint are fulfilled
     */
    this.constraintsFulfilled = function () {
        var fulfilled = true;

        that.constraintsForThisTopic.forEach(function (constraintToValidate) {
            if(constraintToValidate.fulfilled == false){
                /* check if we can drop this constraint */
                var drop = (jQuery.inArray(constraintToValidate.name, Config.constraintsThatDoesNotMatterForSaving) >= 0);
                if(!drop){
                    fulfilled = false;
                }
            }
        });

        return fulfilled;
    };

    /**
     * Updates the current topic if all constraints are fulfilled
     *
     * @param ac    reference to the alert controller that is responsible in this view
     * @param lc    reference to the language controller that is responsible in this view
     * @param msg   the message that should be contained in the alert
     */
    this.updateStatusIfAllowedByContraints = function(ac,lc,msg){
        var constraintsFulfilled = that.constraintsFulfilled();

        if(that.debug){
            console.log("info TopicController: check end result of validation: "+constraintsFulfilled);
        }

        if(constraintsFulfilled){
            that.updateStatus(ac,lc,msg)
        }else{
            this.sendAlert(ac, lc, 'notification_alert_failDueToContraints');
        }
    };

    /**
     * Translates a topic UID to the fitting name. The value can also be fetched via the cache afterwards.
     * (that.cachedTopicForUIDTranslation)
     *
     * @param uID           uID of the topic that should be translated
     * @param doSth         callback - 1. parameter => name of the group
     * @param dataBasis     list of every topic. If undefined, the function will fetch the data iself -> slower
     */
    this.nameOfTopic = function(uID, doSth, dataBasis){
        if(dataBasis == undefined){
            if(uID != that.cachedTopicForUIDTranslation) {
                /* find group and store it in cache */
                $http.get('/admin/topic').success(function(topics){
                    for (var i = 0; i < topics.length; i++) {
                        if (topics[i].uID == uID) {
                            that.cachedTopicForUIDTranslation.uID = uID;
                            that.cachedTopicForUIDTranslation.name = topics[i].name;
                        }
                    }

                    doSth(that.cachedTopicForUIDTranslation.name);
                });
            }else{
                doSth(that.cachedTopicForUIDTranslation.name);
            }
        }else{
            if(uID != that.cachedTopicForUIDTranslation) {
                for (var i = 0; i < dataBasis.length; i++) {
                    if (dataBasis[i].uID == uID) {
                        that.cachedTopicForUIDTranslation.uID = uID;
                        that.cachedTopicForUIDTranslation.name = dataBasis[i].name;
                    }
                }

                doSth(that.cachedTopicForUIDTranslation.name);
            }else{
                doSth(that.cachedTopicForUIDTranslation.name);
            }
        }
    };

    /**
     * Function tries to fetch the supervisor, who has created the group / topic
     * (! Recursive function)
     * @param createdBy the starting term
     * @param callback  first parameter contains the supervisor
     */
    this.fetchSupervisor = function(createdBy, callback){
        if(createdBy.indexOf('@') != -1 || createdBy == 'anUser' /* testing case */){
            callback(createdBy);
        }else{
            $http.get('/admin/topic/'+createdBy).success(function(topic) {
               that.fetchSupervisor(topic[0].createdBy, callback);
            });
        }
    };

    /**
     * Requests the actual topic with the given uID as JSON object
     * and stores it internally in that.currentTopic
     *
     * @param uIDOfTheTopic of the topic
     */
    this.getTopicByTopicID = function(uIDOfTheTopic){
        /* fetch data basis for post-processing */
        $http.get('/admin/topic').success(function(topics){
            that.topics = topics;

            /* fetch the concrete topic */
            $http.get('/admin/topic/'+uIDOfTheTopic).
                success(function(data) {
                    that.currentTopic = data[0];

                    that.maxcharThreshold = that.currentTopic.maxCharThreshold;

                    /* create the list of pictures of the topic */
                    that.preparePictureList();

                    /* get the links of this topic */
                    that.currentTopic.linkedTopics.forEach(function(link){
                        that.nameOfTopic(link, function(name){
                            that.linksOfThisTopic.push({
                                uID: link,
                                name: name
                            });
                        }, that.topics);
                    });

                    /* store the supervisor */
                    that.fetchSupervisor(that.currentTopic.createdBy, function(supervisor){
                        that.supervisor = supervisor;
                    });

                    /* get history entries */
                    $http.get('/admin/history/'+uIDOfTheTopic)
                        .success(function(data){
                            if(data != undefined && data.length > 0){
                                that.historyEntries = data;

                                /* extract current version number and create modification markup */
                                var max = -1;
                                for(var i=0; i < that.historyEntries.length; i++){
                                    if(Number(that.historyEntries[i].versionNumber) > max){
                                        max = that.historyEntries[i].versionNumber;
                                    }

                                    /* add diff markup */
                                    if(i >=1 ){
                                        that.historyEntries[i].diff = diffString(that.historyEntries[i-1].content,
                                            that.historyEntries[i].content)
                                    }

                                    // btw: cast the value to a number
                                    that.historyEntries[i].versionNumber = Number(that.historyEntries[i].versionNumber);
                                }
                                that.topicVersion = max;
                            }else{
                                /* no history found for topic
                                    -> this is an error
                                    -> create fallback data instead */
                                that.historyEntries.push(commonTaskService.createHistoryObject(uIDOfTheTopic));
                                that.topicVersion = 1;
                            }

                            /* now: revert order for output */
                            that.historyEntries.reverse();
                        }).error(function(data){
                            console.log("error TopicController: Cannot fetch history entries");
                        });
                }).
                error(function(data, status, headers, config) {
                    console.log("error TopicController: Topic cannot get pulled");
                });
        });
    };

    /**
     * Requests the topics with the given status as JSON object
     * and stores them internally in that.topicsByStatus
     *
     * @param statusOfTheTopic
     */
    this.getTopicsByStatus = function(statusOfTheTopic){
        $http.get('/admin/topicbystatus/'+statusOfTheTopic).
            success(function(data, status, headers, config) {
                that.topicsByStatus = data;
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topics with status "+statusOfTheTopic+" cannot get pulled");
            });
    };
    /**
     * Requests the actual sub-topic with the given uID of the parent topic as
     * JSON objects and stores them internally in that.subtopics
     *
     * @param uIDOfTheParentObject of the parent topic
     */
    this.getSubTopicByTopicID = function(uIDOfTheParentObject){
        if(that.debug)
        console.log("info TopicController: fetching subtopics for "+uIDOfTheParentObject);

        $http.get('/admin/topicbyuser/'+uIDOfTheParentObject).
            success(function(data) {
                that.subtopics = data;

                if(that.debug)
                    console.log(that.subtopics);
            }).
            error(function() {
                console.log("error TopicController: Subtopics cannot get pulled");
            });
    };

    /**
     * Fetches the constraints for this topic and stores them internally
     * in that.constraintsForThisTopic. Automatically creates missing constraints.
     *
     * @param topicID of the topic that should be searched for constraints
     */
    this.getConstraintsForThisTopic = function(topicID){
        $http.get('/admin/constraints/' + topicID).
            success(function(data) {
                that.constraintsForThisTopic = data;

                /* extract information about maximal characters */
                for(var i=0; i < that.constraintsForThisTopic.length; i++){
                    if(that.constraintsForThisTopic[i].name == 'max_character_limitation'){
                        that.maxchar = that.constraintsForThisTopic[i].value;
                    }
                }

                /* check if every constraint is existing
                * => create it, if it is missing*/
                var created = commonTaskService.createMissingConstraint($http, that.constraintsForThisTopic, topicID);
                if(created.length > 0){
                    for(var i = 0; i < created.length; i++){
                        that.constraintsForThisTopic.push(created[i]);
                    }
                }
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Constraints cannot get pulled");
            });
    };

    /**
     * Returns all topics that have been created by a specific user
     *
     * @param uID of the user that has created the topic
     */
    this.getTopicsByUserID = function(uID){
        $http.get('/admin/topicbyuser/'+uID).
            success(function(data, status, headers, config) {
                that.currentUserTopics = data;

                /* fetch all subtopics (the createdBy field contains a uID of another
                 topic)*/
                that.currentUserTopics.forEach(function(topic){
                    $http.get('/admin/topicbyuser/'+topic.uID).
                        success(function(data, status, headers, config) {
                            var newTopicArray = that.currentUserTopics.concat(data);

                            that.currentUserTopics = newTopicArray;
                        }).
                        error(function(data, status, headers, config) {
                            console.log("error TopicController: Topic cannot get pulled");
                        });
                });
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get pulled");
            });
    };

    /**
     * This function prepares the internal list of pictures for the current topic
     */
    this.preparePictureList = function(){
        var currentContent = that.currentTopic.content;
        var count = (currentContent.match(/<img/g) || []).length;

        var offset = 0;
        for (var i = 0; i < count; i++) {
            var startLink   =   currentContent.indexOf("<img", offset);
            var endLink     =   currentContent.indexOf(">", startLink) + 1;
            var url         =   currentContent.substring(startLink, endLink);

            if(that.debug)
                console.log("info TopicController: Fetching url " + url);

            that.listOfPictures.push(url);

            offset          =   startLink;
        }
    };

    /**
     * This function checks if the deadline of the current topic is reached
     *
     * @returns {boolean} true iff the current date is behind the deadline
     */
    this.deadlineReached = function(){
        var date = new Date();

        return (date > new Date(that.currentTopic.deadline));
    };

    /**
     * Returns the deadline in string representation
     *
     * @returns {String} the date of the deadline
     */
    this.getDateAsString = function(){
        var date = new Date(that.currentTopic.deadline);

        return date.toDateString();
    };

    /**
     * Updates the topic by using the alternative internal representation (Strings:
     * that.modifyTopicID, that.modifyTopicName, ...)
     */
    this.updateTopic = function(){
        var topic = {
            uID :       that.modifyTopicID,
            name :      that.modifyTopicName,
            group  :    that.modifyTopicGroup,
            createdBy:  that.modifyTopicCreatedBy,
            content:    that.modifyTopicContent,
            status:     that.modifyTopicStatus,
            constraints: that.modifyTopicConstraints
        };

        $http.put('/admin/topic', topic).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get updated");
            });
    };

    /**
     * Function deletes the history of the given topic
     *
     * @param topicID {String}: uID of the topic which history should be deleted
     */
    this.deleteHistory = function(topicID){
        $http.delete('/admin/history/'+topicID).
            success(function () {
            }).
            error(function () {
                console.log("error TopicController: History cannot get removed");
            });
    };

    /**
     * Deletes the current topic AND every attached subtopic (i.e., a topic that is
     * 'createdBy' this uID).
     *
     * Furthermore, the corresponding chat systems are removed.
     */
    this.deleteCurrentTopic = function(){
        function deletingProcedure(deleteThis) {
            $http.delete('/admin/topic/' + deleteThis).
                success(function () {
                    // remove corresponding chat system
                    commonTaskService.deleteChat($http, deleteThis);

                    // delete from frontend
                    that.currentUserTopics.forEach(function(topic, index){
                        if(topic.uID == deleteThis){
                            that.currentUserTopics.splice(index,1);
                        }
                    });

                    // clear buffer
                    that.clearBuffer();

                    // remove corresponding history
                    that.deleteHistory(deleteThis);
                }).
                error(function () {
                    console.log("error TopicController: Topic cannot get removed");
                });
        }

        /* delete the sub-topics and their chat systems */
        $http.get('/admin/topicbyuser/'+that.modifyTopicID).
            success(function (data, status, headers, config) {
                data.forEach(function(subtopic){
                    if(subtopic.uID != that.modifyTopicID)
                        deletingProcedure(subtopic.uID);
                });
            }).
            error(function (data, status, headers, config) {
                console.log("error TopicController: Sub-Topic cannot get removed");
            });

        /* delete the main topic and the main chat */
        deletingProcedure(that.modifyTopicID);
    };

    /**
     * The function fetches the footnotes for the current topic and stores them internally
     * within this.footnotes
     */
    this.getFootnotesForTopic = function(uID){
        $http.get('/admin/footnotesByTopic/'+uID).
            success(function (data, status, headers, config) {
                that.footnotes = data;
            }).
            error(function (data, status, headers, config) {
                console.log("error TopicController: Footnotes cannot get fetched");
            });
    };

    /**
     * The function sends the given footnote to the server
     *
     * @param note {JSON}: The footnote that should be send
     */
    this.storeFootnote = function(note){
        if(note == undefined){
            note = {
                uID: commonTaskService.generateUID(that.temporaryFootnote.content),
                content: that.temporaryFootnote.content,
                creator: that.temporaryFootnote.creator,
                linkedToTopic: that.temporaryFootnote.linkedToTopic
            };
        }

        $http.post('/admin/footnote', note).
            success(function () {
                // add the data to the fontend as well
                that.footnotes.push(note);

                // delete the temporary footnote
                that.temporaryFootnote = undefined;
            }).
            error(function () {
                console.log("error TopicController: Footnote cannot get posted");
            });
    };

    /**
     * This function removes a specific footnote from the frontend and the database
     *
     * @param uID {String}:     UID of the footnote that should be removed
     */
    this.deleteFootnote = function(uID){
        $http.delete('/admin/footnote/'+uID).
            success(function () {

                /* remove also from frontend and delete marker from text*/
                for(var i = 0; i < that.footnotes.length; i++){
                    if(that.footnotes[i].uID == uID){
                        /* remove from frontend */
                        that.footnotes.splice(i, 1);

                        /* remove also marker from text */
                        var replaceString = "["+i+"]";
                        that.currentTopic.content = that.currentTopic.content.replace(replaceString,"");
                    }
                }
            }).
            error(function () {
                console.log("error TopicController: Footnote cannot get removed");
            });
    };

    /**
     * This function fetches the media files (e.g., images) of the current topic
     * @param topicID
     */
    this.getMediaForTopic = function(topicID){
        $http.get('/admin/pictureForTopic/'+topicID)
            .success(function (data) {
                that.media = data;
        }).
            error(function () {
                console.log("error TopicController: Media list cannot get fetched");
            });
    };

    /**
     * This function appends a String to the content of the current topic
     *
     * @param whatToAppend      the String that should be appended
     */
    this.appendToContent = function(whatToAppend){
        that.currentTopic.content += whatToAppend;
    };

    /**
     * This function is used to push a new medium to the media list
     * @param medium
     */
    this.pushNewMedia = function(medium){
        that.media.push(medium);
    };

    /**
     * Evaluates the status of the current max character constraints. Returns a String to signalize the status.
     *
     * @param percent:  The percentage value for the yellow-green switch. By default: 80
     *
     * @returns {string}: 'green' if current content length is < 80% of the max value. 'Yellow' if current length is
     * between 80% and the max value and 'red' if current value is higher than max value.
     */
    this.evaluateMaxCharConstraint = function(percent){
        if(percent == undefined || percent < 0 || percent > 100){
            percent = 80;
        }

        if(that.currentTopic.content == undefined){
            return "no init yet";
        }

        var valueInTopic = that.currentTopic.content.length;

        if(valueInTopic > that.maxchar || that.maxchar < 0){
            return "red";
        }else if(valueInTopic >= (percent / 100) * that.maxchar){
            return "green"
        }else{
            return "yellow"
        }
    };

    /**
     * Function adds a link to another topic to the linkedTopics Array
     * @param uID       The uID of the linked topic
     */
    this.addLink = function(uID){
        /* prepare changes */
        var changes = {
          keys: ['linkedTopics'],
          linkedTopics: uID
        };

        /* save for frontend usage */
        that.nameOfTopic(uID,function(name){
            that.linksOfThisTopic.push({
                uID: uID,
                name: name
            })
        }, that.topics);

        /* do changes */
        that.updateTopicAndBypassHistory(that.currentTopic.uID, changes, true, false);
    };

    /**
     * This functions creates the google map object and centers it at the given position
     *
     * @param x     The latitude of the postion
     * @param y     The longitude of the position
     */
    this.initMap = function(x,y){
        $timeout(function(){
            if(that.map == undefined){
                //Step 1: initialize communication with the platform
                var platform = new H.service.Platform({
                    app_id: that.HEREMAPS_ID,
                    app_code: that.HEREMAPS_CODE,
                    useCIT: true
                });
                var defaultLayers = platform.createDefaultLayers();

                //Step 2: initialize a map  - not specificing a location will give a whole world view.
                that.map = new H.Map(document.getElementById('map'),
                    defaultLayers.normal.map);

                //Step 3: make the map interactive
                // MapEvents enables the event system
                // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
                var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(that.map));

                // Create the default UI components
                var ui = H.ui.UI.createDefault(that.map, defaultLayers);

                that.map.setCenter({lat:x, lng:y});
                that.map.setZoom(15);

                that.map.addObject(new H.map.Marker({lat:x, lng:y}));

                that.map.addEventListener('tap', function (evt) {
                    var coord = that.map.screenToGeo(evt.currentPointer.viewportX,
                        evt.currentPointer.viewportY);

                    /* update coordinates */
                    that.currentTopic.gps[0] = coord.lat;
                    that.currentTopic.gps[1] = coord.lng;

                    /* force update */
                    var element = angular.element($('#lat'));
                    element.scope().$apply();

                    that.map.setCenter({lat:that.currentTopic.gps[0], lng:that.currentTopic.gps[1]});
                });
            }

        }, 250);
    };

    /**
     * Sets the geoposition by the given address using the here maps geolocations service
     * @param formData
     */
    this.setGeoCodeByAddress = function(formData){
        $http.get('//geocoder.cit.api.here.com/6.2/geocode.json?searchtext='+formData+'&app_id='+
            that.HEREMAPS_ID+'&app_code='+that.HEREMAPS_CODE+'&gen=6').success(function(data){

            var coord = data.Response.View[0].Result[0].Location.DisplayPosition;

            /* update coordinates */
            that.currentTopic.gps[0] = coord.Latitude;
            that.currentTopic.gps[1] = coord.Longitude;

            /* force update */
            var element = angular.element($('#lat'));
            element.scope().$apply();

            that.map.setCenter({lat:that.currentTopic.gps[0], lng:that.currentTopic.gps[1]});

            that.map.addObject(new H.map.Marker({lat:that.currentTopic.gps[0], lng:that.currentTopic.gps[1]}))
        });
    };

    /**
     * Updates the maxcharThreshold
     */
    this.updateLightSign = function(){
        function getValueOfConstraint(name){
            for(var i = 0; i<that.constraintsForThisTopic.length; i++){
                var constraint = that.constraintsForThisTopic[i];
                if(constraint.name == name){
                    return constraint.value;
                }
            }
        };

        var min =  getValueOfConstraint('character_limitation');
        var max =  getValueOfConstraint('max_character_limitation');

        var percentage = (min/max) * 100;

        that.maxcharThreshold = percentage;
    };

    /**
     * Function removes the given link from the topic
     *
     * @param uID       uID of the link that should be removed
     */
    this.removeLink = function(uID){
        /* prepare changes */
        var changes = {
            keys: ['linkedTopics'],
            linkedTopics: uID
        };

        /* remove from frontend */
        var pos = -1;
        for(var i=0; i < that.linksOfThisTopic.length; i++){
         if(that.linksOfThisTopic[i].uID == uID){
             pos = i;
         }
        }
        that.linksOfThisTopic.splice(pos,1);

        /* do changes */
        that.updateTopicAndBypassHistory(that.currentTopic.uID, changes, true, true);
    };

    /**
     * Returns the URL for the given topic UID
     * @param uID           the used topic as uID
     * @returns {String}    the URL
     */
    this.returnLink = function(uID){
      return LinkCreator.getLinkForTopic(uID);
    };

    /* update parameter if needed */
    if($routeParams.topicID != undefined){
        that.getConstraintsForThisTopic($routeParams.topicID);
        that.getFootnotesForTopic($routeParams.topicID);
        that.getMediaForTopic($routeParams.topicID);
        that.getTopicByTopicID($routeParams.topicID);
    }

    if($routeParams.userID != undefined){
        that.getTopicsByUserID($routeParams.userID);
    }

    if($routeParams.uID != undefined){
        /* we are inside a scope of a group partial because uID is the uID of a group
        * => thus, we can use the gc here to get a topic */
        $timeout(function(){
            that.getSubTopicByTopicID($scope.gc.bufferedGroup.topic);
        }, 500);
    }
}]);