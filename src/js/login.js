//init all necessary elemets if the side is fully loaded
window.onload = function () {
    initPopups();
    initLogin();
    initSignUp();
};

//adds the eventlistener for the login button
function initLogin(){
    document.getElementById("login-button").addEventListener("click",login);
}

//adds the eventlistener for the signup button
function initSignUp(){
    document.getElementById("sign-up-button").addEventListener("click",signup);
}

//function to get the session-id-cookie from the api
function login(){
    let email = document.getElementById("login-email-input");
    let password = document.getElementById("login-password-input");
    let messagebox = document.getElementById("login-form-error-message");

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    //check if the email is in the format of an email
    if(emailRegexp.test(email.value)){
        //checks if the password is longer then 4 chars
        if(password.value.length > 4){
            messagebox.innerText = "";

            //request the session-id-cookie
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4){
                    if(this.status == 200) {
                        //redirect to mainview if there is a session-cookie
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

//function to sign-up a user
function signup(){
    let email = document.getElementById("sign-up-email");
    let password = document.getElementById("sign-up-password");
    let messagebox = document.getElementById("login-popup-error-message");

    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    //checks if the email is in a allowed format
    if(emailRegexp.test(email.value)){
        //checks if the password is more then 4 chars
        if(password.value.length > 4){
            messagebox.innerText = "";

            //request to create an user and login automatic
            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4){
                    if(this.status == 200) {
                        //redirect to mainview if there is an session cookie
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