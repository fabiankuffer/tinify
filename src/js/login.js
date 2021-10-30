window.onload = function () {
    initPopups();
    initLogin();
    initSignUp();
};

function initLogin(){
    document.getElementById("login-button").addEventListener("click",login);
}

function initSignUp(){
    document.getElementById("sign-up-button").addEventListener("click",signup);
}

function login(){
    let email = document.getElementById("login-email-input");
    let password = document.getElementById("login-password-input");
    let messagebox = document.getElementById("login-form-error-message");

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if(emailRegexp.test(email.value)){
        if(password.value.length > 4){
            messagebox.innerText = "";

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4){
                    if(this.status == 200) {
                        window.location.href = "/swipe";
                    } else {
                        let response = JSON.parse(xhttp.responseText);
                        messagebox.innerText = response.message;
                    }
                }
            };
            xhttp.open("post", "/login", true);
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify({ "mail": email.value, "password": password.value}));

        } else {
            messagebox.innerText = "password is to short";
        }
    } else {
        messagebox.innerText = "invalid email-address";
    }
}

function signup(){
    let email = document.getElementById("sign-up-email");
    let password = document.getElementById("sign-up-password");
    let messagebox = document.getElementById("login-popup-error-message");

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if(emailRegexp.test(email.value)){
        if(password.value.length > 4){
            messagebox.innerText = "";

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4){
                    if(this.status == 200) {
                        window.location.href = "/swipe";
                    } else {
                        let response = JSON.parse(xhttp.responseText);
                        messagebox.innerText = response.message;
                    }
                }
            };
            xhttp.open("post", "/signup", true);
            xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhttp.send(JSON.stringify({ "mail": email.value, "password": password.value}));

        } else {
            messagebox.innerText = "password is to short";
        }
    } else {
        messagebox.innerText = "invalid email-address";
    }
}