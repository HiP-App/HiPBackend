package controllers

import org.specs2.mutable._

import play.api.test._
import play.api.test.Helpers._

/**
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
class ApplicationIT extends Specification {

  "Application" should {

    "database is up and running" in {
      running(FakeApplication()) {
        val testuser = route(FakeRequest(GET, "/user/1")).get

        status(testuser) must equalTo(OK)
        contentAsString(testuser) must contain("Joerg")
      }
    }

  }
}