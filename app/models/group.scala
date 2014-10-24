package models

case class Group(uID: String,
                 name: String,
                 member: String,
                 createdBy: String,
                 notifications: Array[String])