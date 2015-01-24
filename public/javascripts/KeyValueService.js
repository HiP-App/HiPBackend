/**
 * Created by Jörg Amelunxen on 23.01.15.
 *
 * This service handles the connection to the key/value store.
 */

servicesModule.service('keyValueService', ['$http', 'commonTaskService', function($http, commonTaskService) {
    var that = this;

    this.downloadedKVStore = [];

    /**
     * Fetches a new Key/Value store from the backend.
     *
     * @param uID {String}:         The uID of the KV-Store that should be fetched
     * @param doSth {function}:     The callback function. The data parameter holds the KV-Store as JSON Object.
     */
    this.getKVStore = function(uID, doSth){
        $http.get('/admin/kv/'+uID)
            .success(function(data){
                var JSON = {};
                var keys = [];

                data.forEach(function(item){
                    var token = item.split("#");
                    JSON[token[0]] = token[1];
                    keys.push(token[0]);
                });

                JSON.keys = keys;
                JSON.length = keys.length;

                doSth(JSON);
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
     */
    this.createKVStore = function(list){
        var uID = commonTaskService.generateUID(list.toString());

        var post = {
            uID: uID,
            list: list
        };

        $http.post('/admin/kv/'+uID, post);
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
     * @param doSth     callback function. The function contains a list of the created fields as a parameter
     */
    this.checkFieldsForTypeAndCreateIfNeeded = function(uID, doSth){
        that.getKVStore(uID, function(store){
            /* search for needed fields */
            var neededFields = Config.returnNeededFieldsForType(store.type);

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

            doSth(created);
        });
    };

}]);