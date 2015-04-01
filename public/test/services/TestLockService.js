/**
 * Created by Jörg Amelunxen on 30.03.15.
 */
describe('Testsuite for the LockService:', function () {
    var $httpBackend    = null, service = null;

    var lock1  = "";

    beforeEach(function () {
        module('myApp.services');
    });

    beforeEach(inject(function (LockService ,_$httpBackend_) {
        $httpBackend    =   _$httpBackend_;
        service         =   LockService;

        lock1 = {
            topicUID: "1",
            lastChange: new Date().getTime()+""
        };
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('is able to create a new lock', function () {
        service.createLock('1','42');

        var lock = {
            topicUID: '1',
            lastChange: '42'
        };

        $httpBackend.expect("POST","/admin/lock",lock).respond(200);
        $httpBackend.flush();
    });

    it('is able to fetch a lock given its topicUID', function () {
        var check = function(lock){
            expect(lock.lastChange).toBe(lock1.lastChange);
        };
        service.getLock('1', check);

        $httpBackend.expect("GET","/admin/lock/1").respond(200, [lock1]);
        $httpBackend.flush();
    });

    it('is able to update a lock', function () {
        service.updateLock('1','42');

        var lock = {
            topicUID: '1',
            lastChange: '42'
        };

        $httpBackend.expect("PUT","/admin/lock",lock).respond(200);
        $httpBackend.flush();
    });

    it('is able to delete a lock', function () {
        service.deleteLock('1');

        $httpBackend.expect("DELETE","/admin/lock/1").respond(200);
        $httpBackend.flush();
    });

    it('is able to return information if the user owns a lock - if the lock is undefined (not yet fetched)', function () {
        /* prepare lock */
        service.currentLock = "-1";

        /* test */
        var ownership = service.doIOwnLock('1');

        /* result */
        expect(ownership).toBe(false);
    });

    it('is able to return information if the user owns a lock - if the lock is owned', function () {
        /* prepare lock */
        service.mytimeStamp = lock1.lastChange;
        service.currentLock = lock1;

        /* test */
        var ownership = service.doIOwnLock('1');

        /* result */
        expect(ownership).toBe(true);
    });

    it('is able to return information if the user owns a lock - if the lock is owned by somebody else', function () {
        /* prepare lock */
        service.mytimeStamp = Number(lock1.lastChange) - 1000;
        service.currentLock = lock1;

        /* test */
        var ownership = service.doIOwnLock('1');

        $httpBackend.expect("GET","/admin/lock/1").respond(200, [lock1]);
        $httpBackend.flush();

        /* result */
        expect(ownership).toBe(false);
    });

//    it('is able to return information if the user owns a lock - if the lock is owned by somebody else and ' +
//        'we did not do any changes', function () {
//        /* prepare lock */
//        service.mytimeStamp = "-1";
//        service.currentLock = lock1;
//
//        /* test */
//        var ownership = service.doIOwnLock('1');
//
//        $httpBackend.expect("GET","/admin/lock/1").respond(200, [lock1]);
//        $httpBackend.flush();
//
//        /* result */
//        expect(ownership).toBe(false);
//    });

});
