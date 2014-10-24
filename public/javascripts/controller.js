controllersModule.controller('GroupCtrl', ['$scope','$http', function($scope,$http) {
    var that = this;

    this.currentGroup = {name: this.groupName,
                         member: this.groupMember,
                         createdBy: "dummy",
                         notifications: ["the group #name# has been created by an supervisor"]};

    this.getGroups = function(){
        $http.get('/admin/groups').
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                that.groups = data;
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                that.groups = "Error: Connection error";
            });
    };

    this.createGroup = function(){
        that.getGroups();

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
}]);