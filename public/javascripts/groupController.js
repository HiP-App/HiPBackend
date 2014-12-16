/**
 * Created by Jörg Amelunxen on 29.10.2014.
 */
groupModule.controller('GroupCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    /*
     * -----------------------------
     * + CONFIGURATION VARIABLES   +
     * -----------------------------
     */
    this.debug = false;

    /*
     * -----------------------------
     * + CONTROLLER VARIABLES   +
     * -----------------------------
     */
    this.groups = ["initMe"];
    this.groupsCreatedByThisUser = [];

    this.groupsCreatedByThisUserOrUserIsMemberOfGroup = [];

    this.userInGroupArray = [];

    this.createdByTemp = "dummy";
    this.currentGroup = {name: "",
        member: "",
        createdBy: that.createdByTemp,
        topic: "",
        readableBy: []
    };

    this.currentGroupTopic = {};

    this.bufferedGroup = {uID: "toSet"};
    this.bufferedTopic = {
        name: "NaN"
    };

    /*
     * ----------------------
     * + HELPER FUNCTIONS   +
     * ----------------------
     */

    /**
     * The function creates the notifications given by their key and optional values
     *
     * @param keyOfTheNotification  e.g., 'system_notification_groupCreated'
     * @param arrayOfValues         e.g., a username
     * @returns {string}            the complete notification
     */
    var createNotification = function(keyOfTheNotification, arrayOfValues){
        var now = new Date();

        if(keyOfTheNotification == "system_notification_groupCreated"){
            return "system_notification_groupCreated" + "," + arrayOfValues[0] + " ("+now.toLocaleString()+")"
        }

        if(keyOfTheNotification == "system_notification_groupTopicChanged"){
            return "system_notification_groupTopicChanged" + "," + arrayOfValues[0] + " ("+now.toLocaleString()+")"
        }
    };

    /*
     * --------------------------
     * + CONTROLLER FUNCTIONS   +
     * --------------------------
     */

    /**
     * The function adds the given group to the list of groups that has read rights for the
     * current group
     *
     * @param uIDOfTheGroupThatShouldGetTheReadRight
     */
    this.setReadRightWithinCurrentGroupForAnotherGroup = function(uIDOfTheGroupThatShouldGetTheReadRight){
        var currentGroupUID = that.bufferedGroup.uID;

        $http.post('/admin/readRight/'+currentGroupUID+"/"+uIDOfTheGroupThatShouldGetTheReadRight).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    /**
     * This function sets a new topic at a given group
     *
     * @param groupID           the GroupID of the group that should get a new topic
     * @param currentTopicID    the topicID of the new topic
     */
    this.setTopicAtGroup = function(groupID,currentTopicID){
        // get group that should be changed
        $http.get('/admin/group/'+groupID).
            success(function(data, status, headers, config) {
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
    };

    /**
     * Sets a new notification a the given group
     *
     * @param groupid               The GroupID of the group that should get a new topic
     * @param keyOfTheNotification  The key of the notification. E.g., 'system_notification_groupCreated'
     * @param arrayOfValues         E.g., a username
     */
    this.createNotificationAtGroup = function(groupid, keyOfTheNotification, arrayOfValues){
        var notification = createNotification(keyOfTheNotification, arrayOfValues);

        var grpNotification = {
            groupID : groupid,
            notification : notification
        };

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
    };

    /**
     * Function sets the new topic and creates a corresponding notification
     *
     * @param groupID
     * @param currentTopicID
     * @param notimsg
     * @param topicname
     */
    this.createNotificationAtGroupAndSetTopic = function(groupID, currentTopicID, notimsg, topicname){
        var notification = createNotification(notimsg, topicname);

        // get group that should be changed
        $http.get('/admin/group/'+groupID).
            success(function(data, status, headers, config) {
                var changeGroup = data[0];
                changeGroup.topic = currentTopicID;
                changeGroup.notifications.push(notification);

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
    };

    /**
     * Requests the group given by its uID and stores it in that.bufferedTopic as soon as
     * it is possible.
     *
     * @param uID       The uID of the group
     */
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

                // get the users of the group
                var userIDsOfTheGroup = that.bufferedGroup.member.split(',');

                userIDsOfTheGroup.forEach(function(userid){
                    $http.get('/admin/users/'+userid).
                        success(function(data, status, headers, config) {
                            that.userInGroupArray.push(data[0]);
                        }).
                        error(function(data, status, headers, config) {
                            console.log("error GroupController: User "+ userid +" cannot get pulled");
                        });
                });

                // revert the order of the notifications
                that.bufferedGroup.revertedNotifications = that.bufferedGroup.notifications.slice().reverse();
            }).
            error(function(data, status, headers, config) {
                that.bufferedGroup.name = "Error: Connection error";
            });
    };

    /**
     * Requests the group given by its creator's uID and stores it in that.groupsCreatedByThisUser as soon as
     * it is possible.
     *
     * @param userid        UserID of the creator.
     */
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

    /**
     * Creates a new group given its creator's userID and the firstname of the creator
     *
     * @param creator       the uID of the creator
     * @param firstname     the firstname of the creator
     */
    this.createGroup = function(creator, firstname){
        /* add user array to grp */
        if(that.userInGroupArray[0] != undefined){
            that.userInGroupArray.forEach(function(usr){
               that.currentGroup.member +=  usr.email+",";
            });

            /* cutoff last ',' */
            that.currentGroup.member = that.currentGroup.member.substr(0,that.currentGroup.member.length-1);
        }

        /* generate uID and other communication stuff */
        that.currentGroup.uID = Tooling.generateUID(that.currentGroup.name);
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

        /* create corresponding chat system */
        Interface.createChat($http, that.currentGroup.uID, that.currentGroup.name + " Chat");

        /* create the fitting topics */
        Interface.createTopic(that.currentGroupTopic.topic, that.currentGroupTopic.subtopics, that.currentGroup.uID,
            $scope.gc, $scope.uc.email, $http)
    };

    /**
     * Deletes the group with the given uID
     *
     * @param uID   of the group that should be deleted
     */
    this.deleteGroup = function(uID){
        $http.delete('/admin/group/'+uID, this.currentGroup).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });

        that.getGroups();

        // remove corresponding chat system
        Interface.deleteChat($http, uID);
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