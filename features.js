function displaySidebar() {
    if(sessionStorage.user) {
        $("#sidebar").removeClass("d-none");
        $("#main-carousel").addClass("col-sm-10");
        
        // <button type="button" class="btn btn-outline-light me-2" id="logout-header-button" onclick="logOut()">Log Out</button>
        let logoutButton = document.createElement("button");
        
        $(logoutButton).attr({
            type: "button",
            id: "logout-header-button",
            onclick: "logOut()"
        });
        $(logoutButton).addClass("btn btn-outline-light me-2");
        $(logoutButton).html("Log Out");
        
        $("#header-buttons").append(logoutButton);
    }
    else {
        $("#main-carousel").addClass("col-sm-12");
        
        // <button type="button" class="btn btn-outline-light me-2" id="login-header-button">Log In</button>
        // <button type="button" class="btn btn-warning" id="signup-header-button">Sign Up</button>
        let loginButton = document.createElement("button");
        let signupButton = document.createElement("button");
        
        $(loginButton).attr({
            type: "button",
            id: "login-header-button",
            onclick: "login()"
        });
        $(loginButton).addClass("btn btn-outline-light me-2");
        $(loginButton).html("Log In");
        
        $(signupButton).attr({
            type: "button",
            id: "signup-header-button",
            onclick: "signup()"
        });
        $(signupButton).addClass("btn btn-warning");
        $(signupButton).html("Sign Up");
        
        $("#header-buttons").append(loginButton);
        $("#header-buttons").append(signupButton);
    }
}

function logOut() {
    sessionStorage.clear();
    location.href = "index.html";
}

function login() {
    location.href = "login.html";
}

function signup() {
    location.href = "signup.html";
}
