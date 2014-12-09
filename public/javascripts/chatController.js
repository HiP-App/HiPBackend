/**
 * Created by Jörg Amelunxen on 29.10.2014.
 */
chatModule.controller('ChatCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messagesJSON = [that.errorObject];
    this.chat = { };

    /**
     * Posts a new message to the chat system
     *
     * @param newChat   true, if a new chat should be created
     * @param user      name of the user that sends the message
     */
    this.postMessage = function(newChat, user){
        if(that.chat == undefined){
            that.chat = {};
            that.chat.uID = $routeParams.uID;
            that.chat.name = $scope.gc.bufferedGroup.name;
        }

        var toSend = {"uID" : that.chat.uID,
            "name" : that.chat.name,
            "sender" : [""],
            "message" : [""]
        }

        // FIXME: DONT SEND THE WHOLE ARRAY EVERYTIME
        if(newChat == false){
            var i=0;
            if(that.chat.message != undefined){
                for(i = 0; i < that.chat.message.length; i++){
                    if(that.chat.message[i] != "")
                        toSend.message.push( that.chat.message[i] );
                }

                for(i = 0; i < that.chat.sender.length; i++){
                    if(that.chat.sender[i] != "")
                        toSend.sender.push( that.chat.sender[i] );
                }

                toSend.message.push(this.currentMessage);
                toSend.sender.push(user);
            }
        }

        $http.post('/admin/chat/'+newChat, toSend).
            success(function(data, status, headers, config) {
                if(that.chat.message != undefined){
                    that.chat.message.push(that.currentMessage);
                    that.chat.sender.push(user);

                    // prepare the JSON formatting
                    that.prepareChatMessages();
                }
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    /**
     * Creates a new message array (that.messagesJSON) that contains the chat messages
     * in reverse order
     * @returns {*}     the chat messages
     */
    this.prepareChatMessages = function(){
        if( that.chat.message != undefined ){
            /* clear old array - most efficient solution according to Stackoverflow.com*/
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
            return [that.errorObject]
    };

    /**
     * Fetches the chat given by its uID. The chat is internally stored in that.chat
     *
     * @param uID   of the requested chat
     */
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