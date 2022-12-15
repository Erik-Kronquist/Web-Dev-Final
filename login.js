function logFirebaseData() {
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    let database = firebase.database();
    
    database.ref().on("value", function(data) {
        console.log(data);
    });
}

function processLoginInformation() {
    event.preventDefault();
    
    let formInput = $("#login-form").serializeArray();
    
    let validity = compareUserDataToFirebaseData(formInput);
    
    console.log(formInput[0].value);
    console.log(formInput[1].value);
    
    console.log("Hello World!");
}

function compareUserDataToFirebaseData(formInput) {
    let database = firebase.database();
    
    database.ref().on("value", function(data) {
        console.log(data);
        try {
            if(data[formInput[0].value]["password"] == formInput[1].value) {
                placeUserIntoSessionStorage(formInput[0].value);
                
                location.href = "overview.html";
                return true;
            }
            else {
                showPopupDisplay();
                return false;
            }
            console.log(data[formInput[0].value]["password"]);
        }
        catch(error) {
            console.error(error);
            showPopupDisplay();
            return false;
        }
    });
}

function placeUserIntoSessionStorage(user) {
    if(sessionStorage.user) {
        sessionStorage.clear();
    }
    sessionStorage.setItem("user", JSON.stringify(user));
}

function showPopupDisplay() {
    if($("#alert-popup").hasClass("d-none")) {
        $("#alert-popup").removeClass("d-none");
    }
}

function hidePopupDisplay() {
    if(!($("#alert-popup").hasClass("d-none"))) {
        $("#alert-popup").addClass("d-none");
    }
}
