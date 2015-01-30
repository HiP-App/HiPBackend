/**
 * Created by Jörg Amelunxen on 27.01.15.
 *
 * @class angular_module.controllersModule.TemplateCtrl
 *
 * This controller handles the upload/download of templates and is able to send
 * templates to key/value stores of other users
 */

controllersModule.controller('TemplateCtrl', ['$scope','$http','$routeParams','keyValueService',function($scope,$http,$routeParams,keyValueService) {
    var that = this;

    this.storeUID   = "-1";
    this.templates  = "initMe";

    this.frontendMenuForTemplate = {};      // Which menus are shown?

    this.chosenTemplate = {                 // holds the template that should be shown in the frontend
        name: "",
        value: ""
    };

    this.shareMode = false;
    this.shareType = "";
    this.shareTo = "";

    this.testing    = false;                // variable is set to true if the function is under test

    /**
     * This function updates the controllers templates and may create a new storage
     * for templates if the current user has no templates at the current point in time
     */
    this.getTemplates = function(){
        function fetchKeysFromStoreAndInitFrontendValues(store) {
            /* clear templates */
            that.templates = {};
            that.templates.keys = [];

            /* push to templates */
            store.keys.forEach(function (key) {
                that.templates.keys.push(key);
                that.templates[key] = store[key];

                /* init frontend trigger */
                that.frontendMenuForTemplate[key] = true;
            });
        }

        $http.get('/admin/role/'+$scope.uc.email).
            success(function(data) {
                that.storeUID = data[0].templates;
                /* is there already a store? */
                if(that.storeUID != -1){
                    keyValueService.getKVStore(that.storeUID, function(store){
                        fetchKeysFromStoreAndInitFrontendValues(store);
                    });
                }else{
                    /* create a new store */
                    var store = keyValueService.createEmptyStoreAccordingToType("template");

                    fetchKeysFromStoreAndInitFrontendValues(store);

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
                var targetStore = data[0].templates;

                if(targetStore != "-1"){
                    /* target User has a store */
                    keyValueService.transferKey(that.storeUID, key, targetStore);
                }else{
                    /* create a new store for target user */
                    var store = keyValueService.createEmptyStoreAccordingToType("template");

                    if(that.testing){
                        store.uID = "testingStore";
                    }

                    /* update user store link */
                    $http.put('/admin/userkv/'+targetUser+'/'+store.uID).success(function(){
                        /* link has been created -> now: send template */
                        keyValueService.transferKey(that.storeUID, key, store.uID);
                    });
                }
            });
    };

    /**
     * This function sends the given key to every member of the group
     * @param key           the key/template that should be copied
     * @param groupUID      the uID of the user that should receive the template
     */
    this.transferKeyToAnotherGroup = function(key, groupUID){
        $http.get('/admin/group/'+groupUID).
            success(function(data) {
                var group = data[0];

                var member = group.member.split(',');

                member.forEach(function(userID){
                   that.transferKeyToAnotherStore(key, userID);
                });
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

    /**
     * This function adds a new template to the current store
     *
     * @param key       the name of the template
     * @param value     the template itself
     */
    this.addTemplateToStore = function(key, value){
        keyValueService.getKVStore(that.storeUID, function(store){
            var keyNotInKeysList = (jQuery.inArray(key,store.keys) == -1);

            if(keyNotInKeysList){
                /* set key */
                store.keys.push(key);
            }

            /* store value */
            store[key] = value;

            /* send */
            keyValueService.updateKVStore(store);

            /* store also for the frontend */
            that.templates[key] = value;
        });
    };

    /**
     * This function removes the given template from the store of the current user
     *
     * @param key       the key of the template that should be removed
     */
    this.removeTemplateFromStore = function(key){
        keyValueService.getKVStore(that.storeUID, function(store){
            /* delete from the store */
            var position = jQuery.inArray( key, store.keys );
            store.keys.splice(position,1);

            /* remove from frontend */
            delete that.templates[key];
            that.templates.keys.splice(position,1);

            /* send */
            keyValueService.updateKVStore(store);
        });
    };

    /**
     * Prepare the data of the given key for frontend usage. Is also be used
     * if a specific key should be loaded for modification
     *
     * @param key       The template that should be shown
     */
    this.showPreview = function(key){
        that.chosenTemplate.name    = key;
        that.chosenTemplate.value   = that.templates[key];

        that.shareMode = false;
    };

    /**
     * Sets the modal into share mode
     * @param key       The key of the template that should be shared
     * @param type      The share type (i.e., 'group' or 'user')
     */
    this.share = function(key, type){
        that.showPreview(key);

        that.shareMode = true; // switch modal to share mode
        that.shareType = type;
    };

    /**
     * Creates or modifies a new template
     */
    this.sendNewOrModifiedKey = function(){
        var newKey  = that.chosenTemplate.name;
        var value   = that.templates[newKey];

        that.addTemplateToStore(newKey, value);
    };

    if(that.templates == "initMe"){
        that.getTemplates();
    }

    if($routeParams.key != undefined){
        /* load data for this key */
        that.showPreview($routeParams.key);
    }
}]);
