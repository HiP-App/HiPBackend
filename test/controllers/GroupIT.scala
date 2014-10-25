package controllers

import java.util.concurrent.TimeUnit

import org.specs2.mutable._
import play.api.libs.json.Json

import play.api.test._
import play.api.test.Helpers._

import scala.concurrent.Await
import scala.concurrent.duration.FiniteDuration

class GroupIT extends Specification {
  val timeout: FiniteDuration = FiniteDuration(5, TimeUnit.SECONDS)

  var notification = new Array[String](1)
  notification(0) = "DummyNotification";

  val reqObject = Json.obj(
    "uID" -> "demoIT",
    "name" -> "TestID",
    "member" -> "Tony Starks",
    "createdBy" -> "Chuck Norris",
    "notifications" -> notification)

  "GroupController" should {

    "insert a valid json" in {
      running(FakeApplication()) {
        val request = FakeRequest.apply(POST, "/admin/group").withJsonBody(reqObject)

        val response = route(request)
        response.isDefined mustEqual true
        val result = Await.result(response.get, timeout)
        result.header.status must equalTo(CREATED)
      }
    }

    "remove a group (create - precondition)" in {
      running(FakeApplication()) {
        val request = FakeRequest.apply(DELETE, "/admin/group/demoIT")

        val response = route(request)
        response.isDefined mustEqual true
      }
    }
  }
}