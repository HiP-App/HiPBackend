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

    /* update parameter if needed */
    if($routeParams.recName != undefined){
        that.getMessagesByReceiverName($routeParams.recName);
    }

    if($routeParams.messageID != undefined){
        that.getMessageByID($routeParams.messageID);
    }

}]);