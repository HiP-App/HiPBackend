/**
 * Created by Jörg Amelunxen on 23.01.15.
 *
 * This service handles the connection to the key/value store.
 */

servicesModule.service('keyValueService', ['$http', 'commonTaskService', 'typeService', function($http, commonTaskService, typeService) {
    var that = this;

    this.downloadedKVStore = [];

    /* fetch types on startup */
    this.types = "-1";
    typeService.getTypes(function(types){
        that.types = types;
    });

    /**
     * This function wrapps the serialized from from the Backend to the JSON format of a Key/Value-Store
     * @param uID                   uID of the used KV-Store
     * @param listOfKeysAndValues   the list of the keys and values
     * @returns {{}}                the JSON format of the KV-Store
     */
    function serializedFormToJSON(uID, listOfKeysAndValues) {
        var JSON = {};
        var keys = [];
        listOfKeysAndValues.forEach(function(item) {
            var token = item.split("#");

            // add key and value to JSON object
            if(token[0] != "type"){
                JSON[token[0]] = token[1];

                // add to key list
                keys.push(token[0]);
            }else{
                JSON.type = token[1];
            }
        });

        JSON.uID = uID;
        JSON.keys = keys;
        JSON.length = keys.length;
        return JSON;
    }

    /**
     * This function collects every child type that has the same father (i.e. supertype) as the given one
     * @param name      The name of the current type
     * @returns {Array} An array containing all the types
     */
    this.findAllTypesLikeChild = function(name){
        if(that.types != "-1"){
            return typeService.constructTypechainFromOfflineData(name, that.types);
        }else{
            return [];
        }
    };

    /**
     * Fetches a new Key/Value store from the backend.
     *
     * @param uID {String}:         The uID of the KV-Store that should be fetched
     * @param doSth {function}:     The callback function. The data parameter holds the KV-Store as JSON Object.
     */
    this.getKVStore = function(uID, doSth){
        $http.get('/admin/kv/'+uID)
            .success(function(data){
                if(data != undefined){
                    var JSON = serializedFormToJSON(uID, data[0].list);

                    that.downloadedKVStore = JSON;
                    doSth(JSON);
                }
            }).error(function(){
                console.log("Error while loading KV store");
            });
    };

    /**
     * Deletes the specified KV-Store
     * @param uID {String}:       The uID of the KV-Store that should be deleted
     */
    this.deleteKVStore = function(uID){
        $http.delete('/admin/kv/'+uID).error(function(){
            console.log("Error while deleting KV store");
        })
    };

    /**
     * Creates a new KV store in the Backend
     *
     * @param list {Array[String]}: A ist containing all keys and values encoded like ["key#value",'key2#value2']
     * @return                      The created KV-Store in JSON Format
     */
    this.createKVStore = function(list){
        var uID = commonTaskService.generateUID(list.toString());

        var post = {
            uID: uID,
            list: list
        };

        $http.post('/admin/kv', post);

        return serializedFormToJSON(uID,post.list);
    };

    /**
     * Creates an empty KV-Store with fields according to the given type
     *
     * @param type {String}:    The chosen type for the KV-Store
     * @return                  The created KV-Store in JSON Format
     */
    this.createEmptyStoreAccordingToType = function(type){
        /* find correct type */
        var typeObject = typeService.constructTypeFromOfflineData(type, that.types);

        var keys    = typeObject.keys;
        var values  = typeObject.values;
        var list    = [];

        /* add type value */
        list.push("type#"+type);

        /* create list */
        keys.forEach(function(key){
            var keyHasADefaultValue = (jQuery.inArray(key, keys) != -1);

            if(!keyHasADefaultValue || values == undefined){
                list.push(key+"#initMe");
            }else{
                list.push(key+"#"+values[jQuery.inArray(key, keys )]);
            }
        });

        return that.createKVStore(list);
    };

    /**
     * Wrapper for the createKVStore function.
     * You can now create a KV-Store with a JSON object of the following structure:
     * {
     *  type: Type of the store => influence on needed keys
     *  keys: Array[String] containing all the keys
     *  key1: value1
     *  key2: value2
     *  [...]
     * }
     *
     * @param JSON the object that should be transformed in a KV-Store
     */
    this.createKVStoreAsJSON = function(json){
        var list = [];

        var keys = json.keys;

        // add type
        list.push("type"+"#"+json.type);

        // add keys and values
        keys.forEach(function(key){
            list.push(key+"#"+json[key]);
        });

        that.createKVStore(list);
    };

    /**
     * Fetches the type of the store with the given uID and returns it as a parameter in the callback function
     *
     * @param uID       uID of the checked store
     * @param doSth     callback function
     */
    this.checkType = function(uID, doSth){
        that.getKVStore(uID, function(store){
            doSth(store.type);
        });
    };

    /**
     * Checks if the store has every needed fields for its type. If this is not the case, the function
     * creates the needed fields and sends them to the backend.
     *
     * @param uID       uID of the checked store
     * @param doSth     callback function. The function contains a list of the created fields as a first parameter
     *                  and the complete object as the second one
     */
    this.checkFieldsForTypeAndCreateIfNeeded = function(uID, doSth){
        that.getKVStore(uID, function(store){
            /* search for needed fields */
            var typeObject = typeService.constructTypeFromOfflineData(store.type, that.types);
            var neededFields = typeObject.keys;

            var created = [];

            neededFields.forEach(function(key){
                if(store[key] == undefined){
                    store.keys.push(key);

                    store[key] = "initMe";

                    // create field
                    $http.put("/admin/kv/"+uID+"/"+key+"#initMe");

                    // add to created array
                    created.push(key+"");
                }
            });

            if(doSth != undefined){
                doSth(created, store);
            }
        });
    };

    /**
     * Updates a KV-Store on the server side
     *
     * @param store             The store with the new values as JSON container
     * @param successCallback   The function is run on success of the update
     */
    this.updateKVStore = function(store, successCallback){
        var postThis = {
            uID: store.uID,
            list: ["type#"+store.type]
        };

        // serialize the keys and values
        var keys = store.keys;

        keys.forEach(function(key){
            postThis.list.push(key+"#"+store[key]);
        });

        $http.put('/admin/kv',postThis).success(function(){
            if(successCallback != undefined)
                successCallback();
        }).error(function(){
            console.log("Error while updating the kvStore...")
        });
    };

    /**
     * This function copies a key with its value from one store to another store
     *
     * @param fromStore     the uID of the source store
     * @param key           the key that should be copied
     * @param toStore       the uID of the destination store
     */
    this.transferKey = function(fromStore, key, toStore){
        that.getKVStore(fromStore, function(store){
           var copyValue = store[key];

            that.getKVStore(toStore, function(secondStore){
                /* add key to second store */
                secondStore.keys.push(key);
                secondStore[key] = copyValue;

                /* send store back */
                that.updateKVStore(secondStore);
            });
        });
    };

}]);