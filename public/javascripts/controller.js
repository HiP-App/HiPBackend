controllersModule.controller('GroupCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.groups = ["initMe"];

    this.currentGroup = {name: this.groupName,
        member: this.groupMember,
        createdBy: "dummy",
        notifications: ["the group has been created by dummy"]};

    this.bufferedGroup = {uID: "toSet"};

    /* functions */
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

    this.createGroup = function(){
        //FIXME: GET SHA1 up and running
        //var hash = SHA1.hash(currentGroup.name + Math.floor((Math.random() * 100) + 1));
        //console.log("hash: " + hash);

        this.currentGroup.uID = this.currentGroup.name + Math.floor((Math.random() * 1000) + 1);
        this.groups.push(this.currentGroup);

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

controllersModule.controller('ChatCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.chat = { };

    /* functions */
    this.postMessage = function(newChat){
        if(that.chat == undefined){
            that.chat = {};
            that.chat.uID = $routeParams.uID;
            that.chat.name = $routeParams.uID;
        }

        var toSend = {"uID" : that.chat.uID,
                        "name" : that.chat.name,
                        "sender" : [""],
                        "message" : [""]
        }

        // FIXME: DONT SEND THE WHOLE ARRAY EVERYTIME
        if(newChat == false){
            var i=0;
            for(i = 0; i < that.chat.message.length; i++){
                if(that.chat.message[i] != "")
                    toSend.message.push( that.chat.message[i] );
            }

            for(i = 0; i < that.chat.sender.length; i++){
                if(that.chat.sender[i] != "")
                    toSend.sender.push( that.chat.sender[i] );
            }

            toSend.message.push(this.currentMessage);
            toSend.sender.push("unknown");
        }

        $http.post('/admin/chat/'+newChat, toSend).
            success(function(data, status, headers, config) {
                that.chat.message.push(that.currentMessage);
                that.chat.sender.push("unknown");
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    this.getChatByGroupUID = function(uID){
        $http.get('/admin/chat/'+uID).
            success(function(data, status, headers, config) {

                that.chat = data[0];

                if(that.chat == undefined){
                    /* create an empty chat */
                    that.postMessage("true");
                }

            }).
            error(function(data, status, headers, config) {

                that.chat.sender[0]     = "System";
                that.chat.message[0]    = "Error: Connection error";
            });
    };

    /* update parameter if needed */
    if($routeParams.uID != undefined){
        that.getChatByGroupUID($routeParams.uID);
    }

}]);