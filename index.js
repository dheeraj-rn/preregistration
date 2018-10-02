var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');
var upload = multer();
var mongodb = require('mongoose');
var Electives = require('./models/electives');
var Registered = require('./models/registered');
var Login = require('./models/login');
var Restrictions = require('./models/restrictions');
mongodb.connect('mongodb://127.0.0.1/project_db', {
    useMongoClient: true
});

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(upload.array()); // for parsing multipart/form-data
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    console.log('request at ' + Date.now());
    console.log('dir name : ' + __dirname);
    next();
});




app.get("/", (req, res) => {
    /*  Electives.find().distinct('sem', function(error, sem) {
          res.render('index', {
              semesters: sem
          });

      });*/
    res.render('index');
});

//@post get data and validate
app.post('/student', function (req, res) {
    let studentInfo;
    var maxElective;
    studentInfo = req.body;
    let temp2 = studentInfo.rollno;
    let temp3 = temp2.toUpperCase();
    console.log('Name:', studentInfo.name);
    console.log('Roll No:', temp3);
    console.log('Programme:', studentInfo.course);
    console.log('Semester:', studentInfo.semester);

    Restrictions.find({
        course: studentInfo.course,
        sem: studentInfo.semester
    }, function (req, max) {
        console.log('max:', max)
        if (max.length == 0) {
            res.render('setconstrain');
        } else {
            maxElective = max[0].maxSelection;
            Registered.count({
                rollno: temp3
            }, function (err, count) {
                console.log('If Registered:', count);
                if (count > 0) {
                    res.redirect('/print/' + temp3);
                } else {
                    Electives.find({
                        course: studentInfo.course,
                        sem: studentInfo.semester
                    }, null, {
                        sort: {
                            slot: 1
                        }
                    }, function (err, result) {
                        //Electives.find({course:'btech', sem:5},'slot scode sname',function(err, result){
                        if (err) {
                            console.log(err);
                            res.render('blankreport');
                        } else if (result.length) {
                            //console.log('Max:',max);
                            res.render('electives', {
                                links: result,
                                secret: studentInfo,
                                max: maxElective
                            });
                        } else {
                            res.render('blankreport');
                        }
                    });
                }
            });
        }
    });
});


app.post('/registered', function (req, res) {
    let selectedOptions = req.body;
    let s_name;
    let s_rollno;
    console.log(selectedOptions);
    let length = Object.keys(selectedOptions).length;
    console.log('Elective Page Data Length:', length);
    length = (length - 4);
    Restrictions.find({
        course: selectedOptions.course,
        sem: selectedOptions.semester
    }, function (req, max) {
        if (max.length == 0) {
            res.render('setconstrain');
        } else if (max[0].maxSelection >= length) {
            //let allSlot = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
            let allSlot = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A+', 'H', 'H+', 'E+', 'F+', 'G+', 'C+', 'B+', 'E@', 'G@', 'D+', 'P', 'Q', 'R', 'S', 'T'];
            allSlot.forEach(function (value) {
                //console.log(selectedOptions[value]);
                //console.log('for each loop');
                if (typeof selectedOptions[value] !== "undefined") {
                    //console.log('if');

                    Registered.count({
                        rollno: selectedOptions.rollno,
                        slot: value
                    }, function (err, count) {
                        //console.log(count);
                        if (count == 0) {

                            Electives.findOne({
                                scode: selectedOptions[value],
                                slot: value
                            }, 'sname', function (req, res) {
                                //console.log('findone '+res);
                                s_name = res.sname;

                                let newRegistration = new Registered({
                                    scode: selectedOptions[value],
                                    sname: s_name,
                                    slot: value,
                                    name: selectedOptions.name,
                                    rollno: selectedOptions.rollno,
                                    course: selectedOptions.course,
                                    semester: selectedOptions.semester
                                });

                                Electives.findOne({
                                    scode: selectedOptions[value]
                                }, 'count', function (req, res) {
                                    console.log('electives count ' + res.count);
                                    //                    if (res.count > 0) {

                                    newRegistration.save(function (err, Student) {
                                        if (err) {
                                            res.send('Invalid Form');
                                        } else {
                                            console.log('SAVED');
                                            Electives.findOne({
                                                scode: selectedOptions[value],
                                                course: selectedOptions.course,
                                                sem: selectedOptions.semester
                                            }, 'scode count', function (req, res) {
                                                console.log('electives count ' + res.count);
                                                let temp = res.count;
                                                temp = temp - 1;
                                                console.log('temp = ', temp);
                                                console.log('scode = ', selectedOptions[value]);
                                                Electives.update({
                                                    scode: selectedOptions[value],
                                                    course: selectedOptions.course,
                                                    sem: selectedOptions.semester
                                                }, {
                                                    count: temp
                                                }, {
                                                    multi: true
                                                }, function (err, out) {
                                                    console.log(out);
                                                });
                                            });
                                        }

                                    });
                                    /*              }
                                                  else {
                                                    res.render('blankreport');
                                                  } */
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
            res.redirect('/print/' + selectedOptions.rollno);
        } else {
            res.render('maxelective');
        }
    });

});




app.get('/print/:rollno', function (req, res) {
    let temp = req.params.rollno.toUpperCase();
    Registered.find({
        rollno: temp
    }, function (err, response) {
        if (response.length != 0) {
            res.render('printreg', {
                print_data: response
            });
        } else {
            res.render('blankreport');
        }

        //res.json(response);
    });
});

app.get('/report/', function (req, res) {
    let scodeArray;
    let snameArray;
    let length;
    Electives.find().distinct('scode', function (error, scode) {
        //console.log(scode);
        scodeArray = scode;
        Electives.find().distinct('sname', function (err, sname) {
            snameArray = sname;
            res.render('reportlist', {
                scodes: scodeArray,
                snames: snameArray
            });
            for (var i = 0; i < sname.length; i++) {
                console.log(scodeArray[i], snameArray[i]);
            }
        });
    });
});

app.get('/report/:subject', function (req, res) {
    let temp = req.params.subject;
    //console.log(temp);
    Registered.find({
        scode: temp
    }, function (err, response) {
        console.log(response);
        console.log('Length:', response.length);
        if (response.length != 0) {
            res.render('reportprint', {
                reportData: response
            });
        } else {
            res.render('blankreport');
        }

    });
});

app.get('/sreport/', function (req, res) {
    Electives.find().distinct('sem', function (error, sem) {
        res.render('semreportselect', {
            semesters: sem
        });

    });
});


app.post('/sreport', function (req, res) {
    let semData = req.body;
    Registered.find({
        course: semData.course,
        semester: semData.semester
    }, function (err, response) {
        console.log(response);
        console.log('Length:', response.length);
        if (response.length != 0) {
            res.render('semreportprint', {
                reportData: response
            });
        } else {
            res.render('semblankreport');
        }

    });
});

app.get('/admin/', function (req, res) {
    Login.count(function (err, count) {
        if (count > 0) {
            res.render('login');
        } else {
            res.render('setadminpass');
        }
    });

});

app.post('/s_tapass', function (req, res) {
    let adminInfo = req.body;
    let newAdmin = new Login({
        uname: adminInfo.uname,
        password: adminInfo.password
    });
    newAdmin.save(function (err, admin) {
        console.log(err, admin);
        if (err) {
            res.send('Invalid Form');
        } else {
            console.log('SAVED');
            let message = "Admin User Added";
            res.render('login', {
                popupData: message
            });
        }
    });
});

app.post('/admin', function (req, res) {
    let adminInfo;
    adminInfo = req.body;
    console.log(req.body);
    Login.count({
        uname: adminInfo.uname,
        password: adminInfo.password
    }, function (err, count) {
        if (count > 0) {
            res.render('add-electives');
        } else {
            let message = "Incorrect Password!"
            res.render('login', {
                popupData: message
            });
        }
    });

});

app.get('/viewdb/', function (req, res) {
    Electives.find(function (err, result) {
        console.log(result);
        if (result.length != 0) {
            res.render('viewdb', {
                reportData: result
            });
        } else {
            res.render('blankreport');
        }

    });
});

app.post('/add-data', function (req, res) {
    let addElective = req.body;
    console.log(addElective);
    let newElective = new Electives({
        course: addElective.course,
        sem: addElective.semester,
        slot: addElective.slot,
        scode: addElective.scode,
        sname: addElective.sname,
        sfac: addElective.sfac,
        count: addElective.count,
        req: addElective.req
    });
    newElective.save(function (err, Student) {
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