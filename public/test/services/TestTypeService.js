/**
 * Created by Jörg Amelunxen on 08.02.15.
 */

describe('Testsuite for the TypeService:', function () {
    var $httpBackend    = null, service = null;

    var typeObject   = "";
    var typeObject2  = "";
    var typeList = [];

    beforeEach(function () {
        module('myApp.services');
    });

    beforeEach(inject(function (typeService ,_$httpBackend_) {
        $httpBackend    =   _$httpBackend_;
        service         =   typeService;

        typeObject = {
            uID: "uID_1",
            name: 'type_A',
            extendsType: 'uID_2',
            system: false,
            keys: ['ownAttr'],
            values: ['myValue']
        };

        typeObject2 = {
            uID: "uID_2",
            name: 'img',
            extendsType: 'root',
            system: true,
            keys: ['text','imgAttr'],
            values: ['ABC','imgAttr23']
        };

        typeList = [typeObject, typeObject2];
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to fetch a type given its uID', function () {
        var check = function(type){
            expect(type.name).toBe('type_A');
        };
        service.getType('uID_1', check);

        $httpBackend.expect("GET","/admin/type/uID_1").respond(200, [typeObject]);
        $httpBackend.expect("GET","/admin/type/uID_2").respond(200, [typeObject2]);
        $httpBackend.flush();
    });

    it('is able to construct all subtype keys and values', function () {
        var check = function(type){
            expect(type.keys[0]).toBe('ownAttr');
            expect(type.values[0]).toBe('myValue');
        };
        service.getType('uID_1', check);

        $httpBackend.expect("GET","/admin/type/uID_1").respond(200, [typeObject]);
        $httpBackend.expect("GET","/admin/type/uID_2").respond(200, [typeObject2]);
        $httpBackend.flush();
    });

    it('is able to construct all supertype keys and values', function () {
        var check = function(type){
            expect(type.keys[1]).toBe('text');
            expect(type.values[1]).toBe('ABC');

            expect(type.keys[2]).toBe('imgAttr');
            expect(type.values[2]).toBe('imgAttr23');
        };
        service.getType('uID_1', check);

        $httpBackend.expect("GET","/admin/type/uID_1").respond(200, [typeObject]);
        $httpBackend.expect("GET","/admin/type/uID_2").respond(200, [typeObject2]);
        $httpBackend.flush();
    });

    it('is able to provide the data via JS Object interface', function () {
        var check = function(type){
            expect(type[type.keys[1]]).toBe('ABC');
        };
        service.getType('uID_1', check);

        $httpBackend.expect("GET","/admin/type/uID_1").respond(200, [typeObject]);
        $httpBackend.expect("GET","/admin/type/uID_2").respond(200, [typeObject2]);
        $httpBackend.flush();
    });

    it('is able to fetch all types', function () {
        var check = function(type){
            expect(type.length).toBe(2);
        };
        service.getTypes(check);

        $httpBackend.expect("GET","/admin/types").respond(200, typeList);
        $httpBackend.flush();
    });

    it('is able to update a type', function () {
        var deepcopy = jQuery.extend(true, {}, typeObject);

        deepcopy.name = "CEF";

        service.putType(deepcopy);

        $httpBackend.expect('PUT','/admin/types',deepcopy).respond(200,{});
        $httpBackend.flush();
    });
});
