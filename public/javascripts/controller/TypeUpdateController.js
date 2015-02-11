/**
 * Created by Jörg Amelunxen on 09.02.15.
 */
controllersModule.controller('TypeCtrl', ['$scope','$http','$routeParams','typeService', 'commonTaskService',function($scope,$http,$routeParams,typeService, commonTaskService) {
    var that = this;

    this.loadedType = {};       // stores the currently loaded type
    this.types = [];            // stores all types

    this.dict = {
        de: {},
        eng: {}
    };

    this.dictEntry = {          // stores the dictionary data for this type
        de: {},
        eng: {}
    };

    /**
     * Fetches the language data for the given key array and the given type name
     * @param keyArray              the names of the used keys
     * @param typeName              name of the type
     * @param callback              first parameter contains the dict
     */
    this.fetchLanguageFor = function(keyArray, typeName, callback){
        $http.get('/admin/languages/de').
            success(function(deDict) {
                /* create DE dict */
                deDict.forEach(function(entry){
                   that.dict.de[entry.key] = entry.value;
                });

                $http.get('/admin/languages/eng').
                    success(function(engDict) {
                        /* create ENG dict */
                        engDict.forEach(function(entry){
                            that.dict.eng[entry.key] = entry.value;
                        });

                        /* use both dictionaries to create the dictEntry */
                        keyArray.forEach(function(key){
                            var completeTerm =  'type_'+key+'_'+typeName;

                            that.dictEntry.de[key]  = that.dict.de[completeTerm];
                            that.dictEntry.eng[key] = that.dict.eng[completeTerm];
                        });

                        if(callback != undefined)
                            callback(that.dictEntry);
                    });
            });
    };

    /**
     * Adapter for type interface
     * @param type
     * @param callback              first parameter contains the dict
     */
    this.fetchLanguageForType = function(type, callback){
        that.fetchLanguageFor(type.keys, type.name, callback);
    };

    /**
     * This function updates the language tokens on the server side. However, it does nothing if the language values
     * are not changed to prevent the unnecessary loss of bandwidth.
     */
    this.sendLanguageData = function(){
        that.loadedType.keys.forEach(function(key){
            var languageTerm = 'type_'+key+'_'+that.loadedType.name;

            var languageObjectDe = {
                language: 'de',
                key: languageTerm,
                value: that.dictEntry.de[key]
            };

            var languageObjectEng = {
                language: 'eng',
                key: languageTerm,
                value: that.dictEntry.eng[key]
            };

            if(that.dict.de[languageTerm] == undefined){
                /* language key is unknown => just post german term */
                $http.post('/admin/languages', languageObjectDe)
            }else if(that.dictEntry.de[key] != that.dict.de[languageTerm]){
                /* old language key is known => delete old one and post new german term */
                $http.delete('/admin/languages/'+languageTerm+'/de').success(function(){
                    $http.post('/admin/languages', languageObjectDe)
                });
            }

            if(that.dict.de[languageTerm] == undefined){
                /* language key is unknown => just post english term */
                $http.post('/admin/languages', languageObjectEng)
            }else if(that.dictEntry.eng[key] != that.dict.eng[languageTerm]){
                /* old language key is known => delete old one and post new english term */
                $http.delete('/admin/languages/'+languageTerm+'/eng').success(function(){
                    $http.post('/admin/languages', languageObjectEng)
                });
            }
        });
    };

    /**
     * Checks if the loadedType includes all parent keys. If this is not the keys, the keys will be created.
     * @param uID   uID of the parent
     */
    this.checkParentDependency = function(uID){
        /* do we have a full type object? */
        if(that.loadedType.keys == undefined || that.loadedType.values == undefined || that.loadedType.extendsType == undefined){
            /* set new type */
            that.loadedType = commonTaskService.createTypeObject(that.loadedType.name, uID, [], [], "false");
        }

        typeService.getType(uID, function(type){
            type.keys.forEach(function(key){
               var found = (jQuery.inArray(key, that.loadedType.keys));

                if(found == -1){
                    that.loadedType.keys.push(key);
                    that.loadedType.values.push(type[key]);
                    that.loadedType[key] = type[key];
                }
            });
        });

        /* update languages */
        that.fetchLanguageForType(that.loadedType);
    };

    /**
     * Returns true if the given index of the key array is a newly created one
     * @param index
     * @returns {boolean}
     */
    this.isIndexNew = function(index){
        if(that.loadedType.newAdded != undefined){
            var pos = jQuery.inArray(index, that.loadedType.newAdded);
            if(pos == -1){
                return false;
            }else{
                return true;
            }
        }else{
            return false;
        }
    };

    /**
     * Updates the keys of the loaded type at position index with value key
     * @param index     The index that should be overwritten
     * @param key       The new key value
     */
    this.updateKeyArray = function(index, key){
        if(that.loadedType.keys != undefined) {
            that.loadedType.keys[index] = key;
        }
    };

    function AngularBugWorkAround() {
        if (that.loadedType.newAdded != undefined) {
            const index = that.loadedType.newAdded[0];
            const keyName = that.loadedType[index];
            that.updateKeyArray(index, keyName);

            /* update dict entries */
            that.dictEntry.de[keyName] = that.dictEntry.de[''];
            that.dictEntry.eng[keyName] = that.dictEntry.eng[''];

            /* clear */
            that.dictEntry.de[''] = '';
            that.dictEntry.eng[''] = '';
            that.loadedType[index] = '';
            that.loadedType.newAdded.pop();
        }
    }

    /**
     * Adds a new key to the current type
     */
    this.addKey = function(){
        /* push old one if needed */
        /* UGLY WORKDAROUND FOR BUG IN ANGULAR: push new created fields to key array */
        AngularBugWorkAround();

        /* create new key */
        if(that.loadedType.keys != undefined){
            that.loadedType.keys.push("");

            if(that.loadedType.newAdded == undefined){
                that.loadedType.newAdded = [];
            }

            /* add index of created key to newAdded array */
            that.loadedType.newAdded.push(that.loadedType.keys.length-1);
        }
    };

    /**
     * This function updates resp. creates the type with the given data
     * @param type      the new type data. If the type is undefined, the controller will use that.loadedType
     */
    this.updateType = function(type){
        if(type == undefined){
            type = that.loadedType;
        }

        /* WORKDAROUND FOR BUG IN ANGULAR: push new created fields to key array */
        AngularBugWorkAround();

        /* update or creation? */
        var typeNameIsKnown = function(type){
            for(var i = 0; i < that.types.length; i++){
             if(that.types[i].name == type.name){
                 return true;
             }
            }
            return false;
        };

        if(typeNameIsKnown(type)){
            typeService.putType(type);
        }else{
            typeService.postType(type);
        }

        that.sendLanguageData();
    };

    if($routeParams.uID != undefined && $routeParams.uID != 'undefined'){
        /* load type information */
        typeService.getType($routeParams.uID, function(type){
           that.loadedType = type;
        });
    }else{
        typeService.getTypes(function(types){
           that.types = types;
        });
    };

}]);
