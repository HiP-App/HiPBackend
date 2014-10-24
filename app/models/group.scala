package models

case class Group(name: String,
                 member: String,
                 createdBy: String,
                 notifications: Array[String])