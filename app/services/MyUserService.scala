package services

import play.api.libs.concurrent.Execution.Implicits._
import _root_.java.util.Date
import securesocial.core._
import play.api.{Logger,Application}
import securesocial.core.providers.Token
import play.api.libs.json._
import play.api.libs.json.Reads._
import play.api.libs.json.Writes._
import securesocial.core.IdentityId
import securesocial.core.providers.Token
import play.modules.reactivemongo.MongoController
import play.api.mvc.Controller
import play.modules.reactivemongo.json.collection.JSONCollection
import scala.concurrent.Await
import scala.concurrent.duration._
import reactivemongo.core.commands.GetLastError
import scala.util.parsing.json.JSONObject
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}

/**
 * taken from http://www.shrikar.com/blog/2013/10/26/playframework-securesocial-and-mongodb/
 *
 * @param application
 */
class MyUserService(application: Application) extends UserServicePlugin(application) with Controller with MongoController{
    def addCollection: JSONCollection = db.collection[JSONCollection]("usersAdd")
    def collection: JSONCollection = db.collection[JSONCollection]("users")
    def tokens: JSONCollection = db.collection[JSONCollection]("tokens")
    val outPutUser = (__ \ "id").json.prune

    def retIdentity(json : JsObject) : Identity = {
      val userid = (json \ "userid").as[String]

      val provider = (json \ "provider").as[String]
      val firstname = (json \ "firstname").as[String]
      val lastname = (json \ "lastname").as[String]
      val email = (json \ "email").as[String]
      val avatar = (json \ "avatar").as[String]
      val hash = (json \ "password" \ "hasher").as[String]
      val password = ( json \ "password" \ "password").as[String]
      println("password : "+ password)
      val salt = (json \ "password" \ "salt").asOpt[String]
      val authmethod = ( json \ "authmethod").as[String]

      val identity : IdentityId = new IdentityId(userid,authmethod)
      val authMethod : AuthenticationMethod = new AuthenticationMethod(authmethod)
      val pwdInfo: PasswordInfo = new PasswordInfo(hash,password)
      val user : SocialUser = new SocialUser(identity,firstname,lastname,firstname,Some(email),Some(avatar),authMethod,None,None,Some(pwdInfo))
      user
    }

    def findByEmailAndProvider(email: String, providerId: String): Option[Identity] = {
      val cursor  = collection.find(Json.obj("userid"->email,"provider"->providerId)).cursor[JsObject]
      val futureuser = cursor.headOption.map{
        case Some(user) => user
        case None => false
      }
      val jobj = Await.result(futureuser, 5 seconds)
      jobj match {
        case x : Boolean => None
        case _  => Some(retIdentity(jobj.asInstanceOf[JsObject]))

      }
    }

    def save(user: Identity): Identity = {

      println("UserService: Saving user data");

      val email = user.email match {
        case Some(email) => email
        case _ => "N/A"
      }

      val avatar = user.avatarUrl match{
        case Some(url) => url
        case _ => "N/A"
      }

      val savejson = Json.obj(
        "userid" -> user.identityId.userId,
        "provider" -> user.identityId.providerId,
        "firstname" -> user.firstName,
        "lastname" -> user.lastName,
        "email" -> email,
        "avatar" -> avatar,
        "authmethod" -> user.authMethod.method,
        "password" -> Json.obj("hasher" -> user.passwordInfo.get.hasher, "password" -> user.passwordInfo.get.password, "salt" -> user.passwordInfo.get.salt),
        "created_at" -> Json.obj("$date" -> new Date()),
        "updated_at" -> Json.obj("$date" -> new Date())
      )

      val role = "student"

      val saveadd = Json.obj(
        "userid" -> user.identityId.userId,
        "email" -> email,
        "role" -> role,
        "templates" -> "-1",
        "admin" -> "false",
        "master" -> "false"
      )

      // insert only if it is not there
      val cursor  = collection.find(Json.obj( "userid"->user.identityId.userId,
                                              "provider"->"userPassword")).cursor[JsObject]
      cursor.headOption.map {
        case Some(user) => {
         
        }
        case None => {
          collection.insert(savejson)
          addCollection.insert(saveadd)
        }
      }

      user
    }

    def find(id: IdentityId): Option[Identity] = {
      findByEmailAndProvider(id.userId,id.providerId)
    }

    def save(token: Token) {
      println("UserService: Saving token");

      val tokentosave = Json.obj(
        "uuid" -> token.uuid,
        "email" -> token.email,
        "creation_time" -> Json.obj("$date" -> token.creationTime),
        "expiration_time" -> Json.obj("$date" -> token.expirationTime),
        "isSignUp" -> token.isSignUp
      )
      tokens.save(tokentosave)
    }



    def findToken(token: String): Option[Token] = {

      val cursor  = tokens.find(Json.obj("uuid"->token)).cursor[JsObject]
      val futureuser = cursor.headOption.map{
        case Some(user) => user
        case None => false
      }
      val jobj = Await.result(futureuser, 5 seconds)
      jobj match {
        case x : Boolean => None
        case obj:JsObject  =>{
          println(obj)
          val uuid = ( obj \ "uuid").as[String]
          val email = (obj \ "email").as[String]
          val created = (obj \ "creation_time" \ "$date").as[Long]
          val expire = (obj \ "expiration_time" \ "$date").as[Long]
          val signup = (obj \ "isSignUp").as[Boolean]
          val df = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")
          Some(new Token(uuid,email,new DateTime(created),new DateTime(expire),signup))
        }
      }
    }

    def deleteToken(uuid: String) {}

    def deleteExpiredTokens() {}
  }
