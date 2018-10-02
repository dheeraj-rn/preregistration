var mongodb = require('mongoose');

module.exports = mongodb.Schema({
  scode: String,
  sname: String,
  slot: String,
  name: {
    type: String,
    trim: true
  },
  rollno: {
    type: String,
    uppercase: true,
    trim: true
  },
  course: String,
  semester: String
});
