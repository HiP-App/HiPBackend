package controllers

/**
 * Created by Jörg Amelunxen on 20.11.14.
 */

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
class RoleController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[RoleController])

  def collection: JSONCollection = db.collection[JSONCollection]("usersAdd")

  import models.JsonFormats._
  import models._

  /**
   * Returns a user/role in the db given by its userid
   *
   * @return a list that contains every role as a JSON object
   */
  def getRole(userid: String) = Action.async {
    // let's do our query
    val cursor: Cursor[UserAddModel] = collection.
      // find all
      find(Json.obj("userid" -> userid)).
      // perform the query and get a cursor of JsObject
      cursor[UserAddModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[UserAddModel]] = cursor.collect[List]()

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
   * Returns every user/role in the db
   *
   * @return a list that contains every role as a JSON object
   */
  def getRoles = Action.async {
    // let's do our query
    val cursor: Cursor[UserAddModel] = collection.
      // find all
      find(Json.obj()).
      // perform the query and get a cursor of JsObject
      cursor[UserAddModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[UserAddModel]] = cursor.collect[List]()

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
   * Updated the role
   *
   * @return
   */
  def updateRole = Action.async(parse.json) {
    request =>
      request.body.validate[UserAddModel].map {
        userAdd =>
          val modifier    =   Json.obj( "$set" -> Json.obj("role" -> userAdd.role),
                                        "$set" -> Json.obj("master" -> userAdd.master),
                                        "$set" -> Json.obj("admin" -> userAdd.admin))

          // update entry
          collection.update(Json.obj("userid" -> userAdd.userid),modifier,upsert = true).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Role updated")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }
}



