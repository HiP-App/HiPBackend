/**
 * Created by Jörg Amelunxen on 07.12.14.
 */

controllersModule.controller('AnnotationCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    var that = this;

    /**
     * This function enables the annotation functionality on the given DOM element
     *
     * @param id - The DOM element that should be used to start the annotation with
     */
    this.startAnnotation = function(id){
        $(id).annotator('addPlugin', 'Store', {
            urls: {
                // These are the default URLs.
                create:  '/annotations',
                update:  '/annotations/:id',
                destroy: '/annotations/:id',
                search:  '/search'
            }
        });
    };
}]);