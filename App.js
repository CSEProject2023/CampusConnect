var express = require('express')
const { createPool } = require('mysql2');
const cookie = require('cookie-parser');
const PDFDocument = require('pdfkit');
var path = require('path')
const session = require('express-session');
const crypto = require('crypto');
const uuidv4 = require('uuid').v4;
var bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var isAuthenticated = false;
var user ;




var app = new express();






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
app.get('/student_profile',function (req, res) {
  if(!isAuthenticated){
    res.render('student_login', { togglePopup : true, message: 'You need to login first' });
  }
  else{
  console.log("in profile route")
  res.render('student_profile', { name:user[0]["username"]});
  return;
  }
})


// DB connection

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "campusconnect"
});


// registration DB changes
app.post('/student_signup',function(req,res,next){
   var username=req.body.student_username;
    var email=req.body.student_email;
    var pwd=req.body.student_password;
    pool.query(`insert into user_credentials (email_id,username
    ,password)values (?,?,?)`,[email,userName,pwd],function(err,result){
      if(err){
        return console.log(err);
      }
      return res.redirect('/student_login');
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
       const sessionId = uuidv4();
        sessions[sessionId]={email,userId:1}
        console.log(sessionId);
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
// function userFunc(){
//   console.log('user',user);
// }
// setInterval(userFunc, 10000 );


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
