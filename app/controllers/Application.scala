package controllers

import _root_.java.text.SimpleDateFormat
import _root_.java.util.{TimeZone, Date}
import javax.inject.{Inject, Singleton}

import com.nimbusds.jose.crypto.MACSigner
import com.nimbusds.jose.{JWSHeader, Payload, JWSAlgorithm, JWSObject}
import com.nimbusds.jwt.{SignedJWT, JWTClaimsSet}
import org.slf4j.{Logger, LoggerFactory}
import play.api.mvc._
import securesocial.core._

@Singleton
class Application extends Controller  with SecureSocial{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

  def secureOption(x: Option[String], error:String) = x match {
    case Some(s) => s
    case None => error
  }

  def index = UserAwareAction { implicit  request =>

    request.user match {
      case Some(user) => {
        Ok(views.html.index(secureOption(request.user.get.email,"ERROR: No email address specified"),
          request.user.get.firstName))
      }
      case _ => {
        Ok(views.html.loginplease())
      }
    }

  }


  def getToken = UserAwareAction { implicit  request =>
    request.user match {
      case Some(user) => {
        /* prepare secret */
        val sharedSecret = "9043aa09-e8c1-46b3-b570-2da27a018ac3" getBytes

        // Create HMAC signer
        val signer = new MACSigner(sharedSecret)

        // get current time
        val tz = TimeZone.getTimeZone("UTC");
        var df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        df.setTimeZone(tz);
        val nowAsISO = df.format(new Date());

        // Prepare JWT with claims set
        val claimsSet = new JWTClaimsSet()
        claimsSet setCustomClaim("consumerKey",   "ed83da60ae5e4d159729eef16a207525")
        claimsSet setCustomClaim("userId",        secureOption(request.user.get.email,"ERROR: No email address specified"));
        claimsSet setCustomClaim("issuedAt",      nowAsISO)
        claimsSet setCustomClaim("ttl",           "86400")


        var signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claimsSet)

        // Apply the HMAC
        signedJWT.sign(signer)

        val s = signedJWT.serialize

        Ok(s)
      }
      case _ => {
        Ok(views.html.loginplease())
      }
    }

  }

}
