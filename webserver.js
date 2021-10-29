const express=require('express');
const AppDAO = require('./db/dao');
const dislikedRepo = require('./db/disliked-Repo');
const likedRepo = require('./db/liked-Repo');
const loginattemptRepo = require('./db/login-attempts-Repo');
const optionsRepo = require('./db/options-Repo');
const refreshRepo = require('./db/refresh-Repo');
const userRepo = require('./db/user-Repo');
const session = require('express-session');
const bcrypt = require ('bcrypt');

//objects for the db
const dao = new AppDAO('./db/tinify.db');
const dislikedTable = new dislikedRepo(dao);
const likedTable = new likedRepo(dao);
const loginattemptTable = new loginattemptRepo(dao);
const optionsTable = new optionsRepo(dao);
const refreshTable = new refreshRepo(dao);
const userTable = new userRepo(dao);

//express settings
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//session info
const SESSION_SECRET = process.env.SESSIONSECRET || 'VFmbeDizUqVQ70BTrc62qqjnTkJrZvUGwyag4bVbh89nGFp5OOiQtnCFXQqi';
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'SessionID',
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

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
    if(req.session.loggedIn){
        res.redirect("/swipe");
    } else {
        res.sendFile("index.html", {root: __dirname + "/src"}, function (err) {
            if (err) {res.send(err);}
        });
    }
});

//swipe file
app.get('/swipe', function (req, res){
    if(req.session.loggedIn){
        res.sendFile("swipe.html", {root: __dirname + "/src"}, function (err) {
            if (err) {res.send(err);}
        });
    } else {
        res.redirect("/");
    }
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
app.post("/login", function(req,res){
    //neccessary parameter: mail, password
    //bcrypt.compare(password, hash, function(err, result) {});
});
app.post("/signup", function(req,res){
    //neccessary parameter: mail, password
    if(req.body.mail && req.body.password){
        const saltRounds = 10;

        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(err){
                res.status(500).json({"message":"internal error"});
            } else {
                userTable.create(hash, req.body.mail).then(
                    function(data){
                        req.session.loggedIn = true;
                        req.session.user_id = data.id;
                        res.status(200).json({"message":"User created"});
                    },
                    function(data){
                        res.status(500).json({"message":"internal error"});
                    }
                );
            }
        });
    } else {
        res.status(400).json({"message":"wrong parameters"});
    }
});

app.post("/dislike/:id", function(req,res){});
app.post("/like/:id", function(req, res){});
app.post("/delete", function(req,res){});
app.post("/logout", function(req,res){
    req.session.destroy((err)=>{});
    res.redirect("/");
});
app.put("/setting", function(req, res){});
app.get("/setting", function(req, res){});

//webserver start
const PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function(){
});