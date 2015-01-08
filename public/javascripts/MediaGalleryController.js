/**
 * Created by Jörg Amelunxen on 07.01.15.
 */

controllersModule.controller('GalleryCtrl', ['$scope','$http',function($scope,$http) {
    var that = this;

    /**
     * This function deletes the picture on the server side (i.e., it sends the deletion request) and
     * removes the picture from the list on frontend side
     *
     * @param uID   of the picture that should be removed
     */
    this.deletePicture = function(uID){
        var thumbnailID = "";
        /* delete picture itself */
        $http.delete('/admin/picture/'+uID)
            .success(function(data){
                // delete also from file-list in frontend
                if($scope.files != undefined){
                    for(var i=0; i < $scope.files.length; i++){
                        if($scope.files[i].uID == uID){
                            $scope.files.splice(i, 1);
                        }
                    }
                }
            })
            .error(function(){
               console.log('Error MediaController: Cannot delete picture '+uID);
            });
    };

    /**
     * This function sends the picture to something that should contain a link to it. E.g., a topic
     *
     * @param whereToSend       the receiver
     * @param whatToSendUID     the picture that should be send
     */
    this.sendTo = function(whereToSend, whatToSendUID){
          whereToSend.appendToContent("<img src='/admin/picture/"+whatToSendUID+"' width='20%' height='20%'>");
    };

}]);