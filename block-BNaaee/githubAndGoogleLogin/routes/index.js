var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/failure', (req, res) => {
  res.send('failure');
});

router.get('/success', (req, res) => {
  console.log(req.user);
  res.send('sucessfully login');
});

//for google authenticate
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/success',
    failureRedirect: '/failure',
  })
);

//for github authenticate
router.get('/auth/github', passport.authenticate('github'));

router.get(
  '/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/failure',
  }),
  (req, res) => {
    res.redirect('/success');
  }
);

module.exports = router;
