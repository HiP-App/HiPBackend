controllersModule.controller('GroupCtrl', ['$scope','$http', function($scope,$http) {

    this.groups = [{
        name:"123",name:"345"
    }];

    this.currentGroup = {name: this.groupName,
                         member: this.groupMember,
                         createdBy: "dummy",
                         notifications: ["the group #name# has been created by an supervisor"]};

    this.createGroup = function(){
        $http.post('/admin/group', this.currentGroup).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
    };

    this.getGroups = function(){
        $http.get('/admin/groups').
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                this.groups = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                this.groups = "Error: Connection error";
            });
    };
}]);