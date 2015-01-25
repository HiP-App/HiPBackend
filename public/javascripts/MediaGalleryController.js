/**
 * Created by Jörg Amelunxen on 07.01.15.
 *
 * @class angular_module.controllersModule.GalleryCtrl
 *
 * This controller is used within the mediaGallery directive. It implements the function for deleting images in the
 * backend.
 */
controllersModule.controller('GalleryCtrl', ['$scope','$http','keyValueService' ,function($scope,$http, keyValueService) {
    var that = this;

    $scope.collapse = [];

    this.store = ""; // contains the currently open key value store

    /**
     * This functions opens the meta-data panel for the given picture
     *
     * @param uIDOfThePicture           uID of the checked picture
     * @param uIDOfTheKeyValueStore     uId of the key value store. If this value is -1 the function will create
     *                                  a new store.
     */
    this.openMetaData = function(uIDOfThePicture, uIDOfTheKeyValueStore){
        if(uIDOfTheKeyValueStore != "-1"){
            /* load it */
            keyValueService.getKVStore(uIDOfTheKeyValueStore, function(store){
                /* use store */
                that.store = store;
            });
        }else{
            /* create it */
            var store = keyValueService.createEmptyStoreAccordingToType('img');

            /* modify picture kvStore */
            $http.put('/admin/picturekv/'+uIDOfThePicture+'/'+store.uID);

            /* use store */
            that.store = store;
        }

        /* trigger view */
        $scope.collapse[uIDOfThePicture] = !$scope.collapse[uIDOfThePicture];
    };

    /**
     * This function saves the currently opened store in the backend.
     */
    this.saveMetaData = function(uIDOfThePicture){
        keyValueService.updateKVStore(that.store);

        /* trigger view */
        $scope.collapse[uIDOfThePicture] = !$scope.collapse[uIDOfThePicture];
    };

    /**
     * This function deletes the given store
     *
     * @param uIDOfTheStore     uID of the store that should be deleted
     */
    this.deleteKVStore = function(uIDOfTheStore){
        if(uIDOfTheStore != -1){
            $http.delete('/admin/kv/'+uIDOfTheStore);
        }else{
            $http.delete('/admin/kv/'+that.store.uID);
        }
    };

    /**
     * This function deletes the picture on the server side (i.e., it sends the deletion request) and
     * removes the picture from the list on frontend side
     *
     * @param uID   of the picture that should be removed
     */
    this.deletePicture = function(uID){
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