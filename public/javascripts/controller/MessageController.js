/**
 * Created by Jörg Amelunxen on 05.11.2014.
 *
 * @class angular_module.controllersModule.MessageCtrl
 *
 * This controller implements the functions for receiving and sending private messages
 */
controllersModule.controller('MessageCtrl', ['$scope','$http', '$routeParams','commonTaskService', function($scope,$http,$routeParams,commonTaskService) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messageThatGetsCurrentlyCreated = {};

    this.messages = [{ }];
    this.outMessages = [{ }];

    this.detailMessage = {
        title : "MyTitle",
        content: "MyContent"
    };

    this.deleteCandidate = "";

    /**
     * Fetches the messages given the name of it's receiver.
     * The data is stored internally in that.messages.
     *
     * @param recName   the name of the receiver.
     */
    this.getMessagesByReceiverName = function(recName){
        $http.get('/admin/messages/all/'+recName).
            success(function(data) {
                that.messages = data;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data");
                }
            }).
            error(function() {
                that.messages  = that.errorObject;
            });
    };

    /**
     * Fetches the messages given the name of it's sender.
     * The data is stored internally in that.outMessages.
     *
     * @param sendName   the name of the sender.
     */
    this.getMessagesBySenderName = function(sendName){
        $http.get('/admin/messages/sendBy/'+sendName).
            success(function(data) {
                that.outMessages = data;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data");
                }
            }).
            error(function() {
                that.messages  = that.errorObject;
            });
    };

    /**
     * Fetches a concrete message by its uID.
     * The message is stored internally in that.detailMessage.
     *
     * @param messageID     the uID of the message
     */
    this.getMessageByID = function(messageID){
        $http.get('/admin/messages/view/'+messageID).
            success(function(data) {

                that.detailMessage.title = data[0].title;
                that.detailMessage.content = data[0].content;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data of message " + messageID);
                }
            }).
            error(function() {
                that.messages  = that.errorObject;
            });
    };

    /**
     * Sends a new message given the uID of the sender
     *
     * @param emailOfTheSender  the uID resp. email address of the sender
     */
    this.sendMessage = function(emailOfTheSender){
        var uID = commonTaskService.generateUID(that.messageThatGetsCurrentlyCreated.title+that.messageThatGetsCurrentlyCreated.receiver+
            that.messageThatGetsCurrentlyCreated.content);

        var tempMessage = commonTaskService.createMessageObject(uID,that.messageThatGetsCurrentlyCreated.receiver, emailOfTheSender,
        that.messageThatGetsCurrentlyCreated.title, that.messageThatGetsCurrentlyCreated.content);

        commonTaskService.sendPrivateMessage($http, tempMessage, that.debug);
    };

    /**
     * Deletes a message given its uID
     *
     * @param messageID     of the message that should be deleted
     */
    this.deleteMessage = function(messageID){
        /* remove from backend */
        if(that.debug == true){
            console.log("info MessageCtrl: message with id " + messageID + " will be deleted ");
        }

        $http.delete('/admin/messages/'+messageID).
            success(function() {
                if(that.debug == true){
                    console.log("info MessageCtrl: message with id " + messageID + " has been deleted ");
                }

                /* remove from frontend, too */
                var newValues = [];
                for(var i=0; i < that.messages.length; i++){
                    if(that.messages[i].uID != messageID){
                        newValues.push(that.messages[i]);
                    }
                }

                that.messages = newValues;

            }).
            error(function() {

                that.messages  = that.errorObject;

                if(that.debug == true){
                    console.log("error MessageCtrl: message with id " + messageID + " has NOT been deleted ");
                }
            });
    };

    /* update parameter if needed */
    if($routeParams.recName != undefined){
        if(this.debug)
            console.log("info MessageCtrl: fetching messages for user " + $routeParams.recName);

        that.getMessagesByReceiverName($routeParams.recName);
        that.getMessagesBySenderName($routeParams.recName);
    }

    if($routeParams.messageID != undefined){
        that.getMessageByID($routeParams.messageID);
    }

    if($routeParams.toUserUID != undefined && $routeParams.title != undefined){
        that.messageThatGetsCurrentlyCreated.receiver   = $routeParams.toUserUID;
        that.messageThatGetsCurrentlyCreated.title      = $routeParams.title;
    }

}]);