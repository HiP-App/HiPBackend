package controllers

import javax.inject.{Inject, Singleton}

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import reactivemongo.api.collections.default.BSONCollection
import reactivemongo.bson.BSONDocument
import reactivemongo.core.commands.Drop

import scala.util.{Failure, Success}

@Singleton
class TestDriver @Inject() extends Controller with MongoController {

  private final val logger: Logger = LoggerFactory.getLogger(classOf[TestDriver])

  def dropAllTables = Action {
    logger.info("Dropping DBs")

    val drop = new Drop("users")
    db.command(drop)

    Ok("1")
  }

  def addTestData = Action  {
    logger.info("Adding Test Data")

    /* adding test user */
    val document = BSONDocument(
      "id"  -> 1,
      "firstName" -> "Tony",
      "lastName" -> "Starks",
      "age" -> 44)

    val future = db.collection[BSONCollection]("users").insert(document)

    future.onComplete {
      case Failure(e) => throw e
      case Success(lastError) => {
        println("successfully inserted document with lastError = " + lastError)
      }
    }

    Ok("1")
  }
}
