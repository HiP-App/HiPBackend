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
    this.groupsThatGrantedReadAccessForThisUser = [];

    this.userInGroupArray = [];

    this.createdByTemp = "dummy";
    this.currentGroup = {name: "",
        member: "",
        createdBy: that.createdByTemp,
        topic: "",
        readableBy: []
    };

    this.aggregatedNotifications = []; // contains the aggregated notifications of a couple of specified groups

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

        if(keyOfTheNotification == "system_notification_groupTopicUpdated"){
            return "system_notification_groupTopicUpdated1" + "," + arrayOfValues[0] + "," +
                "system_notification_groupTopicUpdated2" + "," + arrayOfValues[1]  + " ("+now.toLocaleString()+")"
        }
    };

    /*
     * --------------------------
     * + CONTROLLER FUNCTIONS   +
     * --------------------------
     */

    /**
     * This function creates an internal representation of the aggregated notifications that
     * are included within the groups that are specified with the parameter
     *
     * @param checkGroupsWithIDs the groups that should be used to aggregate the notifications
     */
    this.createAggregatedNotificationList = function(checkGroupsWithIDs){
        /* get all notifications */
        checkGroupsWithIDs.forEach(function(grp){

            for(var i = 0; i < that.groups.length; i++){
                if(that.groups[i].uID == grp){
                    // found the correct group
                    that.groups[i].notifications.forEach(function(message){

                        var notification = {
                            groupID:        that.groups[i].uID,
                            group:          that.groups[i].name,
                            notification:   message,
                            date:           Math.floor(new Date(
                                        message.substring(message.indexOf('(')+1, message.length - 1)).getTime() / 1000)
                        };

                        that.aggregatedNotifications.push(notification);
                    });
                }
            }
        });

        /* sort them */
        var tempArray = [];
        var minimumPosition = 0;
        var minimumLocalTime = Number.MAX_VALUE;

        for(var i = 0; i < that.aggregatedNotifications.length; i++){
            if(that.aggregatedNotifications[i] != undefined){
                if(that.aggregatedNotifications[i].date < minimumLocalTime){
                    minimumPosition = i;
                    minimumLocalTime = that.aggregatedNotifications[i].date;
                }

                tempArray.push(
                {
                    groupID:        that.aggregatedNotifications[i].groupID,
                    group:          that.aggregatedNotifications[i].group,
                    notification:   that.aggregatedNotifications[i].notification,
                    date:           minimumLocalTime
                });
            }

            // delete
            that.aggregatedNotifications[i] = undefined;

            // reset
            minimumPosition = 0;
            minimumLocalTime = Number.MAX_VALUE;
        }

        /* restore */
        that.aggregatedNotifications = tempArray.reverse();
    };

    /**
     * Returns true, iff the user is a member of the given grp
     * @param userID    of the user that should be checked
     * @param groupID   of the group that should be used for checking the member
     */
    this.userIDIsMemberOfGrp = function(userID,groupID){
        var result = false;

        // get positionOfGroup
        this.groups.forEach(function(grp) {
            if (grp.uID == groupID) {
                /* is the user a member of this grp? */
                if(grp.member != undefined)
                    result = (grp.member.indexOf(userID) != -1);
            }
        });

        return result;
    };

    /**
     * Returns true, iff the user has read rights of the given group
     *
     * @param userID    of the user that should be checked
     * @param groupID   of the group that should be used for checking the member
     */
    this.userIDIsReaderOfGrp = function(userID,groupID){
        var result = false;

        this.groups.forEach(function(grp){
            if(grp.uID == groupID){
                /* check is userID is contained in the list of given rights */
                var userInReadableList = (jQuery.inArray( userID, grp.readableBy ) != -1);
                if(userInReadableList){
                    result = true;
                }else{
                    /* cancel if not fully loaded */
                    if(grp.readableBy == undefined)
                        return;
                    
                    /* now check again, assuming that the array of given read rights contains not a userID but a groupID */
                    grp.readableBy.forEach(function(assumedGroup){
                        /* get position of grp in cache */
                        var pos = "-1";

                        for(var i=0; i < that.groups.length; i++){
                            if(that.groups[i].uID == assumedGroup){
                                pos = i;
                            }
                        }

                        var assumedGroupIsContainedInGroupCache = (pos != -1);
                        if(assumedGroupIsContainedInGroupCache){
                            /* is the checked user member of that group? */
                            var checkedUserIsMemberOfThatGroup = ( that.groups[pos].member.indexOf(userID) != -1 );

                            if(checkedUserIsMemberOfThatGroup){
                                result = true;
                            }
                        }
                    });
                }
            }

            /* stop looking, if result is found */
            if(result){
                return true;
            }
        });

        return result;
    };

    /**
     * This function requests the read right from another group
     *
     * @param uID               uID of the group that should be asked for rights
     * @param emailOfTheSender  email of the sender
     * @param messagetitle      the title of the message - needs to be injected because this is language specific -
     * @param messageContent    the content of the message - needs to be injected because this is language specific -
     * @param buttonContent    the label of the button - needs to be injected because this is language specific -
     */
    this.requestReadRightsFromGroup = function(uID, emailOfTheSender, messagetitle, messageContent, buttonContent){
        var currentGroupUID = that.bufferedGroup.uID;
        var receiverGrpUID = uID;

        var buttonHTML = '<br><a href="/#/group/rights/' + currentGroupUID + '" id="btn_send_request" ' +
            'class="btn btn-info">' + buttonContent + '</a>';

        this.groups.forEach(function(grp) {
            if (grp.uID == receiverGrpUID) {
                /* found the correct group in groups cache */
                var member = grp.member.split(',');
                member.forEach(function(aMember){
                    /* send every member a message */
                    var messageData = {
                        title:      messagetitle + ":" + that.bufferedGroup.name,
                        receiver:   aMember,
                        content:    messageContent + buttonHTML
                    };

                    var uID = Tooling.generateUID(messageData.title + messageData.receiver + messageData.content);

                    var tempMessage = Tooling.createMessageObject(uID, messageData.receiver, emailOfTheSender,
                        messageData.title, messageData.content);

                    Interface.sendPrivateMessage($http, tempMessage, that.debug);
                });
            }
        });
    };

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
                        }else if(that.userIDIsReaderOfGrp($scope.uc.email, group.uID)){
                            that.groupsThatGrantedReadAccessForThisUser.push(group);
                        }
                    });
                }

                if(that.debug){
                    console.log("info GrpCtrl: building aggregated notifications ");
                }

                /* build aggregated notifications */
                var requestNotifications = [];
                that.groupsCreatedByThisUserOrUserIsMemberOfGroup.forEach(function(grp){
                    requestNotifications.push(grp.uID);

                    if(that.debug){
                        console.log("info GrpCtrl: including  " + grp.name + " in notifications");
                    }
                });
                that.createAggregatedNotificationList(requestNotifications);
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
        Interface.createTopicObject(that.currentGroupTopic.topic, that.currentGroupTopic.subtopics, that.currentGroup.uID,
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

    if(that.groups[0] == "initMe"){
        //FIXME don't use the scope
        that.getGroups($scope.uc.email);
    }
}]);