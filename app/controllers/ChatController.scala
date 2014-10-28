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
class ChatController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[GroupController])

  def collection: JSONCollection = db.collection[JSONCollection]("chat")

  import models.JsonFormats._
  import models._

  def postChat(newChat : String) = Action.async(parse.json) {
        if(newChat == "true"){
          request =>
            /*
             * request.body is a JsValue.
             * There is an implicit Writes that turns this JsValue as a JsObject,
             * so you can call insert() with this JsValue.
             * (insert() takes a JsObject as parameter, or anything that can be
             * turned into a JsObject using a Writes.)
             */
            println("New chat")
            println(request.body)
            request.body.validate[ChatModel].map {
              chat =>
                // `user` is an instance of the case class `models.User`
                collection.insert(chat).map {
                  lastError =>
                    logger.debug(s"Successfully inserted with LastError: $lastError")
                    Created(s"Chat message created")
                }
            }.getOrElse(
                Future.successful(BadRequest("invalid json"))
            )
        }
    else{
          request =>

            println("Appending chat message")
            println( request.body)
            request.body.validate[ChatModel].map {
              chat =>
                // `chat` is an instance of the case class `models.Chat`

                val modifier = Json.obj(  "$set" -> Json.obj("message" -> chat.message),
                                          "$set" -> Json.obj("sender" -> chat.sender))

                collection.update(Json.obj("uID" -> chat.uID), modifier).map {
                  lastError =>
                    logger.debug(s"Successfully inserted with LastError: $lastError")
                    Created(s"Chat message created")
                }
            }.getOrElse(
                Future.successful(BadRequest("invalid json"))
              )

     }
  }

  /**
   * Returns a chat given by its corresponding group's uID
   *
   * @return a list that contains the chat as a JSON object
   */
  def getChat(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[ChatModel] = collection.
      // find all
      find(Json.obj("uID" -> uID)).
      // perform the query and get a cursor of JsObject
      cursor[ChatModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[ChatModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { chat =>
      Json.arr(chat)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      groups =>
        Ok(groups(0))
    }
  }

  /**
   * Deletes the chat with the given uID
   *
   * @param uID of the chat that should be deleted
   * @return
   */
  def deleteChat(uID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}


