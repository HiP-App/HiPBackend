/**
 * Created by jorgamelunxen on 28.11.14.
 */
    //FIXME put this into services
var DEBUG = true;

var Interface = {};

Interface.createTopic = function (topicname, subTopicsAsString, groupID, refToGrpController, mainTopicCreatedBy, $http) {
    var currentTopicID = Sha1.hash(topicname + Math.floor((Math.random() * 100000) + 1));

    /* create all sub-topics */
    var subtopics = subTopicsAsString.split(',');
    subtopics.forEach(function (subTopic) {
        var currentSubTopicID = Sha1.hash(subTopic + Math.floor((Math.random() * 100000) + 1));

        var subTopicJSON = {
            uID: currentSubTopicID,
            name: subTopic,
            group: groupID,
            createdBy: currentTopicID,
            content: "",
            status: "wip"
        }

        $http.post('/admin/topic', subTopicJSON).
            success(function (data, status, headers, config) {
            }).
            error(function (data, status, headers, config) {
            });
    });

    /* create actual main topic */
    var topic = {
        uID: currentTopicID,
        name: topicname,
        group: groupID,
        createdBy: mainTopicCreatedBy,
        content: "",
        status: "wip",
        constraints: ['character_validation#0']
    }

    if (DEBUG)
        console.log("info TopicController: posting topic with name: " + topic.name)

    // post
    $http.post('/admin/topic', topic).
        success(function (data, status, headers, config) {
            // this callback will be called asynchronously
            // when the response is available
        }).
        error(function (data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });

    if (groupID != "" || groupID != "undefined") {
        // adding topic to group
        refToGrpController.setTopicAtGroup(groupID, currentTopicID);

        // adding notification
        if (DEBUG) {
            console.log("info TopicController: posting notification to group with ID " + groupID);
        }

        refToGrpController.createNotificationAtGroup(groupID, "system_notification_groupTopicChanged",[topicname])
    }
}

Tooling = {};

