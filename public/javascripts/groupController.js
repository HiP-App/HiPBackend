/**
 * Created by joerg on 29.10.2014.
 */

controllersModule.controller('GroupCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    /*
     * -----------------------------
     * + CONFIGURATION VARIABLES   +
     * -----------------------------
     */
    this.debug = true;

    /*
     * -----------------------------
     * + CONTROLLER VARIABLES   +
     * -----------------------------
     */
    this.groups = ["initMe"];
    this.groupsCreatedByThisUser = [];

    this.groupsCreatedByThisUserOrUserIsMemberOfGroup = [];

    this.createdByTemp = "dummy";
    this.currentGroup = {name: this.groupName,
        member: this.groupMember,
        createdBy: that.createdByTemp,
        topic: ""
    };

    this.bufferedGroup = {uID: "toSet"};
    this.bufferedTopic = {
        name: "NaN"
    }
    /*
     * ----------------------
     * + HELPER FUNCTIONS   +
     * ----------------------
     */
    var createNotification = function(keyOfTheNotification, arrayOfValues){
        var now = new Date();

        if(keyOfTheNotification == "system_notification_groupCreated"){
            return "system_notification_groupCreated" + "," + arrayOfValues[0] + " ("+now.toLocaleString()+")"
        }

        if(keyOfTheNotification == "system_notification_groupTopicChanged"){
            return "system_notification_groupTopicChanged" + "," + arrayOfValues[0] + " ("+now.toLocaleString()+")"
        }
    }

    /*
     * --------------------------
     * + CONTROLLER FUNCTIONS   +
     * --------------------------
     */
    this.setTopicAtGroup = function(groupID,currentTopicID){
        // get group that should be changed
        $http.get('/admin/group/'+groupID).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                var changeGroup = data[0];
                changeGroup.topic = currentTopicID;

                // send data back to the server
                $http.post('/admin/modify/group', changeGroup).
                    success(function(data, status, headers, config) {
                        // this callback will be called asynchronously
                        // when the response is available
                    }).
                    error(function(data, status, headers, config) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    });
            }).
            error(function(data, status, headers, config) {
            });
    }

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
                if(that.debug){
                    console.log("info GrpCtrl: Posting completed");
                }
            }).
            error(function(data, status, headers, config) {
                if(that.debug) {
                    console.log("error GrpCtrl: Error while posting");
                }
            });
    }

    this.getGroupByUID = function(uID){
        $http.get('/admin/group/'+uID).
            success(function(data, status, headers, config) {
                that.bufferedGroup = data[0];

                // get more information about the topic
                $http.get('/admin/topic/'+that.bufferedGroup.topic).
                    success(function(data, status, headers, config) {
                        that.bufferedTopic = data[0];
                    }).
                    error(function(data, status, headers, config) {
                        console.log("error GroupController: Topic cannot get pulled");
                    });

                // revert the order of the notifications
                var revertedNotifications = that.bufferedGroup.notifications.slice().reverse();
                that.bufferedGroup.revertedNotifications = revertedNotifications;
            }).
            error(function(data, status, headers, config) {
                that.bufferedGroup.name = "Error: Connection error";
            });
    };

    this.getGroups = function(userid){
        $http.get('/admin/groups').
            success(function(data, status, headers, config) {
                that.groups = data;

                // Separate groups that have been created by this user
                if(userid != undefined){
                    // clear array
                    that.groupsCreatedByThisUser = [];

                    // fill array
                    data.forEach(function(group){
                        if(group.createdBy == userid){
                            that.groupsCreatedByThisUser.push(group);
                            that.groupsCreatedByThisUserOrUserIsMemberOfGroup.push(group);
                        }else if(group.member.indexOf($scope.uc.email) > -1){
                            that.groupsCreatedByThisUserOrUserIsMemberOfGroup.push(group);
                        }
                    });
                }
            }).
            error(function(data, status, headers, config) {
                that.groups = "Error: Connection error";
            });
    };

    this.createGroup = function(creator, firstname){
        console.log("creating group");

        that.currentGroup.uID = Sha1.hash(this.currentGroup.name + Math.floor((Math.random() * 100000) + 1));
        that.groups.push(this.currentGroup);
        that.groupsCreatedByThisUser.push(this.currentGroup);
        that.groupsCreatedByThisUserOrUserIsMemberOfGroup.push(this.currentGroup);

        // set creator id of this group
        that.currentGroup.createdBy = creator;

        // create current notification
        that.currentGroup.notifications = [];
        that.currentGroup.notifications.push(createNotification("system_notification_groupCreated",[firstname]));

        $http.post('/admin/group', this.currentGroup).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });

        /* FIXME create corresponding chat system */
    };

    this.deleteGroup = function(id){
        $http.delete('/admin/group/'+id, this.currentGroup).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });

        that.getGroups();

        // remove corresponding chat system
        $http.delete('/admin/chat/'+id).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });
    };

    /* update parameter if needed */
    if($routeParams.uID != undefined){
        that.getGroupByUID($routeParams.uID);
    }

    if(that.groups[0] = "initMe"){
        //FIXME don't use the scope
        that.getGroups($scope.uc.email);
    }
}]);