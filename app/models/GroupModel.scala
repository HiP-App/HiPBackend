package models

case class GroupModel(uID: String,
                 name: String,
                 member: String,
                 createdBy: String,
                 notifications: Array[String])