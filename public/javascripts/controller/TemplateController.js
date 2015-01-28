/**
 * Created by Jörg Amelunxen on 27.01.15.
 *
 * @class angular_module.controllersModule.TemplateCtrl
 *
 * This controller handles the upload/download of templates and is able to send
 * templates to key/value stores of other users
 */

controllersModule.controller('TemplateCtrl', ['$scope','$http','keyValueService',function($scope,$http,keyValueService) {
    var that = this;

    this.storeUID   = "-1";
    this.templates  = "initMe";

    this.testing    = false;       // variable is set to true if the function is under test

    /**
     * This function updates the controllers templates and may create a new storage
     * for templates if the current user has no templates at the current point in time
     */
    this.getTemplates = function(testing){
        $http.get('/admin/role/'+$scope.uc.email).
            success(function(data) {
                that.storeUID = data[0].kvStore;

                /* is there already a store? */
                if(that.storeUID != -1){
                    keyValueService.getKVStore(that.storeUID, function(store){
                        /* clear templates */
                        that.templates = {};

                        /* push to templates */
                        store.keys.forEach(function(key){
                            that.templates[key] = store[key];
                        });
                    });
                }else{
                    /* create a new store */
                    var store = keyValueService.createEmptyStoreAccordingToType("template");

                    /* clear templates */
                    that.templates = {};

                    /* push to templates */
                    store.keys.forEach(function(key){
                        that.templates[key] = store[key];
                    });

                    if(that.testing){
                        store.uID = "testingStore";
                    }

                    /* update user store link */
                    $http.put('/admin/userkv/'+$scope.uc.email+'/'+store.uID);
                }
            }).
            error(function(data, status, headers, config) {
                console.log("Error TemplateCtrl: Error while fetching the KV-Store!")
            });
    };

    /**
     * This function copies the given key to another store.
     * @param key           the key/template that should be copied
     * @param targetUser    the uID of the user that should receive the template
     */
    this.transferKeyToAnotherStore = function(key, targetUser){
        $http.get('/admin/role/'+targetUser).
            success(function(data) {
                var targetStore = data[0].kvStore;
                keyValueService.transferKey(that.storeUID, key, targetStore);
            });
    };

    /**
     * This function attaches the value of the current template key to the appendTo String
     * @param key       the key of the template that should be used
     * @param appendTo  appendTo this String
     * @return          the final String
     */
    this.appendTemplateTo = function(key, appendTo){
        appendTo += that.templates[key];
        return appendTo;
    };

    if(that.templates == "initMe"){
        that.getTemplates();
    }
}]);
