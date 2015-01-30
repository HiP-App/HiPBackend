/**
 * Created by Jörg Amelunxen on 30.11.14.
 */

controllersModule.directive('cancelSubmit', function() {
    return {
        scope: {
            cancel: '=cancel',
            submit: '=submit',
            ac: '=alertcontroller',
            lc: '=languagecontroller',
            alertmsg: '@alertmsg'
        },
        restrict: 'E',
        templateUrl: '/assets/directives/cancelSubmit.html',
        link: function(scope){
            scope.addAlert = function(msg, type){
                if(scope.ac != undefined){
                    if(scope.lc != undefined){
                        scope.ac.addAlert(scope.lc.getTerm(msg), type)
                    }else{
                        console.log("Warning: CancelSubmit directive without Language-Controller")
                    }
                }else{
                    console.log("Warning: CancelSubmit directive without Alert-Controller")
                }
            }
        }
    };
});