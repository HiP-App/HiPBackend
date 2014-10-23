package controllers

import java.util.concurrent.TimeUnit

import org.specs2.mutable._
import play.api.libs.json.Json

import play.api.test._
import play.api.test.Helpers._

import scala.concurrent.Await
import scala.concurrent.duration.FiniteDuration

/**
 * You can mock out a whole application including requests, plugins etc.
 * For more information, consult the wiki.
 */
class ApplicationIT extends Specification {

  val timeout: FiniteDuration = FiniteDuration(5, TimeUnit.SECONDS)

  "Application" should {

    "insert a valid json" in {
      running(FakeApplication()) {
        val request = FakeRequest.apply(POST, "/user").withJsonBody(Json.obj(
          "id" -> "1",
          "firstName" -> "Tony",
          "lastName" -> "Starks",
          "age" -> 42,
          "active" -> true))

        val response = route(request)
        response.isDefined mustEqual true
        val result = Await.result(response.get, timeout)
        result.header.status must equalTo(CREATED)
      }
    }

  }
}