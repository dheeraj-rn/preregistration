var mongodb = require("mongoose");

var electivesSchema = mongodb.Schema({
    course: {
        type: String,
        trim: true
    },
    sem: {
        type: Number,
        trim: true
    },
    slot: {
        type: String,
        uppercase: true,
        trim: true
    },
    scode: {
        type: String,
        uppercase: true,
        trim: true
    },
    sname: {
        type: String,
        trim: true
    },
    sfac: {
        type: String,
        trim: true
    },
    count: {
        type: Number,
        trim: true
    },
    req: {
        type: String,
        trim: true
    }
});

module.exports = mongodb.model("electives", electivesSchema);