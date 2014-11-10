/**
 * Created by joerg on 29.10.2014.
 */

controllersModule.controller('ChatCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messagesJSON = [that.errorObject];
    this.chat = { };

    /* functions */
    this.postMessage = function(newChat, user){
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
            toSend.sender.push(user);
        }

        $http.post('/admin/chat/'+newChat, toSend).
            success(function(data, status, headers, config) {
                that.chat.message.push(that.currentMessage);
                that.chat.sender.push(user);

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