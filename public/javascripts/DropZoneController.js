/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

controllersModule.controller('DropUploadCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    var that = this;

    console.log("$scope::>");
    console.log($scope.label); // this is working fine
    console.log($scope.topic); // this is undefined

    console.log("$rootScope::>")
    console.log($rootScope.label); // this is working fine
    console.log($rootScope.topic); // this is undefined

    $scope.dropzoneConfig = {
        'options': { // passed into the Dropzone constructor
            'url': '/admin/picture/'
        },
        'eventHandlers': {
            'sending': function (file, xhr, formData) {
            },
            'success': function (file, response) {
            }
        }
    };

}]);