package controllers

import javax.inject.Singleton

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.Cursor
import models.ChatModel
import reactivemongo.api._
import reactivemongo.bson._

import scala.concurrent.Future

@Singleton
class MessageController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[GroupController])

  def collection: JSONCollection = db.collection[JSONCollection]("messages")

  import models.JsonFormats._
  import models._

  /**
   * Returns a list of messages given its receiver name
   *
   * @return a list that contains the messages as a JSON object
   */
  def getMessages(recName : String) = Action.async {
    // let's do our query
    val cursor: Cursor[MessageModel] = collection.
      // find all
      find(Json.obj("receiver" -> recName)).
      // perform the query and get a cursor of JsObject
      cursor[MessageModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[MessageModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { messages =>
      Json.arr(messages)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      messages =>
        Ok(messages(0))
    }
  }
}


