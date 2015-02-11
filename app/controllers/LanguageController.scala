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

  /**
   * Deletes the current language token with the given key
   *
   * @param key     of the language token that should be deleted
   * @param lang    language of the key that should be deleted
   * @return
   */
  def deleteTerm(key : String, lang: String) = Action.async {
    /* delete from DB */
    collection.remove(Json.obj("key" -> key, "language" -> lang)).map {
      lastError =>
        Created(s"Item removed")
    }
  }
}


