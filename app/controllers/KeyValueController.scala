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
class KeyValueController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[KeyValueController])

  def collection: JSONCollection = db.collection[JSONCollection]("kvStore")

  import models.JsonFormats._
  import models._

  /**
   * Action creates a new key value list/model that is contained in the request body
   * @return
   */
  def createKeyValueList = Action.async(parse.json) {
    request =>
      request.body.validate[KeyValueModel].map {
        kv =>
          collection.insert(kv).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"KV Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Action returns the Key Value list/Store with the given uID
   * @param uID   the uID of the store that should be returned
   * @return
   */
  def getKeyValueList(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[KeyValueModel] = collection.find(Json.obj("uID" -> uID)).cursor[KeyValueModel]

    val futureKVList: Future[List[KeyValueModel]] = cursor.collect[List]()

    val futureKVJsonArray: Future[JsArray] = futureKVList.map { kv =>
      Json.arr(kv)
    }

    futureKVJsonArray.map {
      kv =>
        Ok(kv(0))
    }
  }

  /**
   * Action adds a new key/value pair to the given store
   * @param uID   uID of the store that should contain the new entry
   * @param kv    the key/value entry in the format "key#value"
   * @return
   */
  def addKV(uID: String, kv: String) = Action.async {
    val modifier    =   Json.obj("$push" -> Json.obj("list" -> kv))

    collection.update(Json.obj("uID" -> uID), modifier).map {
      lastError =>
        logger.debug(s"Successfully inserted with LastError: $lastError")
        Created(s"Notification has been added")

        Ok("");
    }
  }

  /**
   * Updates a given KVStore. The new store needs to be included in the request body
   * @return
   */
  def modifyKVStore = Action.async(parse.json){
    request =>
      request.body.validate[KeyValueModel].map {
        store =>
          val modifier    =   Json.obj( "$set" -> Json.obj("list" -> store.list))

          println("setting " + store.list + " on UID " + store.uID)

          collection.update(Json.obj("uID" -> store.uID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"KV store has been changed")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Action deletes a given KVStore
   *
   * @param uID uID of the store that should be deleted
   * @return
   */
  def deleteKV(uID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}



