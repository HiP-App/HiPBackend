/**
 * Created by joerg on 29.10.2014.
 */

controllersModule.controller('LangCtrl', ['$scope','$http', '$routeParams', function($scope,$http,$routeParams) {
    this.debug = false;
    var errorString = "not fetched yet: ";

    var that = this;

    this.language = {
        init:false
    }

    this.defaultLanguage = "de";

    this.errorObject = {
        content:"Connection Error",
        sender:"System"
    };

    /**
     * This function returns the corresponding string the in active language
     *
     * @param key
     * @returns the needed string
     */
    this.getTerm = function(key){
        var found = (that.language[key] != undefined);

        if(found)
            return that.language[key];
        else
            return errorString + key;
    }

    /**
     * This function creates a correct notification from notification data
     *
     * @param data - of the structure: [system_call, optional data like username, etc.]
     * @returns {*} - The correct notification
     */
    this.getNotification = function (data) {
        var res = data.split(",");

        var notiMessage = that.getTerm(res[0]);

        return notiMessage + " " + res[1];
    }

    /**
     * Sends a new term to the server
     */
    this.createTerm = function(){
        $http.post('/admin/languages', that.currentTerm).
            success(function(data, status, headers, config) {
            }).
            error(function(data, status, headers, config) {
            });
    };

    /**
     * This function loads the complete dictionary from the server
     *
     * @param lang: the needed language, e.g., 'eng' or 'de'
     */
    this.getLanguage = function (lang){
        if(this.debug)
            console.log("info LangCtrl: Fetching language")

        $http.get('/admin/languages/'+lang).
            success(function(data, status, headers, config) {
                if(that.debug){
                    console.log("info LangCtrl: getting response data")
                }

                /* transform data into a single JSON doc */
                for(entry in data){
                    that.language[data[entry].key] = data[entry].value
                }

                // prevent init again
                that.language.init  =   true;

                if(that.debug){
                    console.log("info LangCtrl: Language is now " + lang)
                    console.log(that.language)
                }
            }).
            error(function(data, status, headers, config) {
                if(that.debug){
                    console.log("error LangCtrl: Could not fetch the data >> Server response " + status)
                }

                that.language = that.errorObject;
            });
    }

    if(this.language.init == false){
        // init language
        if(this.debug)
            console.log("info: Language gets initialised:" + this.defaultLanguage)

        this.getLanguage(this.defaultLanguage);
    }
}]);