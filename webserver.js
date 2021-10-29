var express=require('express');
const AppDAO = require('./db/dao');
const dislikedRepo = require('./db/disliked-Repo');
const likedRepo = require('./db/liked-Repo');
const loginattemptRepo = require('./db/login-attempts-Repo');
const optionsRepo = require('./db/options-Repo');
const refreshRepo = require('./db/refresh-Repo');
const userRepo = require('./db/user-Repo');

const dao = new AppDAO('./db/tinify.db');
const dislikedTable = new dislikedRepo(dao);
const likedTable = new likedRepo(dao);
const loginattemptTable = new loginattemptRepo(dao);
const optionsTable = new optionsRepo(dao);
const refreshTable = new refreshRepo(dao);
const userTable = new userRepo(dao);

var app = express();

//create db
userTable.createTable()
    .then(() => dislikedTable.createTable())
    .then(() => likedTable.createTable())
    .then(() => loginattemptTable.createTable())
    .then(() => optionsTable.createTable())
    .then(() => refreshTable.createTable())
    .catch((err) => {
      console.log('Error: ')
      console.log(JSON.stringify(err))});

//main file
app.get('/', function (req, res){
    res.sendFile("index.html", {root: __dirname + "/src"}, function (err) {
        if (err) {res.send(err);}
    });
});

//swipe file
app.get('/swipe', function (req, res){
    res.sendFile("swipe.html", {root: __dirname + "/src"}, function (err) {
        if (err) {res.send(err);}
    });
});

//css files
app.get('/css/:document.css', function(req, res){
    var docname = req.params.document+ ".css";
    var options = {
    root: __dirname + '/src/css',
    }
    res.sendFile(docname, options, function (err) {
     if (err) {res.send(err);}
   });
 });

 //js files
 app.get('/js/:document.js', function(req, res){
    var docname = req.params.document+ ".js";
    var options = {
    root: __dirname + '/src/js',
    }
    res.sendFile(docname, options, function (err) {
     if (err) {res.send(err);}
   });
 });

//assets favicons
app.use("/media/favicon", express.static(__dirname + '/src/media/favicon'));

//assets fonts
app.use("/media/fonts", express.static(__dirname + '/src/media/fonts'));

//assets icons
app.use("/media/icons", express.static(__dirname + '/src/media/icons'));


//rest-api
app.post("/login", function(req,res){});
app.post("/signup", function(req,res){});
app.post("/dislike/:id", function(req,res){});
app.post("/like/:id", function(req, res){});
app.post("/delete", function(req,res){});
app.post("/logout", function(req,res){});
app.put("/setting", function(req, res){});
app.get("/setting", function(req, res){});

//webserver start
var server = app.listen(3000, function(){
});