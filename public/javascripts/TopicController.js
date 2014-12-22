/**
 * Created by Jörg Amelunxen on 11.11.14.
 */

controllersModule.controller('TopicCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.currentTopicSubTopicsAsString = "";    // contains the list of the subtopics as it is written in the view

    this.subtopics = [];

    this.currentTopic = {};

    this.currentUserTopics = [];

    this.constraintsForThisTopic = [];

    this.modifyTopicID      = "";
    this.modifyTopicName    = "";
    this.modifyTopicContent = "";
    this.modifyTopicGroup   = "";
    this.modifyTopicCreatedBy   = "";
    this.modifyTopicContraints  = [];

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
        topicCreatedBy){
        that.modifyTopicID      = topicID;
        that.modifyTopicName    = topicName;
        that.modifyTopicContent = topicContent;
        that.modifyTopicGroup   = topicGroup;
        that.modifyTopicStatus  = topicStatus;
        that.modifyTopicCreatedBy = topicCreatedBy;

        var constraintsAreInitialized = topicConstraints[0] != "" || topicConstraints != undefined;
        if(constraintsAreInitialized){
            that.modifyTopicConstraints = topicConstraints;
        }
        else{
            Interface.initConstraintArray(that.modifyTopicConstraints);
        }
    };

    /**
     * Creates a new topic with the internally stored information
     */
    this.createTopic = function(){
        Interface.createTopicObject(that.currentTopic.name, that.currentTopicSubTopicsAsString, that.currentTopic.groupID,
            $scope.gc, $scope.uc.email, $http);

        /* create corresponding chat system */
        Interface.createChat($http, that.currentTopic.uID, that.currentTopic.name + " Chat");
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
     * Updates the constraints of the current topic
     */
    this.updateConstraints = function(){
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
                if (parseInt(constraintJSON.valueInTopic) < parseInt(constraintJSON.value)) {
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
        var topic = Tooling.createTopicObject(that.currentTopic.uID,
            that.currentTopic.name,
            that.currentTopic.group,
            that.currentTopic.createdBy,
            that.currentTopic.content,
            that.currentTopic.status,
            that.currentTopic.constraints);

        var constraintsAreInitialized = that.currentTopic.constraints[0] != "" || that.currentTopic.constraints != undefined;
        if(!constraintsAreInitialized){
            Interface.initConstraintArray(that.currentTopic.constraints);
        }

        $http.put('/admin/topic', topic).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get updated");
            });

        // updated the constraints - maybe their status has changed -
        that.updateConstraints();

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
            if(constraintToValidate.fulfilled == false)
            fulfilled = false;
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
     * Requests the actual topic with the given uID as JSON object
     * and stores it internally in that.currentTopic
     *
     * @param uIDOfTheTopic of the topic
     */
    this.getTopicByTopicID = function(uIDOfTheTopic){
        $http.get('/admin/topic/'+uIDOfTheTopic).
            success(function(data, status, headers, config) {
                that.currentTopic = data[0];
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get pulled");
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
            success(function(data, status, headers, config) {
                that.subtopics = data;

                if(that.debug)
                    console.log( that.subtopics);
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Subtopics cannot get pulled");
            });
    };

    /**
     * Fetches the constraints for this topic and stores them internally
     * in that.constraintsForThisTopic
     *
     * @param topicID of the topic that should be searched for constraints
     */
    this.getConstraintsForThisTopic = function(topicID){
        $http.get('/admin/constraints/' + topicID).
            success(function(data, status, headers, config) {
                that.constraintsForThisTopic = data;
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
     * Deletes the current topic AND every attached subtopic (i.e., a topic that is
     * 'createdBy' this uID).
     *
     * Furthermore, the corresponding chat systems are removed.
     */
    this.deleteCurrentTopic = function(){
        function deletingProcedure(deleteThis) {
            $http.delete('/admin/topic/' + deleteThis).
                success(function (data, status, headers, config) {
                }).
                error(function (data, status, headers, config) {
                    console.log("error TopicController: Topic cannot get removed");
                });
            // remove corresponding chat system
            Interface.deleteChat($http, deleteThis);
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

    /* update parameter if needed */
    if($routeParams.topicID != undefined){
        that.getTopicByTopicID($routeParams.topicID);
        that.getConstraintsForThisTopic($routeParams.topicID);
    }

    if($routeParams.userID != undefined){
        that.getTopicsByUserID($routeParams.userID);
    }
}]);