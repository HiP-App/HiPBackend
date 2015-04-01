package controllers

import java.awt.geom.AffineTransform
import java.awt.{RenderingHints, Graphics2D}
import java.awt.image.{AffineTransformOp, RenderedImage, BufferedImage}
import java.io._
import javax.imageio.ImageIO
import javax.inject.Singleton

import org.slf4j.{Logger, LoggerFactory}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json._
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import play.modules.reactivemongo.json.collection.JSONCollection

import reactivemongo.api.gridfs.Implicits._
import reactivemongo.api.gridfs.{ReadFile, DefaultFileToSave, GridFS}
import reactivemongo.bson.{BSONDocument, BSONObjectID}
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

@Singleton
class FileController extends Controller with MongoController{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

  def mediaCollection:  JSONCollection = db.collection[JSONCollection]("media.files")
  def metaCollection:   JSONCollection = db.collection[JSONCollection]("media.meta")
  def topicCollection:  JSONCollection = db.collection[JSONCollection]("topics")

  /**
   * This Action is able to store a new picture in the database (it also generates a fitting thumbnail)
   *
   * @return
   */
  def upload(topicID: String) = Action(parse.multipartFormData) { request =>
    request.body.file("file") match {
      case Some(photo) =>
        val TARGET_W = 64; // width of the thumbnail
        val TARGET_H = 64; // height of the thumbnail

        val filename = photo.filename
        val contentType = photo.contentType

        val newFile = new File("/tmp/picture/uploaded")

        if (newFile.exists())
          newFile.delete()

        photo.ref.moveTo(newFile)

        val gridFS = new GridFS(db, "media")
        val fileToSave = DefaultFileToSave(filename, contentType)

        /* create thumbnail */
        val fileToSaveThumb = DefaultFileToSave("thumb_"+filename, contentType)

        val os = new ByteArrayOutputStream()

        /* load image for scaling operation (needed to derive thumbnail) */
        var before = ImageIO.read(newFile)

        /* create scale operation */
        val wScale  = TARGET_W / before.getWidth().asInstanceOf[Double]
        val hScale  = TARGET_H / before.getHeight().asInstanceOf[Double]

        var at = new AffineTransform()
        at.scale(wScale, hScale)
        var scaleOp = new AffineTransformOp(at, AffineTransformOp.TYPE_BILINEAR)

        /* create object that will contain the scaled image */
        val w = (before.getWidth() * wScale).asInstanceOf[Int]
        val h = (before.getHeight() * hScale).asInstanceOf[Int]
        var after = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB)

        /* use scale operation */
        scaleOp.filter(before, after)

        /* write image to output stream */
        ImageIO.write(after,"png", os)

        /* derive FileInputStream */
        val fis = new ByteArrayInputStream(os.toByteArray())

        /* write both files */
        gridFS.writeFromInputStream(fileToSave, new FileInputStream(newFile))
        gridFS.writeFromInputStream(fileToSaveThumb, fis)

        /* include the additional data */
        val cleanedID = fileToSave.id.toString.split('"')(1)
        val cleanedIDThumb = fileToSaveThumb.id.toString.split('"')(1)

        val returnObj = Json.obj(
          "uID"   ->  cleanedID,
          "topic" ->  topicID,
          "thumbnailID" -> cleanedIDThumb,
          "kvStore" -> "-1"
        )

        metaCollection.insert(returnObj)

        Ok(returnObj)
      case None => BadRequest("no media file")
    }
  }

  /**
   * This Action fetches a new media file (e.g., an image) from the database
   * @param uID the uID of the media file that should be fetched
   * @return
   */
  def getMediaFile(uID: String) = Action.async {
      val gridFS = new GridFS(db, "media")
      var searchString = ""

      val uIDcontainsASuffix = (uID.lastIndexOf('.') != -1)
      if(uIDcontainsASuffix){
        /* format used by Timo in the current version of the frontend */
        searchString = uID.substring(0,uID.lastIndexOf('.'))
      }else{
        /* format internally used by the backend */
        searchString = uID
      }

      val file = gridFS.find(BSONDocument("_id" -> new BSONObjectID(searchString)))
      serve(gridFS, file)
  }

  /**
   * This Action removes the media file (e.g., an image) from the database
   * @param uID the uID of the media file that should be removed
   * @return
   */
  def removeMediaFile(uID: String) = Action {
    val gridFS = new GridFS(db, "media")

    // remove file itself
    val remove = gridFS.remove(new BSONObjectID(uID))

    // also remove meta-data
    metaCollection.remove(Json.obj("uID"   ->  uID))

    Ok("file deleted")
  }
}
