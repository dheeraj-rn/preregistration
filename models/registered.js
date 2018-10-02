var mongodb = require("mongoose");

var registeredSchema = mongodb.Schema({
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

module.exports = mongodb.model("reg_students", registeredSchema);