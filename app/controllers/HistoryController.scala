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

  def getHistoryForTopic(topicID: String) = Action.async {
    // let's do our query
    val cursor: Cursor[HistoryModel] = collection.find(Json.obj("topicID" -> topicID)).cursor[HistoryModel]

    // gather all the JsObjects in a list
    val futureHistoryList: Future[List[HistoryModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futureHistoryJsonArray: Future[JsArray] = futureHistoryList.map { users =>
      Json.arr(users)
    }

    // everything's ok! Let's reply with the array
    futureHistoryJsonArray.map {
      history =>
        Ok(history(0))
    }
  }

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

}

