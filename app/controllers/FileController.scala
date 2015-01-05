package controllers

import _root_.java.io.{FileInputStream, File}
import _root_.java.text.SimpleDateFormat
import _root_.java.util.{TimeZone, Date}
import javax.inject.{Inject, Singleton}

import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jose.{JWSHeader, Payload, JWSAlgorithm, JWSObject}
import com.nimbusds.jwt.{SignedJWT, JWTClaimsSet}
import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.json.Json
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection
import reactivemongo.api.gridfs.Implicits._
import reactivemongo.api.gridfs.{ReadFile, DefaultFileToSave, GridFS}
import reactivemongo.bson.{BSONDocument, BSONObjectID, BSONValue}
import scala.concurrent.ExecutionContext.Implicits.global
import securesocial.core._

import scala.concurrent.Future
import scala.util.parsing.json.JSONObject

/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

@Singleton
class FileController extends Controller with MongoController{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

  def mediaCollection: JSONCollection = db.collection[JSONCollection]("media.files")
  def metaCollection: JSONCollection = db.collection[JSONCollection]("media.meta")

  /**
   * This Action is able to store a new picture in the database
   *
   * @return
   */
  def upload(topicID: String) = Action(parse.multipartFormData) { request =>
    request.body.file("file") match {
      case Some(photo) =>
        val filename = photo.filename
        val contentType = photo.contentType

        var newFile = new File("/tmp/picture/uploaded")

        if (newFile.exists())
          newFile.delete()

        photo.ref.moveTo(newFile)

        var gridFS = new GridFS(db, "media")
        val fileToSave = DefaultFileToSave(filename, contentType)

        gridFS.writeFromInputStream(fileToSave, new FileInputStream(newFile))

        // include the additional data
        var cleanedID = fileToSave.id.toString.split('"')(1)

        println("adding to topic: " + topicID)

        metaCollection.insert(Json.obj(
          "uID"   ->  cleanedID,
          "topic" ->  topicID
        ));

        Ok("File uploaded")
      case None => BadRequest("no media file")
    }
  }

  /**
   * This Action fetches a new media file (e.g., an image) from the database
   * @param uID the uID of the media file that should be fetched
   * @return
   */
  def getMediaFile(uID: String) = Action.async {
      var gridFS = new GridFS(db, "media")
      val file = gridFS.find(BSONDocument("_id" -> new BSONObjectID(uID)))
      serve(gridFS, file)
  }
}
