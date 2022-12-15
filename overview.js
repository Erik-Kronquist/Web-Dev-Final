function logFirebaseData() {
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    let database = firebase.database();
    
    database.ref().on("value", function(data) {
        console.log(data);
    });
}

function saveStockTicker(stockTicker) {
    sessionStorage.setItem("stockTicker", JSON.stringify(stockTicker));
    
    location.href = "stocks.html";
}

function processSearchForm() {
    event.preventDefault();
    
    console.log("searchForStock()");
    
    let formData = $("#search-form").serializeArray();
    console.log(formData);
    
    sessionStorage.setItem("searchedStock", JSON.stringify(formData));
    
    location.href = "search.html";
}

function logOut() {
    sessionStorage.clear();
    location.href = "index.html";
}

function createUserStockCards() {
    let database = firebase.database();
    
    let userNode = JSON.parse(sessionStorage.user);
    
    // Step 0: Access the user's stocks in the firebase database
    database.ref(userNode + "/stocks").on("value", function(data) {
        // Step 1: If the user does not have any stocks show them that they don't have any stocks and dont show any pie charts or cards
        if(data === null) {
            let alertDiv = document.createElement('div');
            
            $(alertDiv).addClass("alert alert-info");
            $(alertDiv).attr("role", "alert");
            $(alertDiv).html("<strong>You have no purchased stocks in your portfolio!</strong> To get started, just add money to your account and search any stock using the stock's symbol/ticker (Usually 3-5 characters in length)!");
            
            $("main").prepend(alertDiv);
            return;
        }
        else {
            // Step 2: Loop through all of the user's stocks
            for(let stockSymbols in data) {
                // Step 3: Create all of the elements for later use
                let cardColumn = document.createElement("div");
                let cardBox = document.createElement("div");
                let cardBody = document.createElement("div");
                let cardTitle = document.createElement("h5");
                let cardSubtitle = document.createElement("h6");
                let cardText = document.createElement("p");
                let transactionLink = document.createElement("a");
                
                // Step 4: Set the class for the card column element
                $(cardColumn).addClass("col-auto mb-3");
                
                // Step 5: Set the class and attributes for the card box element
                $(cardBox).addClass("card");
                $(cardBox).attr("id", stockSymbols);
                $(cardBox).attr("style", "width: 18rem");
                $(cardBox).attr("onclick", "getCardDetails(this)");
                
                // Step 6: Set the class for the card body element
                $(cardBody).addClass("card-body");
                
                // Step 7: Set the class and HTML for the card title element
                $(cardTitle).addClass("card-title");
                $(cardTitle).html(stockSymbols);
                
                // Step 8: Try and get the information from firebase for actual data, if an error delegate to the catch statement
                try {
                    // Step 9: Set the class and HTML for the card subtitle element
                    $(cardSubtitle).addClass("card-subtitle mb-2 text-muted");
                    $(cardSubtitle).html("Sector: " + data[stockSymbols]['sector']['stockSector']);
                    
                    // Step 10: Set the class and HTML for the card text element
                    $(cardText).addClass("card-text");
                    $(cardText).html("Shares: " + data[stockSymbols]['shares']['sharesOwned'] + "<br>Stock Value: $" + data[stockSymbols]['stockValue']['totalStockValue'].toLocaleString());
                    
                    // Step 11: Set the class, attributes, and HTML for the transaction link element
                    $(transactionLink).addClass("card-link");
                    $(transactionLink).attr("href", "transactions.html");
                    $(transactionLink).html("Transactions");
                    
                    // Step 12: Append each of the elements in order from top to bottom
                    $("#cards-row").append(cardColumn);
                    $(cardColumn).append(cardBox);
                    $(cardBox).append(cardBody);
                    $(cardBody).append(cardTitle);
                    $(cardBody).append(cardSubtitle);
                    $(cardBody).append(cardText);
                    $(cardBody).append(transactionLink);
                }
                catch(error) {
                    // Step 9: Log the error and create an element for an alert
                    console.error(error);
                    let alertDiv = document.createElement('div');
                    
                    // Step 10: Set the class, attributes, and HTML for the alert div element
                    $(alertDiv).addClass("alert alert-info");
                    $(alertDiv).attr("role", "alert");
                    $(alertDiv).html("<strong>You have no purchased stocks in your portfolio!</strong> To get started, just add money to your account and search any stock using the stock's symbol/ticker (Usually 3-5 characters in length)!");
                    
                    // step 11: prepend the alert element to the main section so the user knows that they have no stocks that can be displayed/information to be shown
                    $("main").prepend(alertDiv);
                }
            }
        }
    });
}

function getCardDetails(item) {
    console.log($(item).attr("id"));
    
    let stockTicker = $(item).attr("id");
    console.log(stockTicker);
    
    saveStockTicker(stockTicker);
}
