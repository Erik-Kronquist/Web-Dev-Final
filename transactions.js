async function showTransactionHistory() {
    let stockTicker = JSON.parse(sessionStorage.stockTicker);
    
    let url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-profile?symbol=" + stockTicker;
    let stockProfile = await callAPI(url);
    
    firebase.initialize({
        projectName: "testCaseThree"
    });
    
    let database = firebase.database();
    
    database.ref().on("value", function(data) {
        console.log(data);
    });
    
    let userNode = JSON.parse(sessionStorage.user);
    let stockNode = JSON.parse(sessionStorage.stockTicker);
    
    database.ref(userNode + "/stocks/" + stockNode).on("value", function(data) {
        console.log(data);
        
        let transactionList = data['transactions'];
        
        let i = 0;
        
        for(let transactions in transactionList) {
            i++;
            
            let newTableRow = document.createElement("tr");
            $("#table-body").append(newTableRow);
            
            let newRowNumberEntry = document.createElement("th");
            $(newRowNumberEntry).attr("scope", "row");
            $(newRowNumberEntry).html(i);
            $(newTableRow).append(newRowNumberEntry);
            
            console.log(transactionList[transactions]['timestamp']);
            
            let date = new Date(transactionList[transactions]['timestamp']);
            console.log(date);
            console.log(date.toLocaleDateString("default"));
            
            let newDateEntry = document.createElement("td");
            $(newDateEntry).html(date.toLocaleDateString("default"));
            $(newTableRow).append(newDateEntry);
            
            let newSharesValueEntry = document.createElement("td");
            $(newSharesValueEntry).html("$" + transactionList[transactions]['valueOfShares'].toLocaleString());
            $(newTableRow).append(newSharesValueEntry);
            
            let newSharesTradedEntry = document.createElement("td");
            $(newSharesTradedEntry).html(transactionList[transactions]['shares']);
            $(newTableRow).append(newSharesTradedEntry);
            
            let newTransactionTypeEntry = document.createElement("td");
            $(newTransactionTypeEntry).html(transactionList[transactions]['transactionType']);
            $(newTableRow).append(newTransactionTypeEntry);
            
            console.log(newTableRow);
            
            console.log(transactionList[transactions]);
        }
        
        $("#spinner-container").addClass("hide-content");
        $("#transaction-history").removeClass("hide-content");
        
        $("#stock-ticker").html("Your Transaction History For " + JSON.parse(sessionStorage.stockTicker) + 
        "<h4>Total Value - $" + (data['shares']['sharesOwned'] * stockProfile['price']['regularMarketPrice']['raw']).toLocaleString() + 
        " | Sum Of Values When Traded - $" + data['stockValue']['totalStockValue'].toLocaleString() + "</h4>");
    });
}

async function callAPI(url) {
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
