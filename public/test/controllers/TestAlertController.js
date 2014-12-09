/**
 * Created by Jörg Amelunxen on 07.12.14.
 */

describe('Testsuite for the alert-controller', function () {
    var controller = null, $scope = null, $httpBackend = null;

    beforeEach(function () {
        module('myApp.alerts');
    });

    beforeEach(inject(function ($controller, $rootScope, _$httpBackend_) {
        $httpBackend = _$httpBackend_;
        $scope = $rootScope.$new();
        controller = $controller('AlertCtrl', {
            $scope: $scope
        });
    }));

    it('increases the amount of alerts by one, when the addAlert function is used', function () {
        var lengthOfAlerts = $scope.alerts.length;
        controller.addAlert("an alert","info");
        var lengthOfAlertsAfterAddedAlert = $scope.alerts.length;

        expect(lengthOfAlerts+1).toBe(lengthOfAlertsAfterAddedAlert);
    });

    it('decreases the amount of alerts by one, when the closeAlert function is used', function () {
        controller.addAlert("an alert","info");
        var lengthOfAlerts = $scope.alerts.length;
        controller.closeAlert(0);
        var lengthOfAlertsAfterRemovedAlert = $scope.alerts.length;

        expect(lengthOfAlerts-1).toBe(lengthOfAlertsAfterRemovedAlert);
    });

    it('includes an alert in the alerts array, when the addAlert function is used', function () {
        controller.addAlert("an alert","info");

        expect($scope.alerts[0].msg).toBe("an alert");
        expect($scope.alerts[0].type).toBe("info");
    });
});