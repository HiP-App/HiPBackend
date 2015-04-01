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
                                        "$set" -> Json.obj("gps" -> topic.gps),
                                        "$set" -> Json.obj("metaStore" -> topic.metaStore),
                                        "$set" -> Json.obj("nextTextBlock" -> topic.nextTextBlock),
                                        "$set" -> Json.obj("topicPicture" -> topic.topicPicture))

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
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj("status" -> status)).cursor[TopicModel]

    val futureTopicList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
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
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj()).cursor[TopicModel]

    val futureTopicsList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicsList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
      topics =>
        Ok(topics(0))
    }
  }

  /**
   * Returns every topic in the db in the app format
   *
   * @return a list that contains every topic as a JSON object in the app format
   */
  def getTopicsInAppFormat = Action.async {
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj()).cursor[TopicModel]

    val futureTopicsList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicsList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
      topics =>

        def createNewFormat(uID: JsValue, name: JsValue, content: JsValue, lat: JsValue, lng: JsValue): JsObject = {
          return Json.obj(
            "id" -> uID,
            "name" -> name,
            "categories" -> new java.util.Date().getTime(),
            "description" -> content,
            "lat" -> lat,
            "lng" -> lng,
            "tags" -> "")
        }

        /* Access the needed attributes */
        val uIDs    = topics(0).\\("uID")
        val names   = topics(0).\\("name")
        val content = topics(0).\\("content")
        val gps     = topics(0).\\("gps")

        var dataArray = new JsArray()

        /* create new Array */
        for( i <- 0 to uIDs.length-1){
          dataArray = dataArray.append(createNewFormat(uIDs(i),names(i),content(i),gps(i)(0),gps(i)(1)))
        }

        /* put this into a new JSObject */
        var returnThis = Json.obj("data" -> dataArray)

        Ok(returnThis)
    }
  }

  /**
   * Action reroutes to the correct controller for finding the topic picture
   * Used as a wrapper for the format that Timo has used in his bachelor thesis
   * @return the topic picture for the given topicID
   */
  def getTopicPicture(uIDPlusPost: String) = Action.async {
    val topicID = uIDPlusPost.substring(0,uIDPlusPost.lastIndexOf('.'))

    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj("uID"
      -> topicID)).cursor[TopicModel]

    val futureTopicsList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicsList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
      topics =>
        val pictureID  = topics(0).\\("topicPicture").toString()
        val firstDoubleQuote = pictureID.indexOf('"') +1
        val lastDoubleQuote = pictureID.lastIndexOf('"')

        val cleanedPictureID = pictureID.substring(firstDoubleQuote, lastDoubleQuote)

        Redirect(routes.FileController.getMediaFile(cleanedPictureID))
    }
  }

  /**
   * Returns a topic given by its uID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getTopic(uID : String) = Action.async {
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj("uID" -> uID)).cursor[TopicModel]

    val futureTopicList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
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
    val cursor: Cursor[TopicModel] = topicCollection.find(Json.obj("createdBy" -> uID)).cursor[TopicModel]

    val futureTopicList: Future[List[TopicModel]] = cursor.collect[List]()

    val futureTopicsJsonArray: Future[JsArray] = futureTopicList.map { topics =>
      Json.arr(topics)
    }

    futureTopicsJsonArray.map {
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
    val cursor: Cursor[FootnoteModel] = footnoteCollection.find(Json.obj("linkedToTopic" -> uID)).cursor[FootnoteModel]

    val futureFootnotesList: Future[List[FootnoteModel]] = cursor.collect[List]()

    val futureFootnotesJsonArray: Future[JsArray] = futureFootnotesList.map { footnotes =>
      Json.arr(footnotes)
    }

    futureFootnotesJsonArray.map {
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
   * @param uID the uId of the footnote that should be removed
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
   * @param uID the uID of the topic that should be removed
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
   *
   * @param topicID topicID of the topic that contains the media files
   * @return
   */
  def getMediaForTopic(topicID: String) = Action.async {
    val cursor: Cursor[MetadataModel] = metaCollection.find(Json.obj("topic" -> topicID)).cursor[MetadataModel]

    val futureMediaList: Future[List[MetadataModel]] = cursor.collect[List]()

    val futureMediaJsonArray: Future[JsArray] = futureMediaList.map { footnotes =>
      Json.arr(footnotes)
    }

    futureMediaJsonArray.map {
      footnotes =>
        Ok(footnotes(0))
    }
  }

  /**
   * This Action changes the store ID of the used KV-Store for the given media file resp. picture
   *
   * @param uID       of the image/media file
   * @param storeID   of the new KVStore
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
