/**
 * Created by jorgamelunxen on 11.11.14.
 */

controllersModule.controller('TopicCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = true;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.currentTopicSubTopicsAsString = "";    // contains the list of the subtopics as it is written in the view

    this.currentTopic = {};

    this.currentUserTopics = [];

    this.modifyTopicID = "";
    this.modifyTopicName = "";

    this.doSomethingWithTopic = function(topicID, topicName){
         that.modifyTopicID = topicID;
         that.modifyTopicName = topicName;
    };

    this.createTopic = function(){
        var currentTopicID = Sha1.hash(that.currentTopic.name + Math.floor((Math.random() * 100000) + 1));

        /* create all sub-topics */
        var subtopics = that.currentTopicSubTopicsAsString.split(',');
        subtopics.forEach(function(subTopic){
            var currentSubTopicID = Sha1.hash(subTopic + Math.floor((Math.random() * 100000) + 1));

            var subTopicJSON = {
                uID : currentSubTopicID,
                name : subTopic,
                group  : that.currentTopic.groupID,
                createdBy: currentTopicID,
                content: ""
            }

            $http.post('/admin/topic', subTopicJSON).
                success(function(data, status, headers, config) {
                }).
                error(function(data, status, headers, config) {
                });
        });

        /* create actual main topic */
        var topic = {
            uID : currentTopicID,
            name : that.currentTopic.name,
            group  : that.currentTopic.groupID,
            createdBy: $scope.uc.email,
            content: ""
        }

        if(that.debug)
            console.log("info TopicController: posting topic with name: " + topic.name)

        // post
        $http.post('/admin/topic', topic).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        if(that.currentTopic.groupID != "" || that.currentTopic.groupID != "undefined" ){
            // adding topic to group
            $scope.gc.setTopicAtGroup(that.currentTopic.groupID,currentTopicID);

            // adding notification
            if(that.debug){
                console.log("info TopicController: posting notification to group with ID " + that.currentTopic.groupID);
            }

            $scope.gc.createNotificationAtGroup(that.currentTopic.groupID,"system_notification_groupTopicChanged",
                [that.currentTopic.name])
        }
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

    this.getTopicByTopicID = function(uID){
        $http.get('/admin/topic/'+uID).
            success(function(data, status, headers, config) {
                that.currentTopic = data[0];
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get pulled");
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

    this.deleteCurrentTopic = function(){
        $http.delete('/admin/topic/'+that.modifyTopicID).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
                console.log("error TopicController: Topic cannot get removed");
            });
    }

    /* update parameter if needed */
    if($routeParams.topicID != undefined){
        that.getTopicByTopicID($routeParams.topicID);
    }

    if($routeParams.userID != undefined){
        that.getTopicsByUserID($routeParams.userID);
    }
}]);