const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.STUDYBUDDY_CLIENT_ID,
    clientSecret: process.env.STUDYBUDDY_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/google/callback", // https://studybuddy-server.herokuapp.com/google/callback", //http://localhost:8080/google/callback",
    passReqToCallback   : true
  },

  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));