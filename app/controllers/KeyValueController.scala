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

  def getKeyValueList(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[KeyValueModel] = collection.
      // find all
      find(Json.obj("uID" -> uID)).
      // perform the query and get a cursor of JsObject
      cursor[KeyValueModel]

    // gather all the JsObjects in a list
    val futureKVList: Future[List[KeyValueModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futureKVJsonArray: Future[JsArray] = futureKVList.map { kv =>
      Json.arr(kv)
    }

    // everything's ok! Let's reply with the array
    futureKVJsonArray.map {
      kv =>
        Ok(kv(0))
    }
  }

  def addKV(uID: String, kv: String) = Action.async {
    val modifier    =   Json.obj("$push" -> Json.obj("list" -> kv))

    collection.update(Json.obj("uID" -> uID), modifier).map {
      lastError =>
        logger.debug(s"Successfully inserted with LastError: $lastError")
        Created(s"Notification has been added")

        Ok("");
    }
  }

  def deleteKV(uID : String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}



