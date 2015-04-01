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
    val cursor: Cursor[UserAddModel] = collection.find(Json.obj("userid" -> userid)).cursor[UserAddModel]

    val futureRolesList: Future[List[UserAddModel]] = cursor.collect[List]()

    val futureRolesJsonArray: Future[JsArray] = futureRolesList.map { roles =>
      Json.arr(roles)
    }

    futureRolesJsonArray.map {
      roles =>
        Ok(roles(0))
    }
  }

  /**
   * Returns every user/role in the db
   *
   * @return a list that contains every role as a JSON object
   */
  def getRoles = Action.async {
    val cursor: Cursor[UserAddModel] = collection.find(Json.obj()).cursor[UserAddModel]

    val futureRolesList: Future[List[UserAddModel]] = cursor.collect[List]()

    val futureRolesJsonArray: Future[JsArray] = futureRolesList.map { roles =>
      Json.arr(roles)
    }

    futureRolesJsonArray.map {
      roles =>
        Ok(roles(0))
    }
  }

  /**
   * Updates the role
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



