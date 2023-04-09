var express = require('express')
const { createPool } = require('mysql2');
const cookie = require('cookie-parser');
const PDFDocument = require('pdfkit');
var fs=require('fs');
var path = require('path')
const session = require('express-session');
const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mime = require('mime');
var isAuthenticated = true;
var user, admin,personal_data,ed_details,projects,internships;
var app = new express();
let project_details,intern_details;
// DB connection

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "campusconnect"
});


const sessions={};
const secret = crypto.randomBytes(32).toString('hex');
app.use(cookieParser());
app.use(session({
  genid: () => {
    return uuidv4(); // Use UUIDv4 as the session ID generator
  },
  secret: secret, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));
app.use('/js', function(req, res, next) {
  res.type('text/javascript');
  next();
});

app.use(express.static(path.join(__dirname, 'views/js')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'static')));
app.set('view engine', 'ejs');
app.get('/', function (req, res) {
  res.sendFile(__dirname+'/static/home.html')
})
app.get('/student_signup',function (req, res) {
  res.sendFile(__dirname+'/static/student_signup.html')
})
app.get('/admin_signup',function (req, res) {
  res.sendFile(__dirname+'/static/admin_signup.html');
})
app.get('/admin_login',function (req, res) {
  res.render('admin_login', { togglePopup : true, message: '' });
})
app.get('/student_login',function (req, res) {
  res.render('student_login', { togglePopup : true, message: '' });
})
function profile_data(req,res){
  if(!isAuthenticated){
    res.render('student_login', { togglePopup : true, message: 'You need to login first' });
  }
  else{
    pool.query(`select project from projects where id=(?)`,[user[0].email_id],function(err,result,fields){
    if (err) {
      console.log(err);
    }
    else if(result.length > 0){
      console.log("project_details", result);
      project_details= JSON.parse(result[0].project);
    }
  });
  pool.query(`select internship from internships where id=(?)`,[user[0].email_id],function(err,result,fields){
    if (err) {
      return reject(err);
    }
    else if(result.length > 0){
      intern_details =  JSON.parse(result[0].internship);
    }
  });
     const personalDetailsPromise = new Promise((resolve, reject) => {
  pool.query(`select * from student_personal_details where id=(?)`,[user[0].email_id],function(err,result,fields){
    if (err) {
      return reject(err);
    }
    else if(result.length > 0){
      const personal_data = result[0];
      resolve(personal_data);
    }
  });
});

const edDetailsPromise = new Promise((resolve, reject) => {
  pool.query(`select * from student_ed_details where id=(?)`,[user[0].email_id],function(err,result,fields){
    if (err) {
      return reject(err);
    }
    else if(result.length > 0){
      const ed_details = result[0];
      resolve(ed_details);
    }
  });
});


Promise.all([personalDetailsPromise, edDetailsPromise])
  .then(([personal_data, ed_details]) => {
    console.log("project_details",project_details,"intern_details",intern_details);
      res.render('student_profile', { name:user[0].username,personal_data:personal_data,ed_details:ed_details,intern:intern_details,projects:project_details});
  })
  .catch((err) => {
    console.log(err);
  });
  }
}
app.get('/student_profile',profile_data);

app.get('/admin_profile',function (req, res) {
  if(!isAuthenticated){
    res.render('admin_login', { togglePopup : true, message: 'You need to login first' });
  }
  else{
  res.render('admin_profile', { name:admin[0]["username"]});
  return;
  }
})


// registration DB changes
app.post('/student_signup',function(req,res,next){
   var username=req.body.student_username;
    var email=req.body.student_email;
    var pwd=req.body.student_password;
    pool.query(`insert into user_credentials (email_id,username
    ,password)values (?,?,?)`,[email,username,pwd],function(err,result){
      if(err){
        return console.log(err);
      }
      return res.redirect('/student_login');
    })
});

app.post('/admin_signup',function(req,res,next){
   var username=req.body.admin_username;
    var email=req.body.admin_email;
    var pwd=req.body.admin_password;
    pool.query(`insert into admin_credentials (email_id,username
    ,password)values (?,?,?)`,[email,username,pwd],function(err,result){
      if(err){
        return console.log(err);
      }
      return res.redirect('/admin_login');
    })
});

app.post('/student_login',function(req,res,next){
  var email = req.body.email;
  var password = req.body.pass;
  pool.query(`select * from user_credentials where email_id=(?) and password=(?)`,[email,password],function(err,result,fields){
    if (err) {
        return console.log(err);
    }
    else if(result.length > 0){
      //  const sessionId = uuidv4();
      //   sessions[sessionId]={email,userId:1}
      //   console.log(sessionId);
       user = result;  
       isAuthenticated=true;
      res.redirect('/student_profile');
  }
    else{
       res.render('student_login', { togglePopup : true, message: 'Invalid username or password' });
      return;
    }
})
});

app.post('/admin_login',function(req,res,next){
  var email = req.body.admin_user;
  var password = req.body.admin_password;
  pool.query(`select * from admin_credentials where email_id=(?) and password=(?)`,[email,password],function(err,result,fields){
    if (err) {
        return console.log(err);
    }
    else if(result.length > 0){
      const sessionId = uuidv4();
      sessions[sessionId]={email,userId:1}
      console.log(sessionId);
       admin = result;
       isAuthenticated=true;
      res.redirect('/admin_profile');
  }
    else{
       res.render('admin_login', { togglePopup : true, message: 'Invalid username or password' });
      return;
    }
})
});
// function userFunc(){
//   console.log('user',user);
// }
// setInterval(userFunc, 10000 );

app.post('/saveDetails',(req,res)=>{
  //console.log(req.body);
   var firstname = req.body.fname;
  var lastname = req.body.lname;
  var dob=req.body.dob;
  var gender = req.body.gender;
  var aadhaar = req.body.aadhaar;
  var father_name = req.body.father_name;
  var mother_name = req.body.mother_name;
  var parent_phone = req.body.parent_phone;
  var email = req.body.email;
  var phone = req.body.phone;
  var address = req.body.address;

  var reg_no = req.body.reg_no;
    var uni_name = req.body.uni_name;
    var univ_course = req.body.univ_course;
    var ug_board = req.body.ug_board;
    var univ_start_year = req.body.univ_start_year;
    var univ_end_year = req.body.univ_end_year;
    var univ_cgpa = req.body.univ_cgpa;
    
    var clg_name = req.body.clg_name;
    var clg_course = req.body.clg_course;
    var clg_board = req.body.clg_board;
    var clg_start_year = req.body.clg_start_year;
    var clg_end_year = req.body.clg_end_year;
    var clg_cgpa = req.body.clg_cgpa;
    
    var scl_name = req.body.scl_name;
    var yop = req.body.yop;
    var scl_cgpa = req.body.scl_cgpa;
    var scl_board = req.body.scl_board;

    var skills = req.body.skills;
    var certificates = req.body.certificates;
    var projects = [];
    var project_titles=[];
    var project_des=[];
    project_titles.push(req.body.title);
    project_des.push(req.body.description);
    for (var i = 0; i < project_titles[0].length; i++) {
      var project = {
        title: project_titles[0][i],
        description: project_des[0][i]
      };
      projects.push(project);
  }
   var internships = [];
   var job_titles=[];
   var job=[];
    job_titles.push(req.body.company);
    job.push(req.body.jobDesc);
    for (var i = 0; i < job_titles[0].length; i++) {
      var intern = {
        company: job_titles[0][i],
        jobDesc: job[0][i]
      };
      internships.push(intern);
  }
  console.log(projects,internships);
  pool.query(`select * from student_personal_details where id=?`,[user[0].email_id],function(err,result,fields){
    if (err) {
        return console.log(err);
    }
    else if(result.length == 0){
      //console.log("result",result);
       pool.query(`insert into student_personal_details (id,firstname,lastname,dob,gender,aadhaar,father,mother,parent_phone,email,phone,address)values (?,?,?,?,?,?,?,?,?,?,?,?)`,[user[0].email_id, firstname,lastname,dob,gender,aadhaar,father_name,mother_name,parent_phone,email,phone,address],function(err,result){
      if(err){
        return console.log(err);
      }
    });
     pool.query(`insert into student_ed_details (id,reg_no,uni_name,univ_course,ug_board,univ_start_year,univ_end_year,univ_cgpa,clg_name,clg_course,clg_board,clg_start_year,clg_end_year,clg_cgpa,scl_name,yop,scl_cgpa,scl_board,skills,certi)values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,[user[0].email_id,reg_no,uni_name,univ_course,ug_board,univ_start_year,univ_end_year,univ_cgpa,clg_name,clg_course,clg_board,clg_start_year,clg_end_year,clg_cgpa,scl_name,yop,scl_cgpa,scl_board,skills,certificates],function(err,result){
      if(err){
        return console.log(err);
      }
    }); 
    // insert projects
    pool.query(`insert into projects (id, project)`,[user[0].email_id,JSON.stringify(projects)],function(err,result){
      if(err){
        return console.log(err);
      }
    }); 
    //insert internships
     pool.query(`insert into internships (id, internship)`,[user[0].email_id,JSON.stringify(internships)],function(err,result){
      if(err){
        return console.log(err);
      }
    }); 


  }
    else{
      pool.query(`UPDATE student_personal_details SET firstname=?, lastname=?, dob=?, gender=?, aadhaar=?, father=?, mother=?, parent_phone=?, email=?, phone=?, address=? WHERE id=?`,[firstname,lastname,dob,gender,aadhaar,father_name,mother_name,parent_phone,email,phone,address,user[0].email_id],function(err,result){
      if(err){
        return console.log(err);
      }
    });
      
    pool.query(`UPDATE student_ed_details SET reg_no=?, uni_name=?, univ_course=?, ug_board=?, univ_start_year=?, univ_end_year=?, univ_cgpa=?, clg_name=?, clg_course=?, clg_board=?, clg_start_year=?, clg_end_year=?, clg_cgpa=?, scl_name=?, yop=?, scl_cgpa=?, scl_board=?, skills=?, certi=? WHERE id=?`,[reg_no,uni_name,univ_course,ug_board,univ_start_year,univ_end_year,univ_cgpa,clg_name,clg_course,clg_board,clg_start_year,clg_end_year,clg_cgpa,scl_name,yop,scl_cgpa,scl_board,skills,certificates,user[0].email_id],function(err,result){
      if(err){
        return console.log(err);
      }
    })

     pool.query(`UPDATE projects SET project=? where id=?`,[JSON.stringify(projects),user[0].email_id],function(err,result){
      if(err){
        return console.log(err);
      }
    }); 

     pool.query(`UPDATE internships SET internship=? where id=?`,[JSON.stringify(internships),user[0].email_id],function(err,result){
      if(err){
        return console.log(err);
      }
    }); 
      
    }
})
    res.redirect('/student_profile');
});
 
  
app.get('/search',function(req,res){
    var search_item = req.query.q;
   pool.query(`
    SELECT 
      user_credentials.email_id, 
      projects.project, 
      internships.internship, 
      student_personal_details.*, 
      student_ed_details.*
    FROM 
      user_credentials 
      LEFT JOIN projects ON user_credentials.email_id = projects.id
      LEFT JOIN internships ON user_credentials.email_id = internships.id
      LEFT JOIN student_personal_details ON user_credentials.email_id = student_personal_details.id
      LEFT JOIN student_ed_details ON user_credentials.email_id = student_ed_details.id
    WHERE 
      user_credentials.username = ?
  `, [search_item], function(err, result) {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        const user = result[0];
        const project_details = JSON.parse(user.project || null);
        const intern_details = JSON.parse(user.internship || null);
        const personal_data = result[0];
        const ed_details = result[0];
        res.render('admin_view', {personal_data:personal_data,ed_details:ed_details,intern:intern_details,projects:project_details});
      }
    }
  });
});
   




app.get('/generate-pdf', (req, res) => {

  const query = 'SELECT * FROM table_name';

  connection.query(query, (error, results) => {
    if (error) throw error;
    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');

    res.setHeader('Content-Disposition', 'attachment; filename="data.pdf"');

    doc.pipe(res);

    results.forEach(row => {
      Object.keys(row).forEach(key => {
        doc.text(`${key}: ${row[key]}`);
      });
      doc.addPage();
    });
    
    // End the PDF data stream
    doc.end();
  });
});

app.listen(3000);
