package controllers

import javax.inject.{Inject, Singleton}

import org.slf4j.{Logger, LoggerFactory}
import play.api.mvc._
import securesocial.core._

@Singleton
class Application extends Controller  with SecureSocial{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

   /*
  def index = SecuredAction { implicit  request =>

    println(" USER ---- ::: ")
    println(request.user)
    println(" USER ---- ::: ")

    Ok(views.html.index())
  }*/


  def index = Action {
    logger.info("Serving index page...")
    Ok(views.html.index())
  }

}
