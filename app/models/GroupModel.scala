package models

case class GroupModel(uID: String,
                 name: String,
                 member: String,
                 createdBy: String,
                 topic : String,
                 notifications: Array[String],
                 readableBy: Array[String]);