/**
 * Created by Jörg Amelunxen on 08.02.15.
 */

servicesModule.service('typeService', ['$http', function($http) {

    /* Helper function */
    function createJSObjectInterfaceForOneObject(returnJSON) {

        for (var i = 0; i < returnJSON.keys.length; i++) {
            returnJSON[returnJSON.keys[i]] = returnJSON.values[i];
        }
        return returnJSON;
    }

    /**
     * Function fetches all types in the system and returns them as the first parameter of the callback function
     *
     * @param callback
     */
    this.getTypes = function(callback){
        $http.get('/admin/types').success(function(data){
            /* for each entry => construct JS Object interface */
            for(var i = 0; i < data.length; i++){
                data[i] = createJSObjectInterfaceForOneObject(data[i]);
            }

            /* send back */
            callback(data);
        });
    };

    /**
     * Function fetches the given type and returns it as the first parameter of the callback function
     *
     * @param uID           uID of the type that should be fetched
     * @param callback
     */
    this.getType = function(uID, callback){
        $http.get('/admin/type/'+uID).success(function(data){
            /* construct JS Object interface */
            var returnJSON = createJSObjectInterfaceForOneObject(data[0]);

            if(returnJSON.extendsType != 'root' || returnJSON.extendsType != 'undefined'){
                /* fetch data from supertype */
                $http.get('/admin/type/'+returnJSON.extendsType).success(function(supertype){
                    var JSONSupertype = createJSObjectInterfaceForOneObject(supertype[0]);

                    JSONSupertype.keys.forEach(function(key){
                        returnJSON.keys.push(key);
                        returnJSON.values.push(JSONSupertype[key]);

                        returnJSON[key] = JSONSupertype[key];
                    });

                    /* send object back */
                    callback(returnJSON);
                });
            }else{
                /* put the object into the callback function */
                callback(returnJSON);
            }
        });
    };

    /**
     * Fetches the type with the given name
     * @param name {String}:        The name of the type that should be fetched
     * @param callback
     */
    this.getTypeWithName = function(name, callback){
        $http.get('/admin/typewithname/'+name).success(function(data){
            /* construct JS Object interface */
            var returnJSON = createJSObjectInterfaceForOneObject(data[0]);
            console.log(returnJSON.extendsType);
            if(returnJSON.extendsType != 'root'){
                console.log(returnJSON);
                /* fetch data from supertype */
                $http.get('/admin/type/'+returnJSON.extendsType).success(function(supertype){
                    var JSONSupertype = createJSObjectInterfaceForOneObject(supertype[0]);

                    JSONSupertype.keys.forEach(function(key){
                        returnJSON.keys.push(key);
                        returnJSON.values.push(JSONSupertype[key]);

                        returnJSON[key] = JSONSupertype[key];
                    });

                    /* send object back */
                    callback(returnJSON);
                });
            }else{
                /* put the object into the callback function */
                callback(returnJSON);
            }
        });
    };

    /**
     * Function updates the given type on the server
     *
     * @param type {JSON}:      The type that should be updated
     */
    this.putType = function(type){
        $http.put('/admin/types',type).success(function(){

        });
    };

    /**
     * Creates a type from offline data
     *
     * @param name
     * @param offlineData
     * @returns {*}
     */
    this.constructTypeFromOfflineData = function(name, offlineData){
        var findType = function(aName){
            for(var i=0; i < offlineData.length; i++){
                if(offlineData[i].name == aName){
                    return offlineData[i];
                }
            }
            return null;
        };

        var findwithUID = function(aUID){
            for(var i=0; i < offlineData.length; i++){
                if(offlineData[i].uID == aUID){
                    return offlineData[i];
                }
            }
            return null;
        };

        var type = createJSObjectInterfaceForOneObject(findType(name));

        if(type.extendsType != 'root'){
            /* append supertype */
            var stype = findwithUID(type.extendsType);

            stype.keys.forEach(function(key){
                type.keys.push(key);
                type.values.push(stype[key]);
                type[key] = stype[key];
            });
        }

        return type;
    };
}]);