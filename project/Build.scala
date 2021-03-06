import sbt.Keys._
import sbt._

object ApplicationBuild extends Build {

  val appName         = "modern-web-template"
  val appVersion      = "0.1-SNAPSHOT"

  val appDependencies = Seq(
    "com.google.inject" % "guice" % "3.0",
    "javax.inject" % "javax.inject" % "1",
    "org.reactivemongo" %% "reactivemongo" % "0.10.0",
    "org.reactivemongo" %% "play2-reactivemongo" % "0.10.2",

    "org.mockito" % "mockito-core" % "1.9.5" % "test",
    "ws.securesocial" %% "securesocial" % "2.1.4",
    "com.nimbusds" % "nimbus-jose-jwt" % "2.15.1"
  )

  val main = play.Project(appName, appVersion, appDependencies).settings(
    resolvers += Resolver.sonatypeRepo("releases")
  )

}
