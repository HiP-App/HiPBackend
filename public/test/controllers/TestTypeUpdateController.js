/**
 * Created by Jörg Amelunxen on 10.02.15.
 */

describe('Testsuite for the TypeUpdateController:', function () {
    var controller = null, $scope = null, $httpBackend = null, neededService = null;

    var noUID = false;

    var routeParams = {};
    routeParams.uID = "uID_1";

    var typeObject= {};

    beforeEach(function () {
        module('myApp.controllers');

        typeObject = {
            uID: "uID_1",
            name: 'type_A',
            extendsType: 'root',
            system: false,
            keys: ['ownAttr'],
            values: ['myValue']
        };
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;

        $scope = $rootScope.$new();

        $scope.lc = {
            getTerm: function(value){
                if(value == ownAttr)
                    return "de";
            }
        };

        if(noUID){
            routeParams.uID = undefined;
        }else{
            routeParams.uID = "uID_1";
        }

        /* create controller */
        controller = $controller('TypeCtrl', {
            $scope: $scope,
            $routeParams: routeParams
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initController() {
        $httpBackend.expect('GET', '/admin/type/'+typeObject.uID).respond(200,[typeObject]);
        $httpBackend.flush();
    }

    it('fetches the given type on startup the ', function () {
        initController();

        /* needed for next test case :: modify routeparams*/
        noUID = true;
    });

    it('fetches all types if no concrete type is specified', function () {
        $httpBackend.expect('GET', '/admin/types').respond(200,[typeObject]);
        $httpBackend.flush();



        /* needed for next test case :: reset routeparams*/
        noUID = false;
    });

    it('is able to update a type', function () {
        initController();

        controller.updateType(typeObject);

        $httpBackend.expect('POST','/admin/types',typeObject).respond(200,{});
        $httpBackend.expect('POST', '/admin/languages').respond(200,{});
        $httpBackend.expect('POST', '/admin/languages').respond(200,{});

        $httpBackend.flush();
    });

    it('is able to fetch correct language data', function () {
        initController();

        controller.fetchLanguageFor(["ownAttr"], 'type_A', function(dict){
            expect(dict.de["ownAttr"]).toBe("de");
        });

        $httpBackend.expect('GET','/admin/languages/de').respond(200,[{key: 'type_ownAttr_type_A', value: 'de'}]);
        $httpBackend.expect('GET','/admin/languages/eng').respond(200,[{key: 'type_ownAttr_type_A', value: 'eng'}]);
        $httpBackend.flush();
    });

    it('is able to send new language data', function () {
        initController();

        /* prepare test case*/
        controller.fetchLanguageFor(["ownAttr"], 'type_A', function(dict){
            expect(dict.de["ownAttr"]).toBe("de");
        });

        $httpBackend.expect('GET','/admin/languages/de').respond(200,[{key: 'type_ownAttr_type_A', value: 'de'}]);
        $httpBackend.expect('GET','/admin/languages/eng').respond(200,[{key: 'type_ownAttr_type_A', value: 'eng'}]);
        $httpBackend.flush();

        controller.dictEntry = {
            de: {
                ownAttr: 'de_change'
            },
            eng: {
                ownAttr: 'eng_change'
            }
        };

        /* run test */
        controller.sendLanguageData();

        /* expect results */
        var expectDE = {
            language: 'de',
            key: 'type_ownAttr_type_A',
            value: 'de_change'
        };

        var expectENG = {
            language: 'eng',
            key: 'type_ownAttr_type_A',
            value: 'eng_change'
        };

        $httpBackend.expect('DELETE', '/admin/languages/type_ownAttr_type_A/de').respond(200,{});
        $httpBackend.expect('DELETE', '/admin/languages/type_ownAttr_type_A/eng').respond(200,{});

        $httpBackend.expect('POST', '/admin/languages', expectDE).respond(200,{});
        $httpBackend.expect('POST', '/admin/languages', expectENG).respond(200,{});
        $httpBackend.flush();
    });

    it('is able to send new language data but does nothing if values are not changed', function () {
        initController();

        /* prepare test case*/
        controller.fetchLanguageFor(["ownAttr"], 'type_A', function(dict){
            expect(dict.de["ownAttr"]).toBe("de");
        });

        $httpBackend.expect('GET','/admin/languages/de').respond(200,[{key: 'type_ownAttr_type_A', value: 'de'}]);
        $httpBackend.expect('GET','/admin/languages/eng').respond(200,[{key: 'type_ownAttr_type_A', value: 'eng'}]);
        $httpBackend.flush();

        controller.dictEntry = {
            de: {
                ownAttr: 'de'
            },
            eng: {
                ownAttr: 'eng'
            }
        };

        /* run test */
        controller.sendLanguageData();

        /* expect no further calls */
    });
});