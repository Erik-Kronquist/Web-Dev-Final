$("#login-header-button").on("click", function() {
    location.href = "login.html";
});

$("#signup-header-button").on("click", function() {
    location.href = "signup.html";
});

$("#logout-header-button").on("click", function() {
    sessionStorage.clear();
    location.href = "index.html";
});

function checkIfPageRefreshed() {
    const pageAccessedByReload = (
        (window.performance.navigation && window.performance.navigation.type === 2) ||
            window.performance
                .getEntriesByType('navigation')
                .map((nav) => nav.type)
                .includes('reload')
    );
    
    alert(pageAccessedByReload);
}

function checkSessionStorageForUser() {
    if(!(sessionStorage.user)) {
        location.href = "index.html";
    }
}
