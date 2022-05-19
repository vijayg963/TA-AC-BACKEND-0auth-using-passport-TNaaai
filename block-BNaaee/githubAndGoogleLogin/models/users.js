let mongoose = require('mongoose');
let userSchema = mongoose.Schema({
  name: String,
  userName: String,
  email: {
    type: String,
    require: true,
  },
  photo: String,
});

let User = mongoose.model('User', userSchema);
module.exports = User;
