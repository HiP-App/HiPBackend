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

  /**
   * Action returns the dictionary for the given language
   *
   * @param language  a String that contains the language (e.g., 'de' or 'eng')
   * @return {JSON}   the dictionary
   */
  def getLanguageDataForClient(language : String) = Action.async {
    if(debug){
      println("info: Language request found for language " + language)
    }

    val cursor: Cursor[LanguageModel] = collection.find(Json.obj("language" -> language)).cursor[LanguageModel]

    val futureDictList: Future[List[LanguageModel]] = cursor.collect[List]()

    val futureDictJsonArray: Future[JsArray] = futureDictList.map { terms =>
      Json.arr(terms)
    }

    if(debug){
      println("info: found: ")
      println(futureDictList.toString)
    }

    futureDictJsonArray.map {
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


