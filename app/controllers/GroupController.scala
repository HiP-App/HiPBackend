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
class GroupController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[GroupController])

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
      request.body.validate[GroupModel].map {
        group =>
          collection.insert(group).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Group Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  @deprecated
  /**
   * Adds a notification to a group.
   * The needed information (groupID and notification) is contained in the
   * HTTP-POST.
   *
   * @return
   */
  def addNotification = Action.async(parse.json) {
    request =>
      request.body.validate[NotificationModel].map {
        notification =>
          val modifier    =   Json.obj("$push" -> Json.obj("notifications" -> notification.notification))

          collection.update(Json.obj("uID" -> notification.groupID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Notification has been added")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Method adds the given uID of a group to the list of groups that can read the content of
   * the current group
   *
   * @param uIDOfTheGroupThatShouldBeChanged uID of the group that should be modified
   * @param uIDOfTheGroupThatShouldGetTheReadRight uID of the group that should get read-rights
   * @return
   */
  def addGroupToReadableList(uIDOfTheGroupThatShouldBeChanged: String,
                             uIDOfTheGroupThatShouldGetTheReadRight: String) = Action.async{
      val modifier    =   Json.obj("$push" -> Json.obj("readableBy" -> uIDOfTheGroupThatShouldGetTheReadRight))

      collection.update(Json.obj("uID" -> uIDOfTheGroupThatShouldBeChanged), modifier).map {
        lastError =>
          logger.debug(s"Successfully inserted with LastError: $lastError")
          Created(s"Notification has been added")
      }
  }

  /**
   * Returns a group given by its uID
   *
   * @return a list that contains every group as a JSON object
   */
  def getGroup(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[GroupModel] = collection.find(Json.obj("uID" -> uID)).cursor[GroupModel]

    val futureGroupList: Future[List[GroupModel]] = cursor.collect[List]()

    val futureGroupsJsonArray: Future[JsArray] = futureGroupList.map { groups =>
      Json.arr(groups)
    }

    futureGroupsJsonArray.map {
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
    val cursor: Cursor[GroupModel] = collection.find(Json.obj()).cursor[GroupModel]

    val futureGroupsList: Future[List[GroupModel]] = cursor.collect[List]()

    val futureGroupsJsonArray: Future[JsArray] = futureGroupsList.map { groups =>
      Json.arr(groups)
    }

    futureGroupsJsonArray.map {
      groups =>
        Ok(groups(0))
    }
  }

  /**
   * Modifies/Stores the posted group
   *
   * @return
   */
  def modifyGroup = Action.async(parse.json){
    request =>
      request.body.validate[GroupModel].map {
        grp =>
          val modifier    =   Json.obj( "$set" -> Json.obj("topic" -> grp.topic),
                                        "$set" -> Json.obj("createdBy" -> grp.createdBy),
                                        "$set" -> Json.obj("name" -> grp.name),
                                        "$set" -> Json.obj("member" -> grp.member),
                                        "$set" -> Json.obj("notifications" -> grp.notifications),
                                        "$set" -> Json.obj("readableBy" -> grp.readableBy))

          collection.update(Json.obj("uID" -> grp.uID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Group has been modified")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Deletes the group with the given id
   *
   * @param uID of the group that should be deleted
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


