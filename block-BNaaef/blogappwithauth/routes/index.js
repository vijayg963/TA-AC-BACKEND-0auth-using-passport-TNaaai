var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log('user session id is 👉 ' + req.session.userId);
  res.render('index', { title: 'Express' });
});

// google login strategy
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/articles',
    failureRedirect: '/users/login',
  })
);

// github login strategy
router.get('/auth/github', passport.authenticate('github'));

// note:- callback resposible for the response from the server of the user
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/users/login' }),
  (req, res) => {
    res.redirect('/articles');
  }
);

module.exports = router;
