var express = require('express')
var mysql = require("mysql")
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
  console.log("pwd",password);
  console.log("email",email);
  pool.query(`select password from user_credentials where email_id=(?)`,[email],function(err,result,fields){
    if (err) {
        return console.log(err);
    }
    else if(result[0]['password']==password){
      return res.sendFile(__dirname+'/static/studentprofile.html');}
    else{
        
        return res.sendFile(__dirname+'/static/login.html');}
})
});
app.listen(3000);
