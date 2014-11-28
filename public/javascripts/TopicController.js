
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

    this.modifyTopicID = "";
    this.modifyTopicName = "";
    this.modifyTopicContent = "";
    this.modifyTopicGroup = "";

    this.doSomethingWithTopic = function(topicID, topicName, topicContent, topicGroup, topicStatus){
        that.modifyTopicID      = topicID;
        that.modifyTopicName    = topicName;
        that.modifyTopicContent = topicContent;
        that.modifyTopicGroup   = topicGroup;
        that.modifyTopicStatus  = topicStatus;
    };

    this.createTopic = function(){
        Interface.createTopic(that.currentTopic.name, that.currentTopicSubTopicsAsString, that.currentTopic.groupID,
            $scope.gc, $scope.uc.email, $http)
    }

    this.setCurrentTopicGroupID = function(grpid){
        if(that.debug){
            console.log("info TopicController: Topic will be added to group " + grpid);
        }

        that.currentTopic.groupID = grpid;
    }

    this.currentTopicGroupIdIsSet = function(){
        if(that.currentTopic.groupID != undefined && that.currentTopic.groupID != "")
            return true;
        else
            return false;
    }

    this.updateStatus = function(ac, lc){
        var topic = {
            uID : that.currentTopic.uID,
            name : that.currentTopic.name,
            group  : that.currentTopic.group,
            createdBy: that.currentTopic.createdBy,
            content: that.currentTopic.content,
            status: that.currentTopic.status
        }

        $http.put('/admin/topic', topic).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get updated");
            });

        if(ac != undefined && lc != undefined){
            ac.addAlert(lc.getTerm('notification_alert_changedStatus'),"info");
        }
    }

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
        $http.get('/admin/topicbyuser/'+uIDOfTheParentObject).
            success(function(data, status, headers, config) {
                that.subtopics = data;
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Subtopics cannot get pulled");
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
            status: that.modifyTopicStatus
        }

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
    }

    if($routeParams.userID != undefined){
        that.getTopicsByUserID($routeParams.userID);
    }
}]);