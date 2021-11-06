//import modules
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
const https = require('https');
const { parse } = require('path');

//objects for the db
const dao = new AppDAO('./db/db/tinify.db');
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

//main file --> is the login view
//if there is a session redirect to the music view
app.get('/', function (req, res){
    if(req.session.loggedIn){
        req.session.touch();
        res.redirect("/swipe");
    } else {
        res.sendFile("index.html", {root: __dirname + "/src"}, function (err) {
            if (err) {res.send(err);}
        });
    }
});

//swipe file --> is the music view
//redirect to login view if there is no session
app.get('/swipe', function (req, res){
    if(req.session.loggedIn){
        req.session.touch();
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
    //login locked if more than 5 failed attempts in 5 minutes
    if(req.body.mail && req.body.password){
        const saltRounds = 10;
        userTable.getByMail(req.body.mail).then(
            function(data){
                if(data){
                    //check if user is logged because of to much login attempts
                    loginattemptTable.getCountYoungerThan(data.id,Date.now()-300000).then(
                        function(dataattempts){
                            if(dataattempts.count > 5){
                                res.status(403).json({"message":"to many failed attempts"});
                                loginattemptTable.deleteOlderThan(data.id,Date.now()-300000); //5min
                            } else {
                                //if the user isn't logged check the password
                                //but only send as return a internal error message so nobody can search for email adresses that are stored in the db by dummy requests
                                bcrypt.compare(req.body.password, data.password_hash, function(err, result) {
                                    if(err){
                                        res.status(500).json({"message":"internal error"});
                                    } else {
                                        if(result){
                                            req.session.loggedIn = true;
                                            req.session.user_id = data.id;
                                            res.status(200).json({"message":"login authorized"});
                                            loginattemptTable.deleteOlderThan(data.id,Date.now());
                                        } else {
                                            res.status(401).json({"message":"wrong credentials"});
                                            loginattemptTable.create(data.id,Date.now());
                                        }
                                    }
                                });
                            }
                        },
                        function(){
                            res.status(500).json({"message":"internal error"});
                        }
                    );
                } else {
                    res.status(401).json({"message":"wrong credentials"});
                }
            },
            function(data){
                res.status(500).json({"message":"internal error"});
            }
        );
    } else {
        res.status(400).json({"message":"wrong parameters"});
    }
});


//api call signup
//creates an user and returns a new session-cookie
app.post("/signup", function(req,res){
    //neccessary parameter: mail, password
    //password min length is 4 chars
    if(req.body.mail && req.body.password){

        const saltRounds = 10;
        const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

        //check the email address if it's a legal format
        if(emailRegexp.test(req.body.mail)){
            //check if the password has more than 4 chars
            if(req.body.password.length > 4){
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    if(err){
                        res.status(500).json({"message":"internal error"});
                    } else {
                        //create the user and return a new session cookie
                        userTable.create(hash, req.body.mail).then(
                            function(data){
                                req.session.loggedIn = true;
                                req.session.user_id = data.id;
                                optionsTable.create(data.id,0);
                                res.status(200).json({"message":"User created"});
                            },
                            function(data){
                                res.status(500).json({"message":"internal error"});
                            }
                        );
                    }
                });
            } else {
                res.status(400).json({"message":"password to short"});
            } 
        } else {
            res.status(400).json({"message":"no valid email-address"});
        }
    } else {
        res.status(400).json({"message":"wrong parameters"});
    }
});

//api call logout
//destroys the session cookie
app.post("/logout", function(req,res){
    req.session.destroy((err)=>{
        if(err){
            res.status(500).json({"message":"internal error"});
        } else {
            res.status(200).json({"message":"successful logout"});
        }
    });
});

//api call connected
//checks if the user has a refresh token
//if not send back a url to the spotify login to login into spotify
app.post("/user/connected", function(req,res){
    //only session cookie is neccessary
    if(req.session.loggedIn){
        refreshTable.getByUser(req.session.user_id).then(
            function(data){
                if(data){
                    res.status(200).json({"connected":true});
                } else {
                    const PORT = process.env.PORT || 3000;
                    const CLIENTID = process.env.CLIENTID;
                    const DOMAIN = process.env.DOMAIN || "localhost";
                    const PROTOCOL = process.env.PROTOCOL || "http";
                    const EXTERNALPORT = process.env.EXTERNALPORT || PORT;
                    res.status(200).json({"connected":false,"link":"https://accounts.spotify.com/authorize?response_type=code&client_id="+CLIENTID+"&scope=playlist-modify-private%20playlist-read-private%20user-top-read&redirect_uri="+PROTOCOL+"://"+DOMAIN+":"+EXTERNALPORT+"/set/refreshtoken"});
                }
            },
            function (){
                res.status(500).json({"message":"internal error"});
            }
        );
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//this api call is only used by the spotify api to set the refresh token
app.get("/set/refreshtoken", function(req,res){
    //only session cookie is neccessary & only works if response from a spotify login attempt
    if(req.session.loggedIn){
        if(req.query.code){
            const PORT = process.env.PORT || 3000;
            const EXTERNALPORT = process.env.EXTERNALPORT || PORT;
            const CLIENTID = process.env.CLIENTID;
            const CLIENTSECRET = process.env.CLIENTSECRET;
            const DOMAIN = process.env.DOMAIN || "localhost";
            const PROTOCOL = process.env.PROTOCOL || "http";

            //spotify returns only a auth_token, so ask for a refresh token with the auth_token
            let data = `${encodeURI('grant_type')}=${encodeURI('authorization_code')}&${encodeURI('code')}=${encodeURI(req.query.code)}&${encodeURI('redirect_uri')}=${encodeURI(PROTOCOL+"://"+DOMAIN+":"+EXTERNALPORT+"/set/refreshtoken")}`;
            let appidentification = btoa(CLIENTID+":"+CLIENTSECRET);
            const options = {
                hostname: 'accounts.spotify.com',
                port: 443,
                path: '/api/token',
                method: 'POST',
                headers: {
                'Authorization': 'Basic '+appidentification,
                'Content-Type': 'application/x-www-form-urlencoded'
            }};

            //thats the way to get the data from the call and and the refresh token to the db
            new Promise(function(resolve, reject) {
                const access_refresh = https.request(options, res_acc => {
                    let responseBody = '';

                    res_acc.on('data', d => {responseBody = responseBody + d;});
                    res_acc.on('end', function () {
                        const parsedBody = JSON.parse(responseBody + '');
                        if(res_acc.statusCode == 200){
                            refreshTable.create(req.session.user_id,parsedBody.refresh_token);
                            resolve();
                        }
                    });
                });
                
                access_refresh.write(data);
                access_refresh.end();
                access_refresh.on('error', error => {
                    reject();
                });
            }).then(
                //always go back to the music view after the redirect to spotify an back
                function(){
                    res.redirect("/swipe");
                },
                function(){
                    res.redirect("/swipe");
                }
            );
        } else {
            res.redirect("/swipe");
        }
    } else {
        res.redirect("/swipe");
    }
});

//api call for a new accesstoken
//backend is in charge of it because this has to be done with a clientid & secret that nobody should know
app.get("/get/accesstoken", function(req,res){
    //return data is a json object with token and time to live
    if(req.session.loggedIn){
        const CLIENTID = process.env.CLIENTID;
        const CLIENTSECRET = process.env.CLIENTSECRET;

        refreshTable.getByUser(req.session.user_id).then(
            function(datarefreshResponse){
                if(datarefreshResponse){
                    //request the new access token
                    let data = `${encodeURI('grant_type')}=${encodeURI('refresh_token')}&${encodeURI('refresh_token')}=${encodeURI(datarefreshResponse.refresh_token)}`;
                    let appidentification = btoa(CLIENTID+":"+CLIENTSECRET);
                    const options = {
                        hostname: 'accounts.spotify.com',
                        port: 443,
                        path: '/api/token',
                        method: 'POST',
                        headers: {
                        'Authorization': 'Basic '+appidentification,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }};
            
                    //get the spotify stream of data and parse it
                    new Promise(function(resolve, reject) {
                        const access_refresh = https.request(options, res_acc => {
                            let responseBody = '';
            
                            res_acc.on('data', d => {responseBody = responseBody + d;});
                            res_acc.on('end', function () {
                                const parsedBody = JSON.parse(responseBody + '');
                                if(res_acc.statusCode == 200){
                                    resolve(parsedBody);
                                }
                            });
                        });
                        
                        access_refresh.write(data);
                        access_refresh.end();
                        access_refresh.on('error', error => {
                            reject();
                        });
                    }).then(
                        function(data){
                            //return the access token to the user and if there was a new refresh token replace the old one in the db
                            let expireDate = Date.now() + data.expires_in * 1000;
                            if(data.hasOwnProperty("refresh_token")){
                                refreshTable.update(req.session.user_id,data.refresh_token);
                            }
                            res.status(200).json({"access_token":data.access_token,"expires":expireDate});
                        },
                        function(){
                            res.status(500).json({"message":"internal error"});
                        }
                    );
                } else {
                    res.status(500).json({"message":"internal error"});
                }
            },
            function(){
                res.status(500).json({"message":"internal error"});
            }
        );
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to dislike a song and add it to the db
//in the url add the song-id
app.post("/dislike/:id", function(req,res){
    if(req.session.loggedIn){
        if(req.params.id){
            dislikedTable.create(req.session.user_id, req.params.id).then(
                function(){
                    res.status(200).json({"message":"song added"});
                },
                function(){
                    res.status(500).json({"message":"internal error"});
                }
            );
        } else {
            res.status(40).json({"message":"missed song id"});
        }
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to lika a song and add it to the db
//in the url add the song-id
app.post("/like/:id", function(req, res){
    if(req.session.loggedIn){
        if(req.params.id){
            likedTable.create(req.session.user_id, req.params.id).then(
                function(){
                    res.status(200).json({"message":"song added"});
                },
                function(){
                    res.status(500).json({"message":"internal error"});
                }
            );
        } else {
            res.status(40).json({"message":"missed song id"});
        }
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to check if the song was review by a user
//in the url add the song-id
app.get("/reviewed/:id", function(req,res){
    if(req.session.loggedIn){
        if(req.params.id){
            //check if the song is in the liked table
            likedTable.getByUserAndSong(req.session.user_id, req.params.id).then(
                function(data){
                    if(data.count == 0){
                        //check if the song is in the disliked table
                        dislikedTable.getByUserAndSong(req.session.user_id, req.params.id).then(
                            function(data2){
                                if(data2.count == 0){
                                    //if it isn't in both tables then it's a new song
                                    res.status(200).json({"reviewed":false});
                                } else {
                                    res.status(200).json({"reviewed":true});
                                }
                            },
                            function(){
                                res.status(500).json({"message":"internal error"});
                            }
                        );
                    } else {
                        res.status(200).json({"reviewed":true});
                    }
                },
                function(){
                    res.status(500).json({"message":"internal error"});
                }
            );
        } else {
            res.status(40).json({"message":"missed song id"});
        }
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to delete a user accout
app.post("/delete", function(req,res){
    if(req.session.loggedIn){
        //first delete all liked songs
        likedTable.delete(req.session.user_id).then(
            function(){
                //second delete all disliked songs
                dislikedTable.delete(req.session.user_id).then(
                    function(){
                        //third delete all usersettings
                        optionsTable.delete(req.session.user_id).then(
                            function(){
                                //forth delete the spotify refresh token
                                refreshTable.delete(req.session.user_id).then(
                                    function(){
                                        //fifth delete all login attempts
                                        loginattemptTable.deleteOlderThan(req.session.user_id,Date.now()).then(
                                            function(){
                                                //sixth delete the user entry
                                                userTable.delete(req.session.user_id).then(
                                                    function(){
                                                        res.status(200).json({"message":"successful data deleted"});
                                                    },
                                                    function(){
                                                        res.status(500).json({"message":"internal error"});
                                                    }
                                                );
                                            },
                                            function(){
                                                res.status(500).json({"message":"internal error"});
                                            }
                                        );
                                    },
                                    function(){
                                        res.status(500).json({"message":"internal error"});
                                    }
                                );
                            },
                            function(){
                                res.status(500).json({"message":"internal error"});
                            }
                        );
                    },
                    function(){
                        res.status(500).json({"message":"internal error"});
                    }
                );
            },
            function(){
                res.status(500).json({"message":"internal error"});
            }
        );
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to return the settings to the caller
app.get("/setting", function(req, res){
    if(req.session.loggedIn){
        optionsTable.getByUser(req.session.user_id).then(
            function(data){
                if(data){
                    if(data.hasOwnProperty("suggestions")){
                        res.status(200).json({"suggestions":data.suggestions});
                    } else {
                        //if there is no entry just create a default entry
                        optionsTable.create(req.session.user_id,0);
                        res.status(200).json({"suggestions":0});
                    }
                } else {
                    optionsTable.create(req.session.user_id,0);
                    res.status(200).json({"suggestions":0});
                }
            },
            function(){
                res.status(500).json({"message":"internal error"});
            }
        );
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//api call to update the usersettings
app.post("/setting", function(req, res){
    if(req.session.loggedIn){
        if(req.body.suggestion == "recommended"){
            optionsTable.update(req.session.user_id,1).then(
                function(){
                    res.status(200).json({"suggestions":1});
                },
                function(){
                    res.status(500).json({"message":"internal error"});
                }
            );
        } else if (req.body.suggestion){
            //if the data isn't recommended just add the default option
            optionsTable.update(req.session.user_id,0).then(
                function(){
                    res.status(200).json({"suggestions":0});
                },
                function(){
                    res.status(500).json({"message":"internal error"});
                }
            );
        } else {
            res.status(400).json({"message":"wrong parameters"});
        }
    } else {
        res.status(401).json({"message":"no session cookie"});
    }
});

//webserver start
const PORT = process.env.PORT || 3000;
var server = app.listen(PORT, function(){
});