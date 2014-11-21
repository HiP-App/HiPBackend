package controllers

import javax.inject.{Inject, Singleton}

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
        println(" ::: ---- USER ---- ::: ")
        println(request.user)
        println(" ::: ---- USER ---- ::: ")

        Ok(views.html.index(secureOption(request.user.get.email,"ERROR: No email address specified"),
          request.user.get.firstName))
      }
      case _ => {
        Ok(views.html.loginplease())
      }
    }

  }

}
