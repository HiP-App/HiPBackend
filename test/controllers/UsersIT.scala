package controllers

import scala.concurrent._
import duration._
import org.specs2.mutable._

import play.api.libs.json._
import play.api.test._
import play.api.test.Helpers._
import java.util.concurrent.TimeUnit

class UsersIT extends Specification {

  val timeout: FiniteDuration = FiniteDuration(5, TimeUnit.SECONDS)


  def printTCHeader(name : String) = {
    println( " ")
    println( " === === === === === === === ====")
    println( " # Test Case:" + name)
    println( " === === === === === === === ====")
  }

  def printTCFooter(name : String) = {
    println( " === === === === === === === ====")
    println( " === === END of test case === ===")
    println( " === === === === === === === ====")
    println( " ")
  }

  "Users" should {

    val tcN1 = "TCN1: User REST get"
    "get a user via rest interface - negative test case" in {
      running(FakeApplication()) {
        printTCHeader(tcN1)

        /* pre-condition */
        val resDrop = route(FakeRequest(GET, "/drop")).get
        Await.result(resDrop, timeout)

        /* test */
        val testUser = route(FakeRequest(GET, "/user/1")).get

        printTCFooter(tcN1)
        status(testUser) must equalTo(OK)
        contentAsString(testUser) must not contain("Tony")
      }
    }

    val tcN2 = "TCN1: User REST add"
    "fail inserting a non valid json" in {
      running(FakeApplication()) {
        printTCHeader(tcN2)

        val request = FakeRequest.apply(POST, "/user").withJsonBody(Json.obj(
          "firstName" -> 98,
          "lastName" -> "London",
          "age" -> 27))

        printTCFooter(tcN2)
        val response = route(request)
        response.isDefined mustEqual true
        val result = Await.result(response.get, timeout)
        contentAsString(response.get) mustEqual "invalid json"
        result.header.status mustEqual BAD_REQUEST
      }
    }

    val tcP0 = "TCP0: User REST add"
    "insert a valid json" in {
      running(FakeApplication()) {
        printTCHeader(tcP0)

        val request = FakeRequest.apply(POST, "/user").withJsonBody(Json.obj(
          "id" -> "1",
          "firstName" -> "Edward",
          "lastName" -> "Starks",
          "age" -> 42,
          "active" -> true))

        printTCFooter(tcP0)
        val response = route(request)
        response.isDefined mustEqual true
        val result = Await.result(response.get, timeout)
        result.header.status must equalTo(CREATED)
      }
    }

    val tcP1 = "TCP1: User REST add"
    "get a user via rest interface - positive test case" in {
      running(FakeApplication()) {
        printTCHeader(tcP1)

        val resAdd = route(FakeRequest(GET, "/add")).get
        Await.result(resAdd, timeout)

        /* test */
        val testUser = route(FakeRequest(GET, "/user/1")).get

        printTCFooter(tcP1)
        status(testUser) must equalTo(OK)
        contentAsString(testUser) must contain("Tony")
      }
    }

  }

}