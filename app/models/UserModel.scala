package models

case class UserModel( userid : String,
                        provider : String,
                        firstname : String,
                        lastname : String,
                        email : String,
                        avatar : String,
                        authmethod : String
                        //password : {
                        //            hasher : "bcrypt",
                        //            password : "$2a$10$1hVphlZkwSTJe6UKMYM2gOR.5bTsFFg3wZgydqPGUbmK8bt7aGzkW",
                        //            salt : null
                        //            },
                        //created_at : ISODate("2014-11-06T16:35:36.808Z"),
                        //updated_at : ISODate("2014-11-06T16:35:36.809Z")
                     )

