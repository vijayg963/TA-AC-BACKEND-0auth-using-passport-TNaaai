const User = require('../models/users');
module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect('/users/login');
    }
  },
  userinfo: async (req, res, next) => {
    let user = req.user;
    if (req.user) {
      res.locals.user = user;
      next();
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
};
