package models

/**
 * Created by joerg on 26.10.2014.
 */
object JsonFormats {
  import play.api.libs.json.Json

  // Generates Writes and Reads for Feed and User thanks to Json Macros
  implicit val userFormat = Json.format[User]
  implicit val groupFormat = Json.format[Group]
}