function logFirebaseData() {
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    let database = firebase.database();
    
    database.ref().on("value", function(data) {
        console.log(data);
    });
}

function verifyPasswordValidity(passwordConfirm) {
    if(passwordConfirm.value != $("#password").val()) {
        console.log("Non-Matching Passwords");
        passwordConfirm.setCustomValidity("Make sure the passwords match!");
    }
    else {
        console.log("Matching Passwords");
        passwordConfirm.setCustomValidity("");
    }
}

function verifyUsernameValidity(usernameInfo) {
    let database = firebase.database();
    
    database.ref(usernameInfo.value).on("value", function(data) {
        console.log(data);
        if(typeof data === "undefined") {
            console.log("undefined");
            usernameInfo.setCustomValidity("");
        }
        else if(data === null) {
            console.log("null");
            usernameInfo.setCustomValidity("");
        }
        else if(data !== null) {
            console.log("User Already Exists Within Database");
            usernameInfo.setCustomValidity("Username already exists!");
        }
    });
}

async function processUserInformation() {
    event.preventDefault();
    
    let formInput = $("#signup-form").serializeArray();
    console.log(formInput);
    
    let user = formInput[0].value;
    console.log(user);
    
    let password = formInput[2].value;
    console.log(password);
    
    await addUserToFirebase(user, password);
    
    placeUserIntoSessionStorage(formInput[0].value);
    
    $(".body").removeClass("body");
    
    location.href = "overview.html";
}

function addUserToFirebase(user, password) {
    console.log("user - " + user);
    console.log("password - " + password);
    
    let userExists;
    
    let database = firebase.database();
    
    database.ref(user).on("value", function(data) {
        console.log(data);
        if(data === null) {
            userExists = false;
        }
        else {
            userExists = true;
        }
        console.log(data);
    });
    
    if(!userExists) {
        database.ref(user).set({
            password: password,
            totalShares: 0,
            accountBalance: 0
        });
    }
    
    database.ref().on("value", function(data) {
        console.log(data);
    });
}

function placeUserIntoSessionStorage(user) {
    if(sessionStorage.user) {
        sessionStorage.clear();
    }
    sessionStorage.setItem("user", JSON.stringify(user));
}
