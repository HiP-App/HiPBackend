package controllers

import play.api.libs.concurrent.Execution.Implicits._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.core.commands.Drop
import reactivemongo.api.collections.default.BSONCollection
import play.modules.reactivemongo.json.BSONFormats._
import reactivemongo.bson.BSONDocument
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import scala.concurrent.Future
import reactivemongo.api.Cursor
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import org.slf4j.{LoggerFactory, Logger}
import javax.inject.Singleton
import play.api.mvc._
import play.api.libs.json._

@Singleton
class Groups extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[Groups])

  /*
   * Get a JSONCollection (a Collection implementation that is designed to work
   * with JsObject, Reads and Writes.)
   * Note that the `collection` is not a `val`, but a `def`. We do _not_ store
   * the collection reference to avoid potential problems in development with
   * Play hot-reloading.
   */
  def collection: JSONCollection = db.collection[JSONCollection]("groups")

  // ------------------------------------------ //
  // Using case classes + Json Writes and Reads //
  // ------------------------------------------ //

  import models._
  import models.JsonFormats._

  def createGroup = Action.async(parse.json) {
    request =>
      /*
       * request.body is a JsValue.
       * There is an implicit Writes that turns this JsValue as a JsObject,
       * so you can call insert() with this JsValue.
       * (insert() takes a JsObject as parameter, or anything that can be
       * turned into a JsObject using a Writes.)
       */
      request.body.validate[Group].map {
        group =>
          // `user` is an instance of the case class `models.User`
          collection.insert(group).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Group Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  def getGroups = Action.async {
    // let's do our query
    val cursor: Cursor[Group] = collection.
      // find all
      find(Json.obj("createdBy" -> "dummy")).
      // perform the query and get a cursor of JsObject
      cursor[Group]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[Group]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { groups =>
      Json.arr(groups)
    }
    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      groups =>
        Ok(groups(0))
    }
  }

  def deleteGroup(id : String) = Action.async {
    collection.remove(Json.obj("uID" -> id)).map {
      lastError =>
        logger.debug(s"Successfully inserted with LastError: $lastError")
        Created(s"Group Created")
    }
  }
}


