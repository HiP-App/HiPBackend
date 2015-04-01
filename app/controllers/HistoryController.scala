package controllers

import play.api.libs.concurrent.Execution.Implicits.defaultContext
import org.slf4j.{LoggerFactory, Logger}
import play.api.libs.json.{JsArray, Json}
import play.api.mvc.{Action, Controller}
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.Cursor

import scala.concurrent.Future

/**
 * Created by Jörg Amelunxen on 14.01.15.
 */
class HistoryController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[UserController])

  def collection:     JSONCollection = db.collection[JSONCollection]("history")

  import models.JsonFormats._
  import models._

  /**
   * Action returns the history of a given topic
   *
   * @param topicID the topic ID of the topic that owns this history
   * @return
   */
  def getHistoryForTopic(topicID: String) = Action.async {
    // let's do our query
    val cursor: Cursor[HistoryModel] = collection.find(Json.obj("topicID" -> topicID)).cursor[HistoryModel]

    val futureHistoryList: Future[List[HistoryModel]] = cursor.collect[List]()

    val futureHistoryJsonArray: Future[JsArray] = futureHistoryList.map { users =>
      Json.arr(users)
    }

    futureHistoryJsonArray.map {
      history =>
        Ok(history(0))
    }
  }

  /**
   * Action stores a new history entry
   *
   * @return
   */
  def storeHistoryEntry = Action.async(parse.json) {
    request =>
      request.body.validate[HistoryModel].map {
        history =>
          collection.insert(history).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"History entry created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Action deletes the history of a given topic
   *
   * @param topicID
   * @return
   */
  def deleteHistory(topicID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("topicID" -> topicID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}

