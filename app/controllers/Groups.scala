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
class Groups extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[Groups])

  def collection: JSONCollection = db.collection[JSONCollection]("groups")

  import models.JsonFormats._
  import models._

  /**
   * Creates a group from the given JSON data within the request.body
   *
   * @return
   */
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

  /**
   * Returns a group given by its uID
   *
   * @return a list that contains every group as a JSON object
   */
  def getGroup(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[Group] = collection.
      // find all
      find(Json.obj("uID" -> uID)).
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

  /**
   * Returns every group in the db
   *
   * @return a list that contains every group as a JSON object
   */
  def getGroups = Action.async {
    // let's do our query
    val cursor: Cursor[Group] = collection.
      // find all
      find(Json.obj()).
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

  /**
   * Deletes the group with the given id
   *
   * @param id of the group that should be deleted
   * @return
   */
  def deleteGroup(uID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}


