
/**
 * Created by jorgamelunxen on 11.11.14.
 */

controllersModule.controller('TopicCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.currentTopicSubTopicsAsString = "";    // contains the list of the subtopics as it is written in the view

    that.subtopics = [];

    this.currentTopic = {};

    this.currentUserTopics = [];

    this.constraintsForThisTopic = [];

    this.modifyTopicID = "";
    this.modifyTopicName = "";
    this.modifyTopicContent = "";
    this.modifyTopicGroup = "";
    this.modifyTopicContraints = [];

    this.doSomethingWithTopic = function(topicID, topicName, topicContent, topicGroup, topicStatus, topicConstraints){
        that.modifyTopicID      = topicID;
        that.modifyTopicName    = topicName;
        that.modifyTopicContent = topicContent;
        that.modifyTopicGroup   = topicGroup;
        that.modifyTopicStatus  = topicStatus;

        var constraintsAreInitialized = topicConstraints[0] != "" || topicConstraints != undefined;
        if(constraintsAreInitialized){
            that.modifyTopicConstraints = topicConstraints;
        }
        else{
            Interface.initConstraintArray(that.modifyTopicConstraints);
        }
    };

    this.createTopic = function(){
        Interface.createTopic(that.currentTopic.name, that.currentTopicSubTopicsAsString, that.currentTopic.groupID,
            $scope.gc, $scope.uc.email, $http)
    };

    this.setCurrentTopicGroupID = function(grpid){
        if(that.debug){
            console.log("info TopicController: Topic will be added to group " + grpid);
        }

        that.currentTopic.groupID = grpid;
    };

    this.currentTopicGroupIdIsSet = function(){
        if(that.currentTopic.groupID != undefined && that.currentTopic.groupID != "")
            return true;
        else
            return false;
    };

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

    this.updateStatus = function(ac, lc, msg){
        var topic = {
            uID : that.currentTopic.uID,
            name : that.currentTopic.name,
            group  : that.currentTopic.group,
            createdBy: that.currentTopic.createdBy,
            content: that.currentTopic.content,
            status: that.currentTopic.status,
            constraints: that.currentTopic.constraints
        };

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
    };

    /**
     * This function checks if the constaints are fulfilled
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

    this.updateStatusIfAllowedByContraints = function(ac,lc,msg){
        var constraintsfulfilled = that.constraintsFulfilled();

        if(that.debug){
            console.log("info TopicController: check end result of validation: "+constraintsfulfilled);
        }

        if(constraintsfulfilled){
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

    this.getConstraintsForThisTopic = function(topicID){
        $http.get('/admin/constraints/' + topicID).
            success(function(data, status, headers, config) {
                that.constraintsForThisTopic = data;
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Constraints cannot get pulled");
            });
    };


    this.getTopicsByUserID = function(uID){
        $http.get('/admin/topicbyuser/'+uID).
            success(function(data, status, headers, config) {
                that.currentUserTopics = data;
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get pulled");
            });
    };

    this.updateTopic = function(){
        var topic = {
            uID : that.modifyTopicID,
            name : that.modifyTopicName,
            group  : that.modifyTopicGroup,
            createdBy: $scope.uc.email,
            content: that.modifyTopicContent,
            status: that.modifyTopicStatus,
            constraints: that.modifyTopicConstraints
        };

        $http.put('/admin/topic', topic).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get updated");
            });
    };

    this.deleteCurrentTopic = function(){
        $http.delete('/admin/topic/'+that.modifyTopicID).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get removed");
            });
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