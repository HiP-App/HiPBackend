package controllers

import javax.inject.Singleton

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.BSONFormats._
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.Cursor
import reactivemongo.bson.BSONDocument

import scala.concurrent.Future

/**
 * The Users controllers encapsulates the Rest endpoints and the interaction with the MongoDB, via ReactiveMongo
 * play plugin. This provides a non-blocking driver for mongoDB as well as some useful additions for handling JSon.
 * @see https://github.com/ReactiveMongo/Play-ReactiveMongo
 */
@Singleton
class UserController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[UserController])

  def collection:     JSONCollection = db.collection[JSONCollection]("users")
  def collectionAdd:  JSONCollection = db.collection[JSONCollection]("usersAdd")

  import models.JsonFormats._
  import models._

  /**
   * This method returns the User objects as an array of JSON objects that match the given email
   * address
   *
   * @param email: The email address of the searched users
   * @return
   */
  def getUserByEmail(email: String) = Action.async {
    // let's do our query
    val cursor: Cursor[UserModel] = collection.find(Json.obj("userid" -> email)).cursor[UserModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[UserModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { users =>
      Json.arr(users)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      users =>
        Ok(users(0))
    }
  }

  /**
   * Returns all Users that are registered in the system as an array of JSON objects
   * @return
   */
  def getAllUsers = Action.async {
    val cursor: Cursor[UserModel] = collection.find(Json.obj()).cursor[UserModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[UserModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { users =>
      Json.arr(users)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      users =>
        Ok(users(0))
    }
  }

  /**
   * This Action changes the store ID of the used KV-Store
   *
   * @param uID       of the user in the system
   * @param storeID   the new ID of the kvStore
   * @return
   */
  def updateKVStore(uID: String, storeID: String) = Action.async {
    val modifier    =   Json.obj("$set" -> Json.obj("templates" -> storeID))

    collectionAdd.update(Json.obj("userid" -> uID), modifier).map {
      lastError =>
        logger.debug(s"Successfully inserted with LastError: $lastError")
        Created(s"StoreID has been changed")

        Ok("");
    }
  }

  /**
   * This action updates the given user meta data
   *
   * @return
   */
  def updateUser = Action.async(parse.json){
    request =>
      request.body.validate[UserAddModel].map {
        user =>
          val modifier    =   Json.obj( "$set" -> Json.obj("userid" -> user.userid),
            "$set" -> Json.obj("email" -> user.email),
            "$set" -> Json.obj("role" -> user.role),
            "$set" -> Json.obj("templates" -> user.templates),
            "$set" -> Json.obj("admin" -> user.admin),
            "$set" -> Json.obj("master" -> user.master))

          collection.update(Json.obj("userid" -> user.userid), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"User has been added")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

}
