var mongodb = require('mongoose');

module.exports = mongodb.Schema({
  uname: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    trim: true
  }
});