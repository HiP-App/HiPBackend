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
class TopicController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[TopicController])

  /*
   * Get a JSONCollection (a Collection implementation that is designed to work
   * with JsObject, Reads and Writes.)
   * Note that the `collection` is not a `val`, but a `def`. We do _not_ store
   * the collection reference to avoid potential problems in development with
   * Play hot-reloading.
   */
  def collection: JSONCollection = db.collection[JSONCollection]("topics")

  // ------------------------------------------ //
  // Using case classes + Json Writes and Reads //
  // ------------------------------------------ //

  import models.JsonFormats._
  import models._

  def createTopic = Action.async(parse.json) {
    request =>
      /*
       * request.body is a JsValue.
       * There is an implicit Writes that turns this JsValue as a JsObject,
       * so you can call insert() with this JsValue.
       * (insert() takes a JsObject as parameter, or anything that can be
       * turned into a JsObject using a Writes.)
       */
      request.body.validate[TopicModel].map {
        topic =>
          // `user` is an instance of the case class `models.User`
          collection.insert(topic).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Topic Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Returns a topic given by its uID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopic(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = collection.
      // find all
      find(Json.obj("uID" -> uID)).
      // perform the query and get a cursor of JsObject
      cursor[TopicModel]

    // gather all the JsObjects in a list
    val futureTopicList: Future[List[TopicModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicList.map { topics =>
      Json.arr(topics)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      topics =>
        Ok(topics(0))
    }
  }

  /**
   * Returns a topic given by its creators' uID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopicByUser(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = collection.
      // find all
      find(Json.obj("createdBy" -> uID)).
      // perform the query and get a cursor of JsObject
      cursor[TopicModel]

    // gather all the JsObjects in a list
    val futureTopicList: Future[List[TopicModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicList.map { topics =>
      Json.arr(topics)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      topics =>
        Ok(topics(0))
    }
  }

  def deleteTopic(uID: String) = Action.async {
    /* delete every sub-topic */
    collection.remove(Json.obj("createdBy" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }

    /* delete main topic from DB */
    collection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}
