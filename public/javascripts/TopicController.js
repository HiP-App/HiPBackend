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

    this.currentTopic = {};

    this.createTopic = function(){
        var currentTopicID = Sha1.hash(that.currentTopic.name + Math.floor((Math.random() * 100000) + 1));

        var topic = {
            uID : currentTopicID,
            name : that.currentTopic.name,
            group  : that.currentTopic.groupID,
            createdBy: $scope.uc.email
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
}]);