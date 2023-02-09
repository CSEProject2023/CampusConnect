var express = require('express')
var mysql = require("mysql")
const PDFDocument = require('pdfkit');
var path = require('path')
var app = new express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'static')));
app.get('/', function (req, res) {
  res.sendFile(__dirname+'/static/home.html')
})
app.get('/student_signup',function (req, res) {
  res.sendFile(__dirname+'/static/student_signup.html')
})
app.get('/admin_signup',function (req, res) {
  res.sendFile(__dirname+'/static/admin_signup.html')
})
app.get('/admin_login',function (req, res) {
  res.sendFile(__dirname+'/static/admin_login.html')
})
app.get('/student_login',function (req, res) {
  res.sendFile(__dirname+'/static/student_login.html')
})

// DB connection
var mysql = require('mysql2');

const { createPool } = require('mysql2');
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "campusconnect"
});


// registration DB changes
app.post('/student_signup',function(req,res,next){
   var userName=req.body.student_username;
    var email=req.body.student_email;
    var pwd=req.body.student_password;
    var c_pwd=req.body.student_confirm_Password;
    pool.query(`insert into user_credentials (email_id,username
    ,password)values (?,?,?)`,[email,userName,pwd],function(err,result){
      if(err){
        return console.log(err);
      }
      return res.sendFile(__dirname+'/static/student_login.html')
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
      return res.redirect('/student_profile');
    }
    else{
        res.status(401).json({ error: 'Incorrect username or password' });
        return res.sendFile(__dirname+'/static/student_login.html');
    }
})
});
app.get('/student_profile',function (req, res) {
  res.sendFile(__dirname+'/static/student_profile.html')
})

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
