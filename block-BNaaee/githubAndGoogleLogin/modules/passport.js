const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');

// ower google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    function (accessToken, refreshToken, profile, done) {
      let userData = {
        name: profile.name,
        username: profile._json.name,
        email: profile._json.email,
        photo: profile._json.picture,
      };
      // console.log(profile);
      // console.log(userData);
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(userData, (err, user) => {
            if (err) return done(err);
            return done(null, user);
          });
        }
        return done(null, user);
      });
    }
  )
);

// this is ower github Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/github/callback ',
      profileFields: ['email', 'displayName', 'photos'],
    },
    function (accessToken, refreshToken, profile, done) {
      let userData = {
        name: profile.displayName,
        username: profile.username,
        email: profile._json.email,
        photo: profile._json.avatar_url,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(userData, (err, user) => {
            if (err) return done(err);
            console.log(user);
            done(null, user);
          });
        }
        return done(null, user);
      });
    }
  )
);

// session create
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, 'name,email,username', (err, user) => {
    console.log(user);
    done(err, user);
  });
});
