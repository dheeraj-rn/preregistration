var mongodb = require("mongoose");


var loginSchema = mongodb.Schema({
    uname: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    }
});

module.exports = mongodb.model("logins", loginSchema);