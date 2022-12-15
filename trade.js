var totalPriceOfShares;
var buyingOrSelling;
var userShares;
var stockTicker;
var username;
var stockShares;
var sector;
var totalStockValue;
var userBalance;
var sharesInAccount;

// Total Price Mutator and Accessor
function getTotalPrice() {
    return totalPriceOfShares;
}

function setTotalPrice(price) {
    totalPriceOfShares = price
}

// Share(s) Bought or Sold Mutator and Accessor
function getBuyingOrSelling() {
    return buyingOrSelling;
}

function setBuyingOrSelling(transactionType) {
    // transactionType is a boolean | true = buying | false = selling
    buyingOrSelling = transactionType;
}

// Total Shares in Users Acccount Mutator and Accessor
function getUserShares() {
    return userShares;
}

function setUserShares(shares) {
    userShares = shares;
}

// Stock Ticker Mutator and Accessor
function getStockTicker() {
    return stockTicker;
}

function setStockTicker(symbol) {
    stockTicker = symbol;
}

// Username Mutator and Accessor
function getUsername() {
    return username;
}

function setUsername(user) {
    username = user;
}

// Shares for Stock Mutator and Accessor
function getStockShares() {
    return stockShares;
}

function setStockShares(shares) {
    stockShares = shares;
}

function getTransactionTypeFromSessionStorage() {
    let type = JSON.parse(sessionStorage.buyOrSell);
    // console.log(type);
    
    setBuyingOrSelling(type);
}

// Stock Sector Mutator and Accessor
function getSector() {
    return sector;
}

function setSector(stockSector) {
    sector = stockSector;
}

// Total Stock Value Mutator and Accessor
function getTotalStockValue() {
    return totalStockValue;
}

function setTotalStockValue(value) {
    totalStockValue = value;
}

// Total user balanace Mutator and Accessor
function getUserBalance() {
    return userBalance;
}

function setUserBalance(balance) {
    userBalance = balance;
}

// Total shares for stock in user profile Mutator and Accessor
function getSharesInAccount() {
    return sharesInAccount;
}

function setSharesInAccount(shares) {
    sharesInAccount = shares;
}

$("#form1").on("input", function() {
    
    let shares = parseInt($(this).val());
    
    if(shares < 0 || $(this).val() == null || $(this).val() == "") {
        shares = 0;
        $(this).val(shares);
    }
    
    if(shares == 0) {
        $("#verify-button").attr("disabled", "disabled");
    }
    else if(shares > 0) {
        $("#verify-button").removeAttr("disabled");
    }
    
    calculateTotalPrice(shares);
    
    tallyUpSharesInCart(shares);
});

$("#logout-header-button").on("input", function() {
    sessionStorage.clear();
    location.href = "index.html";
})

async function getStockSymbolAndPrice() {
    setUserShares(1);
    
    let stockValue = JSON.parse(sessionStorage.stockValuation);
    
    $("#stock-symbol").html("Stock Symbol - " + stockValue['symbol']);
    
    $("#stock-opening-price").html("Opening Price: $" + stockValue['openingPrice']);
    
    $("#stock-price").html("Stock Price - $" + stockValue['price']);
    
    $("#total-shares-price").html("$" + stockValue['price']);
    
    $("#total-price").html("$" + stockValue['price']);
    
    setTotalPrice(parseFloat(stockValue['price']));
}

function setFirebaseAndData() {
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    setUsername(JSON.parse(sessionStorage.user));
    
    setStockTicker(JSON.parse(sessionStorage.stockValuation)['symbol']);
    
    setSector(JSON.parse(sessionStorage.stockValuation)['sector']);
    
    let stockTickerNode = getStockTicker();
    
    let userNode = getUsername();
    
    let database = firebase.database();
    
    database.ref(userNode + "/stocks/" + stockTickerNode + "/shares").on("value", function(data) {
        if(data !== null) {
            setStockShares(data['sharesOwned']);
        }
        else {
            setStockShares(0);
        }
    });
    
    database.ref().on("value", function(data) {
        console.log(data);
        
        let userNode = JSON.parse(sessionStorage.user);
        
        setUserBalance(data[userNode]["accountBalance"]);
        
        if(!(JSON.parse(sessionStorage.buyOrSell))) {
            setSharesInAccount(data[userNode]["stocks"][getStockTicker()]["shares"]["sharesOwned"]);
        }
    });
}

function calculateTotalPrice(shares) {
    let stockPrice = JSON.parse(sessionStorage.stockValuation)['price'];
    
    let totalPrice = Math.round((stockPrice * shares) * 100) / 100;
    
    $("#total-shares-price").html("$" + totalPrice.toLocaleString());
    
    $("#total-price").html("$" + totalPrice.toLocaleString());
    
    setTotalPrice(totalPrice);
}

function calculateSettlementDate() {
    let currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    
    let day = currentDate.getDate();
    
    let month = currentDate.getMonth() + 1;
    
    let year = currentDate.getFullYear();
    
    let settlementDate = month + "/" + day + "/" + year;
    
    $("#expected-settlement-date").html(settlementDate);
}

function tallyUpSharesInCart(shares) {
    if(shares == 1) {
        $("#cart-items").html("Cart | " + shares + " share");
    }
    else {
        $("#cart-items").html("Cart | " + shares + " shares");
    }
    
    setUserShares(shares);
}

async function processStockTrade() {
    // !BREAK UP EVERYTHING INTO SEPERATE FUNCTIONS!
    
    let database = firebase.database();
    
    let totalPrice = getTotalPrice();
    
    // Step 1: Determine if user is buying or selling shares
    let transactionType = getBuyingOrSelling();
    
    // Step 2: If user is buying shares run through purchase steps otherwise run through selling steps
    if(transactionType) {
        // Step 3: Determine if the user has enough money to buy the shares they want
        let canPurchase = checkIfUserHasBalance();
        console.log(canPurchase);
        
        // Step 4: If the user can purchase the shares run through the steps of purchasing them, otherwise show them they don't have enough money
        if(canPurchase) {
            // Step 5: Update the total shares for the users entire portfolio
            await increaseTotalShares(database);
            
            // Step 6: Update the shares the user owns for that stock
            await increaseSharesOwnedForStock(database);
            
            // Step 7: Add the stock sector to the database so the overview page can be run properly
            await addSectorToDatabase(database);
            
            // Step 8: Log the data (Not Important)
            await database.ref().on("value", function(data) {
                console.log(data);
            });
            
            // Step 9: Subtract the cost of the trade from the users balance
            await decreaseUserBalance(database);
            
            // Step 10: Display to the user that the trade was a success and refresh page after 1.5 seconds
            showSuccessfulTrade();
        }
        else {
            // Step 5: Display to user that they don't have enough money in account and do not run through successful purchase steps
            showUnsuccessfulTrade("balance");
        }
    }
    else if(!transactionType) {
        // Step 3: Determine if the user has enough shares of the stock in their account to sell
        let canSell = checkIfUserHasShares();
        console.log(canSell);
        
        // Step 4: If the user can sell the shares run through the steps of selling them, otherwise show them they don't have enough shares
        if(canSell) {
            // Step 5: Update the total shares for the users entire portfolio
            await decreaseTotalShares(database);
            
            // Step 6: Update the shares the user owns for that stock
            await decreaseSharesOwnedForStock(database);
            
            // Step 7: Log the data (Not Important)
            await database.ref().on("value", function(data) {
                console.log(data);
            });
            
            // Step 8: Add the value of the trade to the users balance
            await increaseUserBalance(database);
            
            // Step 9: Display to the user that the trade was successful and refresh page after 1.5 seconds
            showSuccessfulTrade();
        }
        else {
            // Step 5: Display to user that they don't have enough shares for that stock and do not run through successful sale steps
            showUnsuccessfulTrade("shares");
        }
    }
    
}

function checkIfUserHasBalance() {
    let canPurchase;
    
    if(getUserBalance() >= getTotalPrice()) {
        canPurchase = true;
    }
    else {
        canPurchase = false;
    }
    
    return canPurchase;
}

function checkIfUserHasShares() {
    let canSell;
    
    if(getSharesInAccount() >= getUserShares()) {
        canSell = true;
    }
    else {
        canSell = false;
    }
    
    return canSell;
}

async function increaseTotalShares(database) {
    let sharesTradedInTransaction = getUserShares();
    
    let userNode = getUsername();
    
    let shares;
    
    await database.ref(userNode + "/totalShares").on("value", function(data) {
        if(data !== null) {
            shares = data.totalNumOfShares;
        }
        else {
            shares = 0;
        }
        shares = shares + getUserShares();
        
        database.ref(userNode + "/totalShares").set({
            totalNumOfShares: shares
        })
    });
    
    database.ref(getUsername() + "/stocks/" + getStockTicker() + "/stockValue").on("value", function(data) {
        if(data === null) {
            setTotalStockValue(getTotalPrice());
        }
        else {
            setTotalStockValue(data['totalStockValue'] + getTotalPrice());
        }
        database.ref(getUsername() + "/stocks/" + getStockTicker() + "/stockValue").set({
            totalStockValue: getTotalStockValue()
        });
        
        enterTradedSharesIntoFirebase(database);
    });
}

async function decreaseTotalShares(database) {
    let sharesTradedInTransaction = getUserShares();
    
    let userNode = getUsername();
    
    let shares;
    
    await database.ref(userNode + "/totalShares").on("value", function(data) {
        
        if(data !== null) {
            shares = data.totalNumOfShares;
        }
        else {
            shares = 0;
        }
        shares = shares - getUserShares();
        
        database.ref(userNode + "/totalShares").set({
            totalNumOfShares: shares
        });
    });
    
    database.ref(getUsername() + "/stocks/" + getStockTicker() + "/stockValue").on("value", function(data) {
        if(data === null) {
            setTotalStockValue(getTotalPrice());
        }
        else {
            setTotalStockValue(data['totalStockValue'] - getTotalPrice());
        }
        database.ref(getUsername() + "/stocks/" + getStockTicker() + "/stockValue").set({
            totalStockValue: getTotalStockValue()
        });
        enterTradedSharesIntoFirebase(database);
    });
}

async function enterTradedSharesIntoFirebase(database) {
    let stockTickerNode = JSON.parse(sessionStorage.stockValuation)['symbol'];
    
    let date = new Date();
    let unixDate = Date.now();
    
    let transactionType = "";
    let typeOfTransaction = "";    
    
    if(getBuyingOrSelling()) {
        transactionTypeNode = "bought_" + unixDate;
        typeOfTransaction = "Purchased";
    }
    else {
        transactionTypeNode = "sold_" + unixDate;
        typeOfTransaction = "Sold";
    }
    
    await database.ref(getUsername() + "/stocks/" + stockTickerNode + "/transactions/" + transactionTypeNode).set({
        timestamp: unixDate,
        shares: getUserShares(),
        valueOfShares: getTotalPrice(),
        transactionType: typeOfTransaction
    });
}

async function increaseSharesOwnedForStock(database) {
    console.log(getTotalPrice());
    
    let stockTickerNode = getStockTicker();
    console.log("stockTickerNode | " + stockTickerNode);
    
    console.log(getStockShares() + " | " + getUserShares())
    
    let newSharesOwned = parseFloat(getStockShares()) + parseFloat(getUserShares());
    console.log("newSharesOwned | " + newSharesOwned);
    
    await database.ref(getUsername() + "/stocks/" + stockTickerNode + "/shares").set({
        sharesOwned: newSharesOwned
    });
}

async function decreaseSharesOwnedForStock(database) {
    console.log(getTotalPrice());
    
    let stockTickerNode = getStockTicker();
    console.log("stockTickerNode | " + stockTickerNode);
    
    console.log(getStockShares() + " | " + getUserShares());
    
    let newSharesOwned = parseFloat(getStockShares()) - parseFloat(getUserShares());
    console.log("newSharesOwned | " + newSharesOwned);
    
    await database.ref(getUsername() + "/stocks/" + stockTickerNode + "/shares").set({
        sharesOwned: newSharesOwned
    });
    
    if(newSharesOwned <= 0) {
        database.ref(getUsername() + "/stocks/" + stockTickerNode).set("");
    }
}

async function addSectorToDatabase(database) {
    await database.ref(getUsername() + "/stocks/" + getStockTicker() + "/sector").set({
        stockSector: getSector()
    });
    
    await database.ref(getUsername() + "/stocks").on("value", function(data) {
        for(let stocks in data) {
            console.log(data[stocks]['sector']['stockSector']);
        }
    });
}

async function increaseUserBalance(database) {
    await database.ref(getUsername() + "/accountBalance").on("value", function(data) {
        database.ref(getUsername() + "/accountBalance").set(data + getTotalPrice());
    });
}

async function decreaseUserBalance(database) {
    await database.ref(getUsername() + "/accountBalance").on("value", function(data) {
        database.ref(getUsername() + "/accountBalance").set(data - getTotalPrice());
    });
}

function showSuccessfulTrade() {
    $("#trade-successful").removeClass("d-none");
    setTimeout(function() {
        $("#trade-successful").addClass("d-none");
        location.reload();
    }, 1500);
}

function showUnsuccessfulTrade(notEnough) {
    if(notEnough == "balance") {
        $("#trade-unsuccessful").html("<strong>Unsuccessful!</strong> You do not have enough money in your balance!");
    }
    else if(notEnough == "shares") {
        $("#trade-unsuccessful").html("<strong>Unsuccessful!</strong> You do not have enough shares of this stock!");
    }
    $("#trade-unsuccessful").removeClass("d-none");
    setTimeout(function() {
        $("#trade-unsuccessful").addClass("d-none");
    }, 2500);
}
