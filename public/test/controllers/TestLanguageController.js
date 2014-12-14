/**
 * Created by jorgamelunxen on 14.12.14.
 */

describe('Testsuite for the AlertController:', function () {
    var controller = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.controllers');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;

        controller = $controller('LangCtrl', {

        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function initTheControllerWithDefaultLanguage() {
        $httpBackend.expectGET('/admin/languages/de')
            .respond(200,[
                {
                    key: 'demo_key_1',
                    value: 'demo_val_1'
                },
                {
                    key: 'demo_notification_1',
                    value: 'a_notification'
                }]);
        $httpBackend.flush();
    }

    it('fetches the default language on startup', function(){
        initTheControllerWithDefaultLanguage();
    });

    it('is able to return a value to a given key', function(){
        initTheControllerWithDefaultLanguage();

        expect(controller.getTerm('demo_key_1')).toBe('demo_val_1');
    });

    it('returns an error if the value has not been found', function(){
        initTheControllerWithDefaultLanguage();

        controller.errorString = "not fetched yet: ";
        expect(controller.getTerm('demo_key_1error')).toBe('not fetched yet: demo_key_1error');
    });

    it('is able to return a notification to a given key', function(){
        initTheControllerWithDefaultLanguage();

        expect(controller.getNotification('demo_notification_1,someOne')
            ).toBe('a_notification someOne');
    });
});