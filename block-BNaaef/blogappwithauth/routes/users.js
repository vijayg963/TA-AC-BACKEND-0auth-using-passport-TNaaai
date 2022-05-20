var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

/* GET users listing. */
router.get('/', function (req, res, next) {
  let { userId: id } = req.session;
  console.log(`Session  user id is 👉 :${id}`);
  res.render('users');
});

router.get('/login', (req, res) => {
  res.render('userlogin');
});

router.get('/logout', (req, res) => {
  let id = req.session.userId;
  req.session.destroy();
  res.clearCookie('connect.sid');
  res.redirect('/users/login');
});

module.exports = router;
