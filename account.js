var mooneyToAdd;

function getMoneyToAdd() {
    return moneyToAdd;
}

function setMoneyToAdd(money) {
    moneyToAdd = money;
}

function getAccountBalance() {
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    let database = firebase.database();
    
    let userNode = JSON.parse(sessionStorage.user);
    
    database.ref(userNode).on("value", function(data) {
        let accountBalance = data["accountBalance"];
        let format = parseFloat(accountBalance).toLocaleString();
        
        $("#account-balance").html("Account Balance - $" + format);
        $("#spinner-container").addClass("hide-content");
        $("#main-content").removeClass("hide-content");
    });
}

$("#amount-to-add").on("input", function(data) {
    let balanceToAdd = parseFloat($(this).val());
    console.log(balanceToAdd);
    
    setMoneyToAdd(balanceToAdd);
    
    if(balanceToAdd < 0 || isNaN(balanceToAdd)) {
        balanceToAdd = 0;
        $(this).val(balanceToAdd);
    }
    
    if(balanceToAdd <= 0) {
        $("#verify-addition").attr("disabled", "disabled");
    }
    else if(balanceToAdd > 0) {
        $("#verify-addition").removeAttr("disabled");
    }
});

function addMoneyToBalance() {
    let database = firebase.database();
    
    let userNode = JSON.parse(sessionStorage.user);
    
    let balanceToAdd = getMoneyToAdd();
    
    console.log(balanceToAdd);
    
    database.ref(userNode + "/accountBalance").on("value", function(data) {
        console.log("data")
        console.log(data);
        database.ref(userNode + "/accountBalance").set(data + balanceToAdd);
        
        $("#balance-addition-successful").removeClass("invisible");
        setTimeout(function() {
            $("#balance-addition-successful").addClass("invisible");
            location.reload();
        }, 1500);
    });
}

function populateDropdown() {
    let database = firebase.database();
    
    let userNode = JSON.parse(sessionStorage.user);
    
    // THIS IS THE FORMAT USED FOR CREATED THE DROPDOWN MENU
    // <ul class="dropdown-menu" id="dropdown-menu">
    //     <li><button class="dropdown-item" type="button">Action</button></li>
    //     <li><button class="dropdown-item" type="button">Another action</button></li>
    //     <li><button class="dropdown-item" type="button">Something else here</button></li>
    // </ul>
    
    database.ref(userNode + "/stocks").on("value", function(data) {
        for(let stocks in data) {
            console.log(stocks);
            console.log(data[stocks]);
            console.log("------------");
            
            let newListItem = document.createElement("li");
            let newButton = document.createElement("button");
            
            $(newButton).addClass("dropdown-item");
            $(newButton).html(stocks);
            $(newButton).attr("type", "button");
            $(newButton).on("click", function() {
                showStockDataTable(stocks, data[stocks]["shares"]["sharesOwned"], data);
            });
            
            $(newListItem).append(newButton);
            $("#dropdown-menu").append(newListItem);
        }
    });
}

async function showStockDataTable(stockTicker, shares, userStockData) {
    let stockProfile = await callAPIForStockProfile(stockTicker);
    
    console.log(stockTicker);
    console.log(shares);
    console.log(userStockData);
    
    let marketValue = shares * stockProfile["price"]["regularMarketPrice"]["raw"];
    console.log(marketValue.toLocaleString());
    
    let costBasis = userStockData[stockTicker]["stockValue"]["totalStockValue"] / shares;
    console.log(costBasis.toLocaleString());
    
    let unrealizedGainLoss = (parseFloat(stockProfile["price"]["regularMarketPrice"]["raw"]) - parseFloat(costBasis)) * shares;
    console.log(unrealizedGainLoss.toLocaleString());
    
    if(unrealizedGainLoss > 0) {
        $("#unrealized-gainloss").removeClass("text-secondary");
        $("#unrealized-gainloss").removeClass("text-danger");
        $("#unrealized-gainloss").addClass("text-success");
        $("#unrealized-gainloss").html("+$" + unrealizedGainLoss.toLocaleString());
    }
    else if(unrealizedGainLoss == 0) {
        $("#unrealized-gainloss").removeClass("text-secondary");
        $("#unrealized-gainloss").removeClass("text-success");
        $("#unrealized-gainloss").addClass("text-secondary");
        $("#unrealized-gainloss").html("$" + unrealizedGainLoss.toLocaleString());
    }
    else {
        $("#unrealized-gainloss").removeClass("text-secondary");
        $("#unrealized-gainloss").removeClass("text-success");
        $("#unrealized-gainloss").addClass("text-danger");
        $("#unrealized-gainloss").html("-$" + Math.abs(unrealizedGainLoss.toLocaleString()));
    }
    
    $("#ticker").html(stockTicker);
    $("#company").html(stockProfile["quoteType"]["shortName"]);
    $("#shares").html(shares);
    $("#closing-price").html("$" + stockProfile["price"]["regularMarketPrice"]["fmt"]);
    $("#market-value").html("$" + marketValue.toLocaleString());
    $("#cost-basis").html("$" + costBasis.toLocaleString());
}

async function callAPIForStockProfile(stockTicker) {
    let url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-profile?symbol=" + stockTicker;
    console.log(url);
    
    try {
        const options = {
        	method: 'GET',
        	headers: {
        		'X-RapidAPI-Key': '4ae8272633msh96f000cec9d8311p14d2cfjsnad7c57c46a55',
        		'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        	}
        };
        let response = await fetch(url, options);
        return await response.json();
    }
    catch(error) {
        console.log(error);
    }
}
