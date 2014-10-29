package controllers

import javax.inject.Singleton

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.Cursor
import models.ChatModel
import reactivemongo.api._
import reactivemongo.bson._

import scala.concurrent.Future

@Singleton
class LanguageController extends Controller with MongoController {
  private final val logger: Logger = LoggerFactory.getLogger(classOf[GroupController])

  val debug = false

  def collection: JSONCollection = db.collection[JSONCollection]("language")

  import models.JsonFormats._
  import models._

  def getLanguageDataForClient(language : String) = Action.async {
    if(debug){
      println("info: Language request found for language " + language)
    }

    // let's do our query
    val cursor: Cursor[LanguageModel] = collection.
      // find all
      find(Json.obj("language" -> language)).
      // perform the query and get a cursor of JsObject
      cursor[LanguageModel]

    // gather all the JsObjects in a list
    val futureUsersList: Future[List[LanguageModel]] = cursor.collect[List]()

    // transform the list into a JsArray
    val futurePersonsJsonArray: Future[JsArray] = futureUsersList.map { terms =>
      Json.arr(terms)
    }

    if(debug){
      println("info: found: ")
      println(futureUsersList.toString)
    }

    // everything's ok! Let's reply with the array
    futurePersonsJsonArray.map {
      terms =>
        Ok(terms(0))
    }
  }

  /**
   * This method posts a term to the database
   * The term should have the following structure:
   *
   * JSON{
   *  language: aLanguage,
   *  key: aKey,
   *  value: aValue
   *  }
   *
   * @return
   */
  def postTerm() = Action.async(parse.json) {
    request =>
      printf("Hallo Welt")
      /*
       * request.body is a JsValue.
       * There is an implicit Writes that turns this JsValue as a JsObject,
       * so you can call insert() with this JsValue.
       * (insert() takes a JsObject as parameter, or anything that can be
       * turned into a JsObject using a Writes.)
       */
      request.body.validate[LanguageModel].map {
        language =>
          // `user` is an instance of the case class `models.User`
          collection.insert(language).map {
            lastError =>
              logger.debug(s"Successfully inserted with LastError: $lastError")
              Created(s"Term placed in database")
          }
      }.getOrElse(
          Future.successful(BadRequest("invalid json"))
        )
  }
}


