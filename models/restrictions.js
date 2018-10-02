var mongodb = require("mongoose");

var restrictionsSchema = mongodb.Schema({
    course: String,
    sem: Number,
    maxSelection: Number
});

module.exports = mongodb.model("restrictions", restrictionsSchema);