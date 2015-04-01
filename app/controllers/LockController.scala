package controllers

import javax.inject.Singleton

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.Cursor

import scala.concurrent.Future

@Singleton
class LockController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[TopicController])

  def lockCollection: JSONCollection = db.collection[JSONCollection]("locks")

  import models.JsonFormats._
  import models._

  /**
   * This Action creates a new lock
   *
   * @return
   */
  def createLock = Action.async(parse.json) {
    request =>
      request.body.validate[LockModel].map {
        locks =>
          lockCollection.insert(locks).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Lock Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * This Action updates a lock with the parsed data in the HTTP body
   *
   * @return
   */
  def updateLock() = Action.async(parse.json) {
    request =>
      request.body.validate[LockModel].map {
        locks =>
          val modifier    =   Json.obj( "$set" -> Json.obj("topicUID"   -> locks.topicUID),
                                        "$set" -> Json.obj("lastChange" -> locks.lastChange))

          lockCollection.update(Json.obj("topicUID" -> locks.topicUID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Lock has been updated")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Returns a lock given by its topicUID
   *
   * @return a list that contains the lock at the first position as a JSON object
   */
  def getLock(topicUID : String) = Action.async {
    val cursor: Cursor[LockModel] = lockCollection.find(Json.obj("topicUID" -> topicUID)).cursor[LockModel]

    val futureLocksList: Future[List[LockModel]] = cursor.collect[List]()

    val futureLocksJsonArray: Future[JsArray] = futureLocksList.map { locks =>
      Json.arr(locks)
    }

    futureLocksJsonArray.map {
      locks =>
        Ok(locks(0))
    }
  }

  /**
   * This Action deletes a given lock from the database
   *
   * @param topicUID  The uID of the topic that owns the lock
   * @return
   */
  def deleteLock(topicUID: String) = Action.async {
    /* delete lock from DB */
    lockCollection.remove(Json.obj("topicUID" -> topicUID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}
