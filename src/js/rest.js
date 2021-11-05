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

function updateRecommendation(song_type){
    let data;
    if(song_type == "all"){
        data = JSON.stringify({"suggestion":"all"});
    } else if(song_type == "recommended") {
        data = JSON.stringify({"suggestion":"recommended"});
    } else {
        return;
    }
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
}

function loadRecommendation(){
    return new Promise(function(resolve, reject){
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if(this.status == 200) {
                    let response = JSON.parse(xhttp.responseText);
                    if(response.suggestions){
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