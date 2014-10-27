controllersModule.controller('GroupCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    this.groups = ["initMe"];

    this.currentGroup = {name: this.groupName,
                         member: this.groupMember,
                         createdBy: "dummy",
                         notifications: ["the group has been created by dummy"]};

    this.bufferedGroup = {uID: "toSet"};

    /* functions */
    this.getGroupByUID = function(uID){
        $http.get('/admin/group/'+uID).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available

                that.bufferedGroup = data[0];
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.

                that.bufferedGroup.name = "Error: Connection error";
            });
    };

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
        //FIXME: GET SHA1 up and running
        //var hash = SHA1.hash(currentGroup.name + Math.floor((Math.random() * 100) + 1));
        //console.log("hash: " + hash);

        this.currentGroup.uID = this.currentGroup.name + Math.floor((Math.random() * 1000) + 1);
        this.groups.push(this.currentGroup);

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

    this.deleteGroup = function(id){
        $http.delete('/admin/group/'+id, this.currentGroup).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });

        that.getGroups();
    };

    /* update parameter if needed */
    if($routeParams.uID != undefined){
        that.getGroupByUID($routeParams.uID);
    }

    if(that.groups[0] = "initMe"){
        that.getGroups();
    }
}]);