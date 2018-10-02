var mongodb = require('mongoose');
module.exports = mongodb.Schema({
  course: String,
  sem: Number,
  maxSelection: Number
});
