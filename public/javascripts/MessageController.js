/**
 * Created by joerg on 05.11.2014.
 */

controllersModule.controller('MessageCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.messages = [{ }];

    this.detailMessage = {
        title : "MyTitle",
        content: "MyContent"
    };

    /* functions */
    this.getMessagesByReceiverName = function(recName){
        $http.get('/admin/messages/all/'+recName).
            success(function(data, status, headers, config) {

                that.messages = data;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data");
                }
            }).
            error(function(data, status, headers, config) {

                that.messages  = that.errorObject;
            });
    };

    this.getMessageByID = function(messageID){
        $http.get('/admin/messages/view/'+messageID).
            success(function(data, status, headers, config) {

                that.detailMessage.title = data[0].title;
                that.detailMessage.content = data[0].content;

                if(that.debug == true){
                    console.log("info MessageCtrl: getting message data of message " + messageID);
                }
            }).
            error(function(data, status, headers, config) {

                that.messages  = that.errorObject;
            });
    };

    this.deleteMessage = function(messageID){
        /* remove from backend */
        if(that.debug == true){
            console.log("info MessageCtrl: message with id " + messageID + " will be deleted ");
        }

        $http.delete('/admin/messages/'+messageID).
            success(function(data, status, headers, config) {
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
            error(function(data, status, headers, config) {

                that.messages  = that.errorObject;

                if(that.debug == true){
                    console.log("error MessageCtrl: message with id " + messageID + " has NOT been deleted ");
                }
            });
    }

    /* update parameter if needed */
    if($routeParams.recName != undefined){
        if(this.debug)
            console.log("info MessageCtrl: fetching messages for user " + $routeParams.recName);

        that.getMessagesByReceiverName($routeParams.recName);
    }

    if($routeParams.messageID != undefined){
        that.getMessageByID($routeParams.messageID);
    }

}]);