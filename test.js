var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var upload = multer();
var Promise = require('promise');
var mongodb = require('mongoose');
mongodb.connect('mongodb://127.0.0.1/project_db', {
    useMongoClient: true
});
var electivesSchema = mongodb.Schema({
    course: String,
    sem: Number,
    slot: String,
    scode: String,
    sname: String,
    sfac: String,
    count: Number,
    cgpa: Number
});

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
    semester: String,
    cgpa: String
});
var Electives = mongodb.model("electives", electivesSchema);
var Registered = mongodb.model("reg_students", registeredSchema);



app.get('/find/:rollno', function(req, res){
   Registered.find({ rollno:req.params.rollno}, function(err, response){
     res.json(response);
   });
});

app.listen(8000);
console.log('listening to http://127.0.0.1:8000');;
