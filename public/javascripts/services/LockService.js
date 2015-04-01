/**
 * Created by Jörg Amelunxen on 30.03.15.
 */
servicesModule.service('LockService', ['$http', '$timeout', function($http, $timeout) {
    var that = this;

    this.mytimeStamp = "-1";
    this.currentLock = "-1";

    /**
     * Creates a new lock object with the given information
     *
     * @param topicUID      the uID of the topic that owns the lock
     * @param lastChange    optional: UNIX timestamp of the last change
     * @returns {{topicUID: *, lastChange: *}}
     */
    function createLockObject(topicUID, lastChange){
        if(lastChange == undefined){
            lastChange = new Date().getTime()+"";
        }

        return {
           topicUID: topicUID,
           lastChange: lastChange
        }
    }

    /**
     * Returns a timestamp that corresponds to the current timestamp minus the given
     * amount of minutes
     * @param minutes
     * @returns {number}
     */
    function timestampMinusMinutes(minutes){
        return new Date().getTime()-(minutes * 60 * 1000);
    }

    /**
     * This function creates a new lock and posts it to the db
     * @param topicUID      the uID of the topic that owns this lock
     * @param lastChange    optional: UNIX timestamp of the last change
     */
    this.createLock = function(topicUID, lastChange){
        var lock = createLockObject(topicUID, lastChange);

        $http.post('/admin/lock', lock).success(function(){
            that.currentLock = lock;
            that.mytimeStamp = lock.lastChange;
        }).error(function(){
            console.log("Error while creating the lock")
        })
    };

    /**
     * Fetches the lock for the topic with the given topicUID
     * @param topicUID  the uID of the topic that owns this lock
     * @param callback  the callback function contains the lock as the first parameter. Furthermore
     *                  the lock gets stored in this.currentLock
     */
    this.getLock = function(topicUID, callback){
        if(topicUID == undefined){
            return;
        }

        $http.get('/admin/lock/'+topicUID).success(function(lock){
            if(lock[0] == undefined){
                /* no lock has been found */
                that.createLock(topicUID);
            }

            if(callback != undefined){
                callback(lock[0]);
            }

            that.currentLock = lock[0];
        }).error(function(){
            console.log("Error while downloading lock "+topicUID);
        })
    };

    /**
     * This function updates a lock and posts it to the db
     * @param topicUID      the uID of the topic that owns this lock
     * @param lastChange    optional: UNIX timestamp of the last change
     */
    this.updateLock = function(topicUID, lastChange){
        var lock = createLockObject(topicUID, lastChange);

        $http.put('/admin/lock', lock).success(function(){
            that.currentLock = lock;
        }).error(function(){
            console.log("Error while updating the lock")
        })
    };

    /**
     * Deletes the lock for the given topic
     * @param topicUID      the uID of the topic that owns this lock
     */
    this.deleteLock = function(topicUID){
        $http.delete('/admin/lock/'+topicUID).success(function(){
            if(that.currentLock != undefined && that.currentLock.topicUID == topicUID){
                that.currentLock = "-1";
            }
        }).error(function(){
            console.log("Error while deleting lock "+topicUID);
        })
    };

    /**
     * Function returns true, if the current lock is owned by the user or if the lock was free
     * @param topicUID      the uID of the topic that owns this lock
     * @returns {boolean}
     */
    this.doIOwnLock = function(topicUID){
        /* abort condition 1 - undefined parameter */
        if(topicUID == undefined){
            console.log("Warning: undefined parameter in function doIOwnLock");
            return false;
        }

        /* abort condition 2 - we are to fast -> lock is not fetched yet */
        if(that.currentLock == "-1"){
            return false;
        }

        var lastChangeDoneByThisUser = (that.currentLock.lastChange == that.mytimeStamp
                                            && that.mytimeStamp > timestampMinusMinutes(5));
        if(lastChangeDoneByThisUser){
            return true;
        }else{
            //currentLock <- db.locks.lock(topicUID)
            that.getLock(topicUID);

            //topicIsLocked <- (currentLock.lastChange <= 5min ago)
            var topicIsLocked = (that.currentLock.lastChange >= timestampMinusMinutes(5));

            if(topicIsLocked){
                // we cannot modify the topic
                // update lock again in 5 minutes

                $timeout(function(){
                    that.doIOwnLock(topicUID);
                }, 1000 * 60 * 5);

                return false;
            }else{
                //newTimestamp <- Date.currentTime
                var newTimestamp = new Date().getTime()+"";

                //db.locks.lock(newTimestamp)
                that.updateLock(topicUID, newTimestamp);

                //internalLock.lastChange = newTimestamp
                that.mytimeStamp = newTimestamp;
                that.currentLock = createLockObject(topicUID, newTimestamp);

                return true;
            }
        }
    };

}]);