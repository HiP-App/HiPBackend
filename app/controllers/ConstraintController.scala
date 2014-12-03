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
 * 3.12
 */
@Singleton
class ConstraintController extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[ConstraintController])

  /*
   * Get a JSONCollection (a Collection implementation that is designed to work
   * with JsObject, Reads and Writes.)
   * Note that the `collection` is not a `val`, but a `def`. We do _not_ store
   * the collection reference to avoid potential problems in development with
   * Play hot-reloading.
   */
  def collection: JSONCollection = db.collection[JSONCollection]("constraints")

  // ------------------------------------------ //
  // Using case classes + Json Writes and Reads //
  // ------------------------------------------ //

  import models.JsonFormats._
  import models._

  def createConstraint = Action.async(parse.json) {
    request =>
      println("inserting constraint ")

      request.body.validate[ConstraintModel].map {
        constraint =>
          println("inserting constraint " + constraint.name)
          collection.insert(constraint).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Constraint Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Returns constraints given its topicID
   *
   * @return a list that contains every topic as a JSON object
   */
  def getConstraints(topicID : String) = Action.async {
    // let's do our query
    val cursor: Cursor[ConstraintModel] = collection.
      // find all
      find(Json.obj("topic" -> topicID)).
      // perform the query and get a cursor of JsObject
      cursor[ConstraintModel]

    // gather all the JsObjects in a list
    val futureTopicList: Future[List[ConstraintModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureTopicList.map { constraints =>
      Json.arr(constraints)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      constraints =>
        Ok(constraints(0))
    }
  }
}

