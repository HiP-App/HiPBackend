package controllers

import _root_.java.io.File
import _root_.java.text.SimpleDateFormat
import _root_.java.util.{TimeZone, Date}
import javax.inject.{Inject, Singleton}

import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jose.{JWSHeader, Payload, JWSAlgorithm, JWSObject}
import com.nimbusds.jwt.{SignedJWT, JWTClaimsSet}
import org.slf4j.{Logger, LoggerFactory}
import play.api.mvc._
import play.modules.reactivemongo.MongoController
import securesocial.core._

/**
 * Created by Jörg Amelunxen on 04.01.15.
 */

@Singleton
class FileController extends Controller with MongoController{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

  def upload = Action(parse.temporaryFile) { request =>

    var newFile = new File("/tmp/picture/uploaded")

    if(newFile.exists())
      newFile.delete()

    request.body.moveTo(newFile)

    Ok("File uploaded")
  }

}
