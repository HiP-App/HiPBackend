/**
 * Created by Jörg Amelunxen on 27.01.15.
 */

describe('Testsuite for the TemplateController:', function () {
    var controller = null, $scope = null, $httpBackend = null;

    var userObject  = undefined;
    var userObject2 = undefined;
    var store       = undefined;
    var store2      = undefined;
    var group       = undefined;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope,_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();

        $scope.uc = {};
        $scope.uc.email = "JohnDoe@doe.com";

        controller = $controller('TemplateCtrl', {
            $scope: $scope
        });
    }));

    beforeEach(function(){
        userObject = {
            uID: $scope.uc.email,
            role: "supervisor",
            templates: "ksUID"
        };

        userObject2 = {
            uID: "JaneDoe@doe.com",
            role: "student",
            templates: "ksUID2"
        };


        store = {
            uID: "ksUID",
            list: ["type#test","key1#value1"]
        };

        store2 = {
            uID: "ksUID2",
            list: ["type#test","key4#value1"]
        };

        group = {
            uID: "groupUID",
            member: "JaneDoe@doe.com,JohnDoe@doe.com"
        }
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initController(){
        /* expect the fetch of the user data */
        $httpBackend.expect('GET','/admin/role/'+$scope.uc.email).respond(200,[userObject]);

        /* expect the fetch of the corresponding KV-Store. It's uID was contained in the
         userData */
        $httpBackend.expect('GET','/admin/kv/'+userObject.templates).respond(200,[store]);
        $httpBackend.flush();

        expect(controller.templates.key1).toBe("value1");
    }

    it('is able to fetch the templates of the current user on startup', function () {
        initController();
    });

    it('is able to fetch the templates of the current user on startup and creates a new' +
        'KV-Store if the user has no store', function () {
        /* set controller in testing mode */
        controller.testing = true;

        /* manipulate normal init process */
        userObject.templates = "-1";

        /* expect the fetch of the user data */
        $httpBackend.expect('GET','/admin/role/'+$scope.uc.email).respond(200,[userObject]);

        /* expect the posting of the new KV-Store. */
        $httpBackend.expect('POST','/admin/kv').respond(200,{});

        /* expect the update of the users KV-Store. */
        $httpBackend.expect('PUT','/admin/userkv/'+$scope.uc.email+'/testingStore').respond(200,{});
        $httpBackend.flush();

        /* expect that the controller has been initialized correctly */
        expect(controller.templates.HowTo).toBe('HowTo_Field_Value');
    });

    it('is able to transfer one template to another user', function () {
        initController();

        /* use function */
        controller.transferKeyToAnotherStore("key1","JaneDoe@doe.com");

        /* check result */
        /* expect fetching the target user */
        $httpBackend.expect("GET","/admin/role/JaneDoe@doe.com").respond(200, [userObject2]);

        /* fetch both stores */
        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);
        $httpBackend.expect("GET","/admin/kv/ksUID2").respond(200, [store2]);

        var versionInBackend = {
            uID: "ksUID2",
            list: ["type#test","key4#value1","key1#value1"]
        };

        /* send modified store back */
        $httpBackend.expect("PUT","/admin/kv", versionInBackend).respond(200, {});
        $httpBackend.flush();

    });

    it('is able to transfer one template to a whole group', function () {
        initController();

        controller.transferKeyToAnotherGroup("key1","groupUID");

        /* fetch needed data */
        $httpBackend.expect("GET","/admin/group/groupUID").respond(200, [group]);
        $httpBackend.expect("GET","/admin/role/JaneDoe@doe.com").respond(200, [userObject2]);
        $httpBackend.expect("GET","/admin/role/JohnDoe@doe.com").respond(200, [userObject]);

        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);
        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);
        $httpBackend.expect("GET","/admin/kv/ksUID2").respond(200, [store2]);
        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);

        /* store both groups */
        $httpBackend.expect("PUT","/admin/kv").respond(200, {});
        $httpBackend.expect("PUT","/admin/kv").respond(200, {});
        $httpBackend.flush();
    });

    it('is able to append a given template to a given content', function () {
        initController();

        var resultString = "abc";

        resultString = controller.appendTemplateTo("key1",resultString);

        expect(resultString).toBe("abcvalue1");
    });

    it('is able to add a new template to the current store', function () {
        initController();

        var key     = "LOREM";
        var value   = "IPSUM";
        controller.addTemplateToStore(key, value);

        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);

        var versionInBackend = {
            uID: "ksUID",
            list: ["type#test","key1#value1", "LOREM#IPSUM"]
        };

        /* send modified store back */
        $httpBackend.expect("PUT","/admin/kv", versionInBackend).respond(200, {});
        $httpBackend.flush();
    });

    it('is able to delete a template from the current store', function () {
        initController();

        controller.removeTemplateFromStore("key1");

        $httpBackend.expect("GET","/admin/kv/ksUID").respond(200, [store]);

        var versionInBackend = {
            uID: "ksUID",
            list: ["type#test"]
        };

        /* send modified store back */
        $httpBackend.expect("PUT","/admin/kv", versionInBackend).respond(200, {});
        $httpBackend.flush();
    });
});
