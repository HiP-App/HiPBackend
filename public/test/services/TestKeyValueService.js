/**
 * Created by Jörg Amelunxen on 23.01.15.
 */

describe('Testsuite for the KeyValueService:', function () {
    var $httpBackend    = null, service = null;

    var keyvalueList    = [];

    var storageObject   = "";
    var storageObject2  = "";

    var typeTest = "";
    var typeTest2 = "";
    var typeTemplate = "";
    var typeList = [];

    beforeEach(function () {
        module('myApp.services');

    });

    beforeEach(inject(function (keyValueService ,_$httpBackend_) {
        $httpBackend    =   _$httpBackend_;
        service         =   keyValueService;

        keyvalueList    = ["type#test","key1#value1","key2#value2"];

        storageObject = [{
            uID: "uID_1",
            list: keyvalueList
        }];

        storageObject2 = [{
            uID: "uID_2",
            list: ["type#test"]
        }];

        typeTest = {
            uID: "UID_TEST",
            name: "test",
            extendsType: 'root',
            system: true,
            keys: ["key1"],
            values: ["initMe"]
        };

        typeTest2 = {
            uID: "UID_TEST2",
            name: "test2",
            extendsType: 'root',
            system: true,
            keys: ["key1", "test2"],
            values: ["defaultValue", "defaultValue2"]
        };

        typeTemplate = {
            uID: "UID_TEMPLATE",
            name: "template",
            extendsType: 'root',
            system: true,
            keys: ["HowTo"],
            values: ["<h3>Vorlagen</h3><p><br/></p><p>Die Vorlagen können benutzt werden, um wiederkehrende Situationen zu vereinfachen.</p>"]
        };

        typeList = [typeTest, typeTest2, typeTemplate];
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initService() {
        $httpBackend.expect('GET', '/admin/types').respond(200, typeList);
        $httpBackend.flush();
    }

    it('is able to get a new key value store', function () {
        initService();

        var check = function(data){
            expect(data.length).toBe(2);
        };

        service.getKVStore("UID_1", check);

        $httpBackend.expect("GET","/admin/kv/UID_1").respond(200, storageObject);
        $httpBackend.flush();
    });

    it('is able to delete a key value store', function () {
        initService();

        service.deleteKVStore("UID_1");

        $httpBackend.expect("DELETE","/admin/kv/UID_1").respond(200, {});
        $httpBackend.flush();
    });

    it('is able to send a new key value store to the backend', function () {
        initService();

        service.createKVStore(keyvalueList);

        var expectKV = {
            uID: Tooling.lastGeneratedRandomUID,
            list: keyvalueList
        };

        $httpBackend.expect("POST","/admin/kv", expectKV).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to send a new key value store to the backend and does not crash if it is empty', function () {
        initService();

        service.createKVStore([]);

        var expectKV = {
            uID: Tooling.lastGeneratedRandomUID,
            list: []
        };

        $httpBackend.expect("POST","/admin/kv", expectKV).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to create a KV-Store with the json wrapper function', function () {
        initService();

        var json = {
            type: "test",
            keys: ["key1","key2"],
            key1: "value1",
            key2: "value2"
        };

        service.createKVStoreAsJSON(json);

        var expectKV = {
            uID: Tooling.lastGeneratedRandomUID,
            list: keyvalueList
        };

        $httpBackend.expect("POST","/admin/kv", expectKV).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to create a KV-Store according to a given type', function () {
        initService();

        service.createEmptyStoreAccordingToType("test");

        var expectKV = {
            uID: Tooling.lastGeneratedRandomUID,
            list: ["type#test","key1#initMe"]
        };

        $httpBackend.expect("POST","/admin/kv", expectKV).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to create a KV-Store according to a given type: even with values', function () {
        initService();

        service.createEmptyStoreAccordingToType("test2");

        var expectKV = {
            uID: Tooling.lastGeneratedRandomUID,
            list: ["type#test2","key1#defaultValue","test2#defaultValue2"]
        };

        $httpBackend.expect("POST","/admin/kv", expectKV).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to check if the kv store includes the type key', function () {
        initService();

        service.checkType("uID_1", function(type){
            expect(type).toBe("test");
        });

        $httpBackend.expect("GET","/admin/kv/uID_1").respond(200, storageObject);
        $httpBackend.flush();
    });

    it('is able to check if a KVStore contains every needed (type-specific) field - if it is correct', function () {
        initService();

        service.checkFieldsForTypeAndCreateIfNeeded("uID_1", function(createdFields){
            expect(createdFields.length).toBe(0);
        });

        $httpBackend.expect("GET","/admin/kv/uID_1").respond(200, storageObject);
        $httpBackend.flush();
    });

    it('is able to check if a KVStore contains every needed (type-specific) field - if it not correct', function () {
        initService();

        // set another test-type
        keyvalueList[0] = "type#test2";

        service.checkFieldsForTypeAndCreateIfNeeded("uID_1", function(createdFields){
            expect(createdFields.length).toBe(1);
        });

        $httpBackend.expect("GET","/admin/kv/uID_1").respond(200, storageObject);
        $httpBackend.expect("PUT","/admin/kv/uID_1/test2#initMe").respond(200, keyvalueList);
        $httpBackend.flush();
    });

    it('is able to update a KV-Store', function () {
        initService();

        var store = {
            uID: "uID_1",
            type: "test",
            keys: ["key1"],
            key1: "value4"
        };

        service.updateKVStore(store);

        var versionInBackend = {
            uID: "uID_1",
            list: ["type#test","key1#value4"]
        };

        $httpBackend.expect("PUT","/admin/kv", versionInBackend).respond(200, keyvalueList);
        $httpBackend.flush();
    });

    it('is able to send a key to another store', function () {
        initService();

        var fromStore = "uID_1";
        var key = "key1";
        var toStore = "uID_2";

        service.transferKey(fromStore, key, toStore);

        /* fetch both stores */
        $httpBackend.expect("GET","/admin/kv/uID_1").respond(200, storageObject);
        $httpBackend.expect("GET","/admin/kv/uID_2").respond(200, storageObject2);

        var versionInBackend = {
            uID: "uID_2",
            list: ["type#test","key1#value1"]
        };

        /* send modified store back */
        $httpBackend.expect("PUT","/admin/kv", versionInBackend).respond(200, keyvalueList);
        $httpBackend.flush();
    });

});
