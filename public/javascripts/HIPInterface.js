/**
 * Created by Jörg Amelunxen on 28.11.14.
 *
 * This Tooling Object is needed for testing with Jasmine
 */

var Tooling = {};

Tooling.secondlastGeneratedRandomUID = "";
Tooling.lastGeneratedRandomUID = "";
Tooling.lastUsedTimeStamp = "";

var Config = {};

Config.possibleContraints = ["character_limitation","img_limitation","max_character_limitation"]; // holds the used constraints in the system
Config.constraintsThatDoesNotMatterForSaving = ["max_character_limitation"]; // every constraint listed here does not need to be fulfilled for the topic to be saved

/* KV Stores: needed fields => this specifies the 'types' of the KV-Stores*/
Config.neededFieldsForKVStoreWithType_test  = ["key1"];

Config.neededFieldsForKVStoreWithType_test2 = ["key1", "test2"];
Config.neededValuesForKVStoreWithType_test2 = ["defaultValue", "defaultValue2"];

Config.neededFieldsForKVStoreWithType_img   = ["Source","Description"];

Config.neededFieldsForKVStoreWithType_template      =   ["HowTo"];
Config.neededValuesForKVStoreWithType_template      =   ["<h3>Vorlagen</h3><p><br/></p><p>Die Vorlagen können benutzt werden, um wiederkehrende Situationen zu vereinfachen.</p>"];

/* Helper functions */
/*
Config.returnNeededFieldsForType = function(type){
    var completeNameOfTheField = "neededFieldsForKVStoreWithType_"+type;

    return Config[completeNameOfTheField];
};

Config.returnValuesForType = function(type){
    var completeNameOfTheField = "neededValuesForKVStoreWithType_"+type;

    return Config[completeNameOfTheField];
};*/


