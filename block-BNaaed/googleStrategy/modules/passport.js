const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').Strategy;
const User = require('../models/users');
//Define a new strategy

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      profileFields: ['email', 'displayName', 'photos'],
    },
    function (accessToken, refreshToken, profile, done) {
      let userdata = {
        name: profile.displayName,
        username: profile.username,
        email: profile._json.email,
        photo: profile._json.avatar_url,
      };
      User.findOne({ email: profile._json.email }, (err, user) => {
        console.log('Getting inside  this   one ');
        if (err) return done(err);
        if (!user) {
          User.create(userdata, (err, user) => {
            console.log('Yeah this is getting inside this ');
            if (err) return done(err);
            console.log('this is the created user right now  ');
            console.log(user);
            done(null, user);
          });
        }
        return done(null, user);
      });
    }
  )
);

// This  will creates the session and adds  the userid in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// now  if the user is already logged in then  deserailze user comes into picture
// it will grab  the id  from the cookie and finds this in the database
passport.deserializeUser((id, done) => {
  User.findById(id, 'name , email ,usrname', (err, user) => {
    console.log(user);
    done(err, user);
  });
});
