window.onload = function () {
    initPopups();
    initLogout();
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