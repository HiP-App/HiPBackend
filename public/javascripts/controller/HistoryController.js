/**
 * Created by Jörg Amelunxen on 15.01.15.
 *
 * @class angular_module.controllersModule.HistoryController
 *
 * This controller stores a couple of variables that are needed within the TopicHistory directive.
 */
controllersModule.controller('HistoryCtrl', [function() {
    var that = this;

    this.from   = undefined;
    this.to     = undefined;
    this.user   = "";
}]);