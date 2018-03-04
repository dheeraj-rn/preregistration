var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var upload = multer();
var mongodb = require('mongoose');
mongodb.connect('mongodb://127.0.0.1/project_db', {
    useMongoClient: true
});

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
    cgpa: {
        type: Number,
        trim: true
    },
    req: {
        type: String,
        trim: true
    }
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


var Electives = mongodb.model("electives", electivesSchema);
var Registered = mongodb.model("reg_students", registeredSchema);
var Login = mongodb.model("logins", loginSchema);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    console.log('request at ' + Date.now());
    console.log('dir name : ' + __dirname);
    next();
});




app.get("/", (req, res) => {
    res.render('index');
});

//@post get data and validate
app.post('/student', function(req, res) {
    //console.log(studentInfo.course);
    //console.log(studentInfo.semester);
    let studentInfo;
    studentInfo = req.body;
    let temp2 = studentInfo.rollno;
    let temp3 = temp2.toUpperCase();
    console.log(temp3);

            Electives.find({
                course: studentInfo.course,
                sem: studentInfo.semester
            }, function(err, result) {
                //Electives.find({course:'btech', sem:5},'slot scode sname',function(err, result){
                if (err) {
                    res.end();
                } else if (result.length) {
                    res.render('electives', {
                        links: result,
                        scgpa: studentInfo.cgpa,
                        secret: studentInfo
                    });
                } else {
                    res.end();
                }
            });
});


app.post('/registered', function(req, res) {
    let selectedOptions = req.body;
    let s_name;
    let s_rollno;
    console.log(selectedOptions);
    let allSlot = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    allSlot.forEach(function(value) {
        //console.log(selectedOptions[value]);
        //console.log('for each loop');
        if (typeof selectedOptions[value] !== "undefined") {
            //console.log('if');

            Registered.count({ rollno: selectedOptions.rollno, slot: value  }, function(err, count) {
                console.log(count);
                if (count == 0) {

            Electives.findOne({ scode: selectedOptions[value], slot: value }, 'sname', function(req, res) {
                //console.log('findone '+res);
                s_name = res.sname;

                let newRegistration = new Registered({
                    scode: selectedOptions[value],
                    sname: s_name,
                    slot: value,
                    name: selectedOptions.name,
                    rollno: selectedOptions.rollno,
                    course: selectedOptions.course,
                    semester: selectedOptions.semester,
                    cgpa: selectedOptions.cgpa
                });

                Electives.findOne({scode: selectedOptions[value]}, 'count', function(req, res) {
                    console.log('electives count '+res.count);
                    if (res.count > 0) {


                newRegistration.save(function(err, Student) {
                    if (err) {
                        res.send('Invalid Form');
                    } else {
                        console.log('SAVED');
                        Electives.findOne({scode: selectedOptions[value]}, 'scode count', function(req, res) {
                            console.log('electives count '+res.count);
                            let temp = res.count;
                            temp = temp - 1;
			console.log('temp = ',temp);
			console.log('scode = ',selectedOptions[value]);
                            Electives.update({scode: selectedOptions[value]}, {count: temp}, {multi: true}, function(err, out) {
				console.log(out);
			});
                        });
                    }

                });
              }
              else {
                res.sendFile(__dirname + "/public/error.html");
              }
            });
            });
          }
        });
        }
    });


    //res.sendFile(__dirname + "/public/register.html");
    /*res.render('register', {
	rollno: selectedOptions.rollno
});*/
res.redirect('/print/'+selectedOptions.rollno);

});




app.get('/print/:rollno', function(req, res){
  let temp=req.params.rollno.toUpperCase();
   Registered.find({ rollno:temp}, function(err, response){
     if(response.length!=0){
     res.render('printreg', {
         print_data: response
     });
   }
   else {
     res.render('blankreport');
   }

     //res.json(response);
   });
});

app.get('/report/',function(req, res){
  let scodeArray;
  let snameArray;
  let length;
  Electives.find().distinct('scode', function(error, scode) {
    //console.log(scode);
    scodeArray = scode;
    Electives.find().distinct('sname', function(err, sname) {
      snameArray = sname;
      res.render('reportlist', {
          scodes: scodeArray,
          snames: snameArray
      });
      for(var i = 0; i < sname.length;i++){
        console.log(scodeArray[i],snameArray[i]);
      }
    });
  });
});

app.get('/report/:subject',function(req, res){
  let temp=req.params.subject;
  //console.log(temp);
  Registered.find({scode:temp}, function(err, response){
    console.log(response);
      console.log('Length:', response.length);
      if(response.length!=0){
        res.render('reportprint', {
            reportData: response
        });
      }
      else {
        res.render('blankreport');
      }

  });
});

app.get('/sreport/:course/:semester',function(req, res){
  let crs = req.params.course;
  let sem = req.params.semester;
  console.log(crs,sem);
  Registered.find({course:crs, semester:sem}, function(err, response){
    console.log(response);
      console.log('Length:', response.length);
      if(response.length!=0){
        res.render('semreportprint', {
            reportData: response
        });
      }
      else {
        res.render('semblankreport');
      }

  });
});

app.get('/admin/',function(req, res){
  res.sendFile(__dirname + "/public/login.html");
});

app.post('/admin',function(req, res){
    let adminInfo;
    adminInfo = req.body;
    console.log(req.body);
    Login.count({ uname: adminInfo.uname, password: adminInfo.password  }, function(err, count) {
    if(count>0){
	res.render('add-electives');
    }
    else{
	res.sendFile(__dirname + "/public/login_2.html");
    }
    });

});

app.get('/viewdb/',function(req, res){
  Electives.find(function(err, result){
	console.log(result);
      if(result.length!=0){
        res.render('viewdb', {
            reportData: result
        });
      }
      else {
        res.render('blankreport');
      }

  });
});

app.post('/add-data',function(req, res){
  let addElective = req.body;
  console.log(addElective);
  let newElective = new Electives({
                    course: addElective.course,
                    sem: addElective.sem,
                    slot: addElective.slot,
                    scode: addElective.scode,
                    sname: addElective.sname,
                    sfac: addElective.sfac,
                    count: addElective.count,
                    cgpa: addElective.cgpa,
		    req: addElective.req
                });
                newElective.save(function(err, Student) {
		    console.log(err, Student);
                    if (err) {
                        //res.send('Invalid Form');
			let temp = err;
                        res.render('add-electives', {
                                responseData: temp
                        });
                    } else {
			console.log('SAVED');
			let temp = "Elective Saved";
			res.render('add-electives', {
            			responseData: temp
        		});
		    }
});
});

app.get('*', (req, res) => {
    res.redirect('/')
});

app.listen(8081);
console.log('listening to http://127.0.0.1:8081');;
