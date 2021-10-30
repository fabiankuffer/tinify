window.onload = function () {
    initPopups();
    initLogout();
    checkIfConnected();
};

function initLogout(){
    document.getElementById("swipe-popup-logout").addEventListener("click", logout);
}

function logout(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4){
            if(this.status == 200) {
                window.location.href = "/";
            }
        }
    };
    xhttp.open("post", "/logout", true);
    xhttp.send();
}

function checkIfConnected(){
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
                } else {
                    spotifyLogin.style.display = "block";
                    spotifyButton.addEventListener("click",function(){
                        window.location.href = response.link;
                    });
                    cart.style.display = "none";
                }
            } else {
                spotifyLogin.style.display = "block";
                cart.style.display = "none";
                spotifyLogin.innerText = "An error occured please reload the site";
            }
        }
    };
    xhttp.open("post", "/user/connected", true);
    xhttp.send();
}