//calls the tinify-api to check if the song_id is a new song that wasn't reviewed
//returns a promise reselove if this song isn't in the db
function checkReviewed(song_id){
    return new Promise(function(resolve,reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    if(response.reviewed == true){
                        reject();
                    } else {
                        resolve();
                    }
                } else {
                    reject();
                }
            }
        };
        xhttp.open("get", "/reviewed/"+encodeURI(song_id), true);
        xhttp.send();
    });
}

//calls the tinify-api to add the song-id to the dislike-db
//return is a promise
function addDislike(song_id){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("post", "/dislike/"+encodeURI(song_id), true);
        xhttp.send();
    });
}

//calls the tinify-api to add the song-id to the liked-db
//return is a promise
function addLike(song_id){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("post", "/like/"+encodeURI(song_id), true);
        xhttp.send();
    });
}

//function to logout the user und destroy all session-cookies and the spotify access token in the localstorage
function logout(){
    localStorage.removeItem("accesstoken");   
    localStorage.removeItem("expireDate");
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4){
            if(this.status == 200) {
                window.location.href = "/";
            } else {
                displayInSnackbar("internal Tinify error");
            }
        }
    };
    xhttp.open("post", "/logout", true);
    xhttp.send();
}

//calls the tinify api to check if there is an refresh token in the db -> information to check if the user has logged in into spotify
//return is a new promise and it will display the music-cart or the login to spotify informations or an error if there was one in the login process
function checkConnected(){
    return new Promise(function(resolve,reject){
        let spotifyLogin = document.getElementById("swipe-login-spotify");
        let cart = document.getElementById("swipe-cart-container");
        let spotifyButton = document.getElementById("spotify-login-button");
    
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText);
                    if(response.connected){
                        spotifyLogin.style.display = "none";
                        cart.style.display = "block";
                        resolve();
                    } else {
                        spotifyLogin.style.display = "block";
                        spotifyButton.addEventListener("click",function(){
                            window.location.href = response.link;
                        });
                        cart.style.display = "none";
                        reject();
                    }
                } else {
                    spotifyLogin.style.display = "block";
                    cart.style.display = "none";
                    spotifyLogin.innerText = "An error occured please reload the site";
                    reject();
                }
            }
        };
        xhttp.open("post", "/user/connected", true);
        xhttp.send();
    });
}

//calls the tinify-api to delete the useraccount
//returns a promise
function deleteRequest(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("post", "/delete", true);
        xhttp.send();
    });
}

//calls the tinify-api to get a new access token
//the new token is stored in the localstorage so the client search for new music and so on
//return a promise
function requestAccessToken(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText); 
                    localStorage.setItem("accesstoken", response.access_token);
                    localStorage.setItem("expireDate", response.expires);
                    resolve();
                } else {
                    reject();
                }
            }
        };
        xhttp.open("get", "/get/accesstoken", true);
        xhttp.send();
    });
}

//calls the tinify-api to update the user preferences
//it also updates an internal var for spotify call so that only the right songs will be selected
function updateRecommendation(song_type){
    let data;
    if(song_type == "all"){
        data = JSON.stringify({"suggestion":"all"});
        recommendation = 0;
    } else if(song_type == "recommended") {
        data = JSON.stringify({"suggestion":"recommended"});
        recommendation = 1;
    } else {
        return;
    }
    displayInSnackbar("Recommendation modified");
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4){
            if(this.status != 200){
                displayInSnackbar("internal Tinify error");
            }
        }
    };
    xhttp.open("post", "/setting", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(data);
    getValidSong();
}

//calls the tinify-api to get the user-options from the db
//stores the information in a local var
//return a promise
function loadRecommendation(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText);
                    if(response.hasOwnProperty("suggestions")){
                        recommendation = response.suggestions;
                        resolve();
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            }
        };
        xhttp.open("get", "/setting", true);
        xhttp.send();
    });
}