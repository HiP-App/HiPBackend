package controllers

import javax.inject.{Inject, Singleton}

import org.slf4j.{Logger, LoggerFactory}
import play.api.mvc._
import services.UUIDGenerator

@Singleton
class Application extends Controller{

  private final val logger: Logger = LoggerFactory.getLogger(classOf[Application])

  def index = Action {
    logger.info("Serving index page...")
    Ok(views.html.index())
  }

}
