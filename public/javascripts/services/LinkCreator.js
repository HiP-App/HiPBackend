/**
 * Created by Jörg Amelunxen on 31.01.15.
 */

servicesModule.service('LinkCreator', ['$http', 'commonTaskService', function($http, commonTaskService) {
    var that = this;

    this.config = {
        url_base : "/#/edit/"
    };

    /**
     * Creates the link to a given topic
     * @param uID           the uID of the topic
     * @returns {string}    the URL
     */
    this.getLinkForTopic = function(uID){
        return that.config.url_base + uID;
    };

}]);
