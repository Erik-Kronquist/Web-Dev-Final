let stockProfileData;
let stockChartData;
let stockTicker;

function getStockProfileData() {
    return stockProfileData;
}

function setStockProfileData(profile) {
    stockProfileData = profile;
}

function getStockChartData() {
    return stockChartData;
}

function setStockChartData(chartValues) {
    stockChartData = chartValues;
}

function setStockTicker() {
    stockTicker = JSON.parse(sessionStorage.stockTicker);
}

function getStockTicker() {
    return stockTicker;
}

function processStockSell() {
    storeStockTickerAndPriceInSessionStorage(getStockProfileData());
    sessionStorage.setItem("buyOrSell", JSON.stringify(false));
    location.href = "trade.html";
}

function storeStockTickerAndPriceInSessionStorage(stockProfile) {
    let stockSymbolAndPrice = {
        symbol: stockProfile['symbol'],
        openingPrice: stockProfile['price']['regularMarketOpen']['fmt'],
        price: stockProfile['price']['regularMarketPrice']['fmt'],
        sector: stockProfile['assetProfile']['sector']
    }
    
    console.log(stockSymbolAndPrice);
    
    sessionStorage.setItem("stockValuation", JSON.stringify(stockSymbolAndPrice));
    
    console.log("Symbol from session");
    console.log(JSON.parse(sessionStorage.stockValuation)['symbol']);
    
    console.log("Opening Price from session");
    console.log(JSON.parse(sessionStorage.stockValuation)['openingPrice']);
    
    console.log("Price from session")
    console.log(JSON.parse(sessionStorage.stockValuation)['price']);
    
    console.log("Sector from session")
    console.log(JSON.parse(sessionStorage.stockValuation)['sector']);
}

async function getChartData(range, interval) {
    setStockTicker();
    
    let chartURL = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart?interval=" + interval + "&symbol=" + getStockTicker() + "&range=" + range + "&includePrePost=false&useYfid=true&includeAdjustedClose=true&events=capitalGain%2Cdiv%2Csplit";
    
    console.log(chartURL);
    
    let stockChart = await fetchAPIData(chartURL);
    
    setStockChartData(stockChart);
    saveChartInSessionStorage(stockChart);

    console.log("stockChart");
    console.log(getStockChartData());
    
    return getStockChartData();
}

function setGlobalVariables() {
    let stockSymbol = setStockTicker();
    
    setUrlAndCallApiForProfile();
}

async function setUrlAndCallApiForProfile() {
    let stockProfileUrl = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-profile?symbol=" + getStockTicker();
    let stockProfile = await fetchAPIData(stockProfileUrl);
    
    setStockProfileData(stockProfile);
    saveProfileInSessionStorage(stockProfile);
    
    console.log("stockProfile");
    console.log(getStockProfileData());
}

async function fetchAPIData(url) {
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

function saveProfileInSessionStorage(stockProfile) {
    console.log(stockProfile);
    sessionStorage.setItem("stockProfile", JSON.stringify(stockProfile));
}

function saveChartInSessionStorage(stockChart) {
    console.log(stockChart);
    sessionStorage.setItem("stockChart", JSON.stringify(stockChart));
}

$("#five-day-range").on("click", function() {
    drawCandlestickChart5Days();
});

$("#one-month-range").on("click", function() {
    drawCandlestickChart1Month();
});

$("#three-month-range").on("click", function() {
    drawCandlestickChart3Month();
});

$("#six-month-range").on("click", function() {
    drawCandlestickChart6Month();
})

$("#one-year-range").on("click", function() {
    drawCandlestickChart1Year();
})
