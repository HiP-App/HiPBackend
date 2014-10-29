controllersModule.controller('LangCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    this.debug = true;
    var errorString = "not fetched yet: ";

    var that = this;

    this.language = {
        init:false
    }

    this.defaultLanguage = "de";

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    /**
     * This function returns the corresponding string the in active language
     *
     * @param key
     * @returns the needed string
     */
    this.getTerm = function(key){
        var found = (that.language[key] != undefined);

        if(found)
            return that.language[key];
        else
            return errorString + key;
    }

    /**
     * This function creates a correct notification from notification data
     *
     * @param data - of the structure: [system_call, optional data like username, etc.]
     * @returns {*} - The correct notification
     */
    this.getNotification = function (data) {
        var res = data.split(",");

        var notiMessage = that.getTerm(res[0]);

        return notiMessage + " " + res[1];
    }

    /**
     * Sends a new term to the server
     */
    this.createTerm = function(){
        $http.post('/admin/languages', that.currentTerm).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });
    };

    /**
     * This function loads the complete dictionary from the server
     *
     * @param lang: the needed language, e.g., 'eng' or 'de'
     */
    this.getLanguage = function (lang){
        if(this.debug)
            console.log("info LangCtrl: Fetching language")

        $http.get('/admin/languages/'+lang).
            success(function(data, status, headers, config) {
                if(that.debug){
                    console.log("info LangCtrl: getting response data")
                }

                /* transform data into a single JSON doc */
                for(entry in data){
                    that.language[data[entry].key] = data[entry].value
                }

                // prevent init again
                that.language.init  =   true;

                if(that.debug){
                    console.log("info LangCtrl: Language is now " + lang)
                    console.log(that.language)
                }
            }).
            error(function(data, status, headers, config) {
                if(that.debug){
                    console.log("error LangCtrl: Could not fetch the data >> Server response " + status)
                }

                that.language = that.errorObject;
            });
    }

    if(this.language.init == false){
        // init language
        if(this.debug)
            console.log("info: Language gets initialised:" + this.defaultLanguage)

        this.getLanguage(this.defaultLanguage);
    }
}]);

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

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messagesJSON = [that.errorObject];
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

                // prepare the JSON formatting
                that.prepareChatMessages();
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    this.prepareChatMessages = function(){
        if( that.chat.message != undefined ){
            /* clear old array - efficient solution according to Stackoverflow.com*/
            while(that.messagesJSON.length > 0) {
                that.messagesJSON.pop();
            }

            /* set new JSON */
            var amountOfMessages = that.chat.message.length;

            var messagesTemp = that.chat.message.slice().reverse();
            var senderTemp   = that.chat.sender.slice().reverse();

            for(var i = 0; i < amountOfMessages; i++){
                that.messagesJSON.push({
                    content : messagesTemp[i],
                    sender : senderTemp[i]
                })
            }

            return that.messagesJSON;
        }else
            return [errorObject]
    };

    this.getChatByGroupUID = function(uID){
        $http.get('/admin/chat/'+uID).
            success(function(data, status, headers, config) {

                that.chat = data[0];

                if(that.chat == undefined){
                    /* create an empty chat */
                    that.postMessage("true");
                }

                // prepare the JSON formatting
                that.prepareChatMessages();

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