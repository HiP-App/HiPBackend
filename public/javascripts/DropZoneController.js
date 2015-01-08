/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.controller('DropUploadCtrl', ['$scope', '$rootScope', '$routeParams', function($scope, $rootScope, $routeParams) {
    var that = this;

    var targetTopic = "";   // stores the topic that is used to store/link the picture
    if($scope.topic != undefined){
        // use scope variable
        targetTopic = $scope.topic;
    }else{
        // fallback: Use routeParams for topicID
        targetTopic = $routeParams.topicID;
    }

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            'url': '/admin/picture/'+targetTopic
        },
        'eventHandlers': {
            'sending': function (file, xhr, formData) {
            },
            'success': function (file, response) {
            }
        }
    };

}]);