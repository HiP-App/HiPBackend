/**
 * Created by joerg on 29.10.2014.
 */

controllersModule.controller('GroupCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = true;

    this.groups = ["initMe"];

    this.createdByTemp = "dummy";
    this.currentGroup = {name: this.groupName,
        member: this.groupMember,
        createdBy: that.createdByTemp,
        topic: ""
    };

    this.bufferedGroup = {uID: "toSet"};

    /* functions */

    /*
     * ----------------------
     * + HELPER FUNCTIONS   +
     * ----------------------
     */
    var createNotification = function(keyOfTheNotification, arrayOfValues){
        if(keyOfTheNotification == "system_notification_groupCreated"){
            return "system_notification_groupCreated" + "," + arrayOfValues[0]
        }

        if(keyOfTheNotification == "system_notification_groupTopicChanged"){
            return "system_notification_groupTopicChanged" + "," + arrayOfValues[0]
        }
    }

    /*
     * ----------------------
     * + CONTROLLER FUNCTIONS   +
     * ----------------------
     */

    this.createNotificationAtGroup = function(groupid, keyOfTheNotification, arrayOfValues){
        var notification = createNotification(keyOfTheNotification, arrayOfValues);

        var grpNotification = {
            groupID : groupid,
            notification : notification
        }

        if(that.debug){
            console.log("info GrpCtrl: Posting notification with groupID " + grpNotification.groupID + " and notification " +
                grpNotification.notification);

            console.log(grpNotification);
        }

        $http.post('/admin/notification', grpNotification).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    }

    this.getGroupByUID = function(uID){
        $http.get('/admin/group/'+uID).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                that.bufferedGroup = data[0];
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                that.bufferedGroup.name = "Error: Connection error";
            });
    };

    this.getGroups = function(){
        $http.get('/admin/groups').
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                that.groups = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                that.groups = "Error: Connection error";
            });
    };

    this.createGroup = function(creator, firstname){
        //FIXME: GET SHA1 up and running
        //var hash = SHA1.hash(currentGroup.name + Math.floor((Math.random() * 100) + 1));
        //console.log("hash: " + hash);

        this.currentGroup.uID = this.currentGroup.name + Math.floor((Math.random() * 1000) + 1);
        this.groups.push(this.currentGroup);

        // set creator id of this group
        this.currentGroup.createdBy = creator;

        // create current notification
        this.currentGroup.notifications = [];
        this.currentGroup.notifications.push(createNotification("system_notification_groupCreated",[firstname]));

        $http.post('/admin/group', this.currentGroup).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        /* create corresponding chat system */
        // FIXME
    };

    this.deleteGroup = function(id){
        $http.delete('/admin/group/'+id, this.currentGroup).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        that.getGroups();

        // FIXME: remove corresponding chat system
    };

    /* update parameter if needed */
    if($routeParams.uID != undefined){
        that.getGroupByUID($routeParams.uID);
    }

    if(that.groups[0] = "initMe"){
        that.getGroups();
    }
}]);