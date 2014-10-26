package services

import securesocial.core.Identity

/**
 * Created by joerg on 26.10.2014.
 */
// a simple User class that can have multiple identities
case class DemoUser(main: Identity, identities: List[Identity])
