var express = require('express')
var mysql = require("mysql")
var path = require('path')
var app = new express();
app.use(express.static(path.join(__dirname, 'public')));
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
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "yourusername",
  password: "yourpassword"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
app.listen(3000);
