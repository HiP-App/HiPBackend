package models

/**
 * Created by joerg on 03.12.2014.
 */
case class ConstraintModel(uID: String,
                           name: String,
                      topic: String,
                      valueInTopic: String,
                      value: String,
                      fulfilled: Boolean,
                      languageTerm: String)
