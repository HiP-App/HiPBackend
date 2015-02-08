package models

/**
 * Created by Jörg Amelunxen on 08.02.15.
 */
case class KVTypeModel(uID: String,
                     name: String,
                     extendsType: String,
                     system: String,
                     keys: Array[String],
                     values: Array[String])
