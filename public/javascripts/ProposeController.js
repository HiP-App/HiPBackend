/**
 * Created by Jörg Amelunxen on 05.11.2014.
 *
 * @class angular_module.controllersModule.ProposeCtrl
 *
 * This controller is needed to use the functions for proposing a new/specific topic.
 */
controllersModule.controller('ProposeCtrl', ['$scope','$http', function($scope,$http) {
    var that = this;

    this.debug = false;

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    this.propose = {};

    /**
     * Sends a new proposement message to another user
     *
     * @param receiver      the email address resp. uID of the supervisor
     * @param sender        the email address resp. uID of the current user
     * @param proposeString language specific prefix for the title of the message
     */
    this.proposeTopic = function(receiver,sender,proposeString){
        var currentPropID = Tooling.generateUID(that.propose.name);

        var proposement = Tooling.createMessageObject(currentPropID, receiver, sender, proposeString + " " +
            that.propose.name, that.propose.content);

        $http.post('/admin/messages', proposement).
            success(function() {
            }).
            error(function() {
                console.log("Error ProposeCtrl: Could not propose a topic");
            });
    }
}]);