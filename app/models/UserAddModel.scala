package models

case class UserAddModel( userid : String,
                          email : String,
                          role : String,
                          templates: String,
                          admin: String,
                          master: String)

