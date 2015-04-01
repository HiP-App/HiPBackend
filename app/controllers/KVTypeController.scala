package controllers

/**
 * Created by Jörg Amelunxen on 08.02.15.
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
class KVTypeController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[KVTypeController])

  def collection: JSONCollection = db.collection[JSONCollection]("kvTypes")

  import models.JsonFormats._
  import models._

  /**
   * Returns a type in the db given by its uID
   *
   * @return a list that contains the type as a JSON object
   */
  def getType(uID: String) = Action.async {
    // let's do our query
    val cursor: Cursor[KVTypeModel] = collection.find(Json.obj("uID" -> uID)).cursor[KVTypeModel]

    val futureTypeList: Future[List[KVTypeModel]] = cursor.collect[List]()

    val futureTypeJsonArray: Future[JsArray] = futureTypeList.map { types =>
      Json.arr(types)
    }

    futureTypeJsonArray.map {
      types =>
        Ok(types(0))
    }
  }

  /**
   * Returns a type in the db given by its name
   *
   * @return a list that contains the type as a JSON object
   */
  def getTypeWithName(name: String) = Action.async {
    // let's do our query
    val cursor: Cursor[KVTypeModel] = collection.find(Json.obj("name" -> name)).cursor[KVTypeModel]

    val futureTypeList: Future[List[KVTypeModel]] = cursor.collect[List]()

    val futureTypeJsonArray: Future[JsArray] = futureTypeList.map { types =>
      Json.arr(types)
    }

    futureTypeJsonArray.map {
      types =>
        Ok(types(0))
    }
  }

  /**
   * Returns every type in the db
   *
   * @return a list that contains the types as a JSON object
   */
  def getTypes = Action.async {
    // let's do our query
    val cursor: Cursor[KVTypeModel] = collection.find(Json.obj()).cursor[KVTypeModel]

    val futureTypeList: Future[List[KVTypeModel]] = cursor.collect[List]()

    val futureTypesJsonArray: Future[JsArray] = futureTypeList.map { types =>
      Json.arr(types)
    }

    futureTypesJsonArray.map {
      types =>
        Ok(types(0))
    }
  }

  /**
   * Updates the type
   *
   * @return
   */
  def updateType = Action.async(parse.json) {
    request =>
      request.body.validate[KVTypeModel].map {
        kvType =>

          val modifier    =   Json.obj( "$set" -> Json.obj("name" -> kvType.name),
                                        "$set" -> Json.obj("extendsType" -> kvType.extendsType),
                                        "$set" -> Json.obj("keys" -> kvType.keys),
                                        "$set" -> Json.obj("values" -> kvType.values))

          // update entry
          collection.update(Json.obj("uID" -> kvType.uID),modifier,upsert = true).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Type updated")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Creates a type from the given JSON data within the request.body
   *
   * @return
   */
  def createType = Action.async(parse.json) {
    request =>
      request.body.validate[KVTypeModel].map {
        currentType =>
          // `user` is an instance of the case class `models.User`
          collection.insert(currentType).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Type Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }
}



