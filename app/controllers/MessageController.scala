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
   * Sends a message with the given JSON data within the request.body
   *
   * @return
   */
  def sendMessage = Action.async(parse.json) {
    request =>
      request.body.validate[MessageModel].map {
        message =>
          collection.insert(message).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Message send")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Returns a list of messages given its receiver name
   *
   * @return a list that contains the messages as a JSON object
   */
  def getMessages(recName : String) = Action.async {
    val cursor: Cursor[MessageModel] = collection.find(Json.obj("receiver" -> recName)).cursor[MessageModel]

    val futureMessageList: Future[List[MessageModel]] = cursor.collect[List]()

    val futureMessageJsonArray: Future[JsArray] = futureMessageList.map { messages =>
      Json.arr(messages)
    }

    futureMessageJsonArray.map {
      messages =>
        Ok(messages(0))
    }
  }

  /**
   * Returns a list of messages given its sender's name
   *
   * @return a list that contains the messages as a JSON object
   */
  def getMessagesBySender(sendName : String) = Action.async {
    val cursor: Cursor[MessageModel] = collection.find(Json.obj("sender" -> sendName)).cursor[MessageModel]

    val futureMessageList: Future[List[MessageModel]] = cursor.collect[List]()

    val futureMessageJsonArray: Future[JsArray] = futureMessageList.map { messages =>
      Json.arr(messages)
    }

    futureMessageJsonArray.map {
      messages =>
        Ok(messages(0))
    }
  }

  /**
   * Deletes the message with the given uID
   *
   * @param uID of the message that should be deleted
   * @return
   */
  def deleteMessage(uID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }

  /**
   * Returns a concrete messages given its id
   *
   * @return a list that contains the messages as a JSON object
   */
  def getDetails(recID : String) = Action.async {
    val cursor: Cursor[MessageModel] = collection.find(Json.obj("uID" -> recID)).cursor[MessageModel]

    val futureMessageList: Future[List[MessageModel]] = cursor.collect[List]()

    val futureMessageJsonArray: Future[JsArray] = futureMessageList.map { messages =>
      Json.arr(messages)
    }

    futureMessageJsonArray.map {
      messages =>
        Ok(messages(0))
    }
  }
}


