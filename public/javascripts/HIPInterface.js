/**
 * Created by Jörg Amelunxen on 28.11.14.
 *
 * This Tooling Object is needed for testing with Jasmine
 */

var Tooling = {};

Tooling.lastGeneratedRandomUID = "";
Tooling.lastUsedTimeStamp = "";

var Config = {};

Config.possibleContraints = ["character_limitation","img_limitation","max_character_limitation"]; // holds the used constraints in the system

/* KV Stores: needed fields */
Config.neededFieldsForKVStoreWithType_test  = ["key1"];
Config.neededFieldsForKVStoreWithType_test2 = ["key1", "test2"];

/* Helper functions */
Config.returnNeededFieldsForType = function(type){
    var completeNameOfTheField = "neededFieldsForKVStoreWithType_"+type;

    return Config[completeNameOfTheField];
};

