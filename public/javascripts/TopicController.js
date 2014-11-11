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

    this.currentTopic = {};

    this.createTopic = function(){
        //FIXME: GET SHA1 up and running
        var currentTopicID = that.currentTopic.name + Math.floor((Math.random() * 1000) + 1);

        var topic = {
            id : currentTopicID,
            name : that.currentTopic.name,
            group  : that.currentTopic.groupID
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

        // adding topic to group
        // FIXME

        // adding notification
        if(that.currentTopic.groupID != "" || that.currentTopic.groupID != "undefined" ){
            if(that.debug){
                console.log("info TopicController: posting notification to grp: " + that.currentTopic.groupID);
                console.log("info TopicController: with name " + that.currentTopic.name);
            }

            $scope.gc.createNotificationAtGroup(that.currentTopic.groupID,"system_notification_groupTopicChanged",
                [that.currentTopic.name])
        }
    }
}]);