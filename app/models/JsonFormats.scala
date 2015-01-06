package models

/**
 * Created by Jörg Amelunxen on 26.10.2014.
 */
object JsonFormats {
  import play.api.libs.json.Json

  // Generates Writes and Reads for Feed and User thanks to Json Macros
  implicit val userFormat = Json.format[UserModel]
  implicit val userAddFormat = Json.format[UserAddModel]
  implicit val groupFormat = Json.format[GroupModel]
  implicit val chatFormat = Json.format[ChatModel]
  implicit val languageFormat = Json.format[LanguageModel]
  implicit val MessageFormat = Json.format[MessageModel]
  implicit val TopicFormat = Json.format[TopicModel]
  implicit val NotificationFormat = Json.format[NotificationModel]
  implicit val constraintFormat = Json.format[ConstraintModel]
  implicit val footnoteFormat = Json.format[FootnoteModel]
  implicit val metadataFormat = Json.format[MetadataModel]

}