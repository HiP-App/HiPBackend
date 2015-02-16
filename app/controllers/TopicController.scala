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

/**
 * The Users controllers encapsulates the Rest endpoints and the interaction with the MongoDB, via ReactiveMongo
 * play plugin. This provides a non-blocking driver for mongoDB as well as some useful additions for handling JSon.
 * @see https://github.com/ReactiveMongo/Play-ReactiveMongo
 */
@Singleton
class TopicController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[TopicController])

  def topicCollection: JSONCollection = db.collection[JSONCollection]("topics")

  def footnoteCollection: JSONCollection = db.collection[JSONCollection]("footnotes")

  def metaCollection: JSONCollection = db.collection[JSONCollection]("media.meta")

  import models.JsonFormats._
  import models._

  /**
   * This Action creates a new topic
   *
   * @return
   */
  def createTopic = Action.async(parse.json) {
    request =>
      request.body.validate[TopicModel].map {
        topic =>
          // `user` is an instance of the case class `models.User`
          topicCollection.insert(topic).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Topic Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * This Action updates a topic with the parsed data in the HTTP body
   *
   * @return
   */
  def updateTopic = Action.async(parse.json) {
    request =>
      request.body.validate[TopicModel].map {
        topic =>
          val modifier    =   Json.obj( "$set" -> Json.obj("group" -> topic.group),
                                        "$set" -> Json.obj("name" -> topic.name),
                                        "$set" -> Json.obj("createdBy" -> topic.createdBy),
                                        "$set" -> Json.obj("content" -> topic.content),
                                        "$set" -> Json.obj("status" -> topic.status),
                                        "$set" -> Json.obj("constraints" -> topic.constraints),
                                        "$set" -> Json.obj("tagStore" -> topic.tagStore),
                                        "$set" -> Json.obj("linkedTopics" -> topic.linkedTopics),
                                        "$set" -> Json.obj("maxCharThreshold" -> topic.maxCharThreshold),
                                        "$set" -> Json.obj("gps" -> topic.gps))

          topicCollection.update(Json.obj("uID" -> topic.uID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Topic has been updated")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Returns topics, which have the given status
   * @param status
   * @return
   */
  def getTopicByStatus(status : String) = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = topicCollection.
      // find all
      find(Json.obj("status" -> status)).
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
   * Returns every topic in the db
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopics = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj()).cursor[TopicModel]

    // gather all the JsObjects in a list
    val futureTopicsList: Future[List[TopicModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicsList.map { topics =>
      Json.arr(topics)
    }
    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      topics =>
        Ok(topics(0))
    }
  }

  /**
   * Returns a topic given by its uID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopic(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = topicCollection.
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
   * Returns a topic given by its creators' uID. Can also be used to returns the subtopic
   * given by its parents' uID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopicByUser(uID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[TopicModel] = topicCollection.
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

  /**
   * This Action returns the footnotes of a given topic
   *
   * @param uID
   * @return
   */
  def getFootnotesByTopic(uID: String) = Action.async {
    // let's do our query
    val cursor: Cursor[FootnoteModel] = footnoteCollection.
      // find all
      find(Json.obj("linkedToTopic" -> uID)).
      // perform the query and get a cursor of JsObject
      cursor[FootnoteModel]

    // gather all the JsObjects in a list
    val futureTopicList: Future[List[FootnoteModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicList.map { footnotes =>
      Json.arr(footnotes)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      footnotes =>
        Ok(footnotes(0))
    }
  }

  /**
   * This Action stores a new footnote in the database
   *
   * @return
   */
  def storeFootnote = Action.async(parse.json) {
    request =>
      request.body.validate[FootnoteModel].map {
        footnote =>
          footnoteCollection.insert(footnote).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Footnote Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * This Action deletes a given footnote from the database
   *
   * @param uID
   * @return
   */
  def deleteFootnote(uID: String) = Action.async {
    /* delete main topic from DB */
    footnoteCollection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }

  /**
   * This Action deletes a given topic from the database
   *
   * @param uID
   * @return
   */
  def deleteTopic(uID: String) = Action.async {
    /* delete main topic from DB */
    topicCollection.remove(Json.obj("uID" -> uID)).map {
      lastError =>
        Created(s"Item removed")
    }
  }

  /**
   * This Action returns the media files for a given topic
   * @param topicID
   * @return
   */
  def getMediaForTopic(topicID: String) = Action.async {
    // let's do our query
    val cursor: Cursor[MetadataModel] = metaCollection.
      // find all
      find(Json.obj("topic" -> topicID)).
      // perform the query and get a cursor of JsObject
      cursor[MetadataModel]

    // gather all the JsObjects in a list
    val futureTopicList: Future[List[MetadataModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicList.map { footnotes =>
      Json.arr(footnotes)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      footnotes =>
        Ok(footnotes(0))
    }
  }

  /**
   * This Action changes the store ID of the used KV-Store
   *
   * @param uID       of the image/media file
   * @param storeID
   * @return
   */
  def updateKVStore(uID: String, storeID: String) = Action.async {
    val modifier    =   Json.obj("$set" -> Json.obj("kvStore" -> storeID))

    metaCollection.update(Json.obj("uID" -> uID), modifier).map {
      lastError =>
        logger.debug(s"Successfully inserted with LastError: $lastError")
        Created(s"StoreID has been changed")

        Ok("");
    }
  }
}
