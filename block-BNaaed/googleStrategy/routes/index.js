var express = require('express');
const { Passport } = require('passport/lib');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/success', (req, res) => {
  console.log(req.session);
  res.send('success');
});

router.get('/failure', (req, res) => {
  res.send('failure');
});

router.get('/auth/google', passport.authenticate('google'));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/failure' }),
  (req, res) => {
    res.redirect('/sucess');
  }
);

module.exports = router;
