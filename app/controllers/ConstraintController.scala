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

  def collection: JSONCollection = db.collection[JSONCollection]("constraints")

  import models.JsonFormats._
  import models._

  /**
   * Action creates a new constraint
   * @return
   */
  def createConstraint = Action.async(parse.json) {
    request =>
      request.body.validate[ConstraintModel].map {
        constraint =>
          collection.insert(constraint).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Constraint Created")
          }
      }.getOrElse(Future.successful(BadRequest("invalid json")))
  }

  /**
   * Modifies/Stores the posted constraint
   *
   * @return
   */
  def updateConstraint = Action.async(parse.json){
    request =>
      request.body.validate[ConstraintModel].map {
        constraint =>
          val modifier    =   Json.obj( "$set" -> Json.obj("uID"        -> constraint.uID),
                                        "$set" -> Json.obj("name"       -> constraint.name),
                                        "$set" -> Json.obj("topic"      -> constraint.topic),
                                        "$set" -> Json.obj("valueInTopic" -> constraint.valueInTopic),
                                        "$set" -> Json.obj("value"      -> constraint.value),
                                        "$set" -> Json.obj("fulfilled"  -> constraint.fulfilled),
                                        "$set" -> Json.obj("languageTerm"  -> constraint.languageTerm))

          collection.update(Json.obj("uID" -> constraint.uID), modifier).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Constraint has been updated")
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
    val cursor: Cursor[ConstraintModel] = collection.find(Json.obj("topic" -> topicID)).cursor[ConstraintModel]

    val futureConstraintList: Future[List[ConstraintModel]] = cursor.collect[List]()

    val futureConstraintsJsonArray: Future[JsArray] = futureConstraintList.map { constraints =>
      Json.arr(constraints)
    }

    futureConstraintsJsonArray.map {
      constraints =>
        Ok(constraints(0))
    }
  }
}

