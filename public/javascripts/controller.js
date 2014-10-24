controllersModule.controller('CreateGroupCtrl', function(){

    this.currentGroup = {name: this.groupName,
                         member: this.groupMember,
                         notifications: ["the group #name# has been created by an supervisor"]};

    this.createGroup = function(){
        alert("HelloWorld");
    };

});