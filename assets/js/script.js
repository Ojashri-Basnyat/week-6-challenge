$(document).ready(function () {

    var input = document.getElementById("city-input");
    var search = document.getElementById("search-button");
    var name = document.getElementById("city-name");
    var currentWeather = document.getElementById("current-weather");
    var currentTemp = document.getElementById("temperature");
    var currentHumidity = document.getElementById("humidity");
    var currentWind = document.getElementById("wind-speed");
    var currentUV = document.getElementById("uv-index");
    var historyForm = document.getElementById("history");
    var searchHistory = JSON.parse(localStorage.getItem("search")) || [];
    //console.log(searchHistory);
    var APIKey = "397f9df9b1a3538ba933e9c0668ec37d"; //personal API key generated from open weather

//  Look up the city's weather details when the user inputs the city's name and clicks on the search icon

    function getWeather(cityName) {
//  Using Fetch API
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + APIKey;
    
    console.log('citynbame :',queryURL)
        fetch(queryURL).then(resp => resp.json()) .then ( data => {
      
                                console.log(data);
                    //  Using moment.js
                                var currentDate = moment().format("MMM Do, YYYY");
                                console.log(currentDate);
                                name.innerHTML = data.name + " " + "(" + currentDate +")";
                                var weatherPic = data.weather[0].icon;
                                currentWeather.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                                currentWeather.setAttribute("alt",data.weather[0].description);
                                currentTemp.innerHTML = "Temperature: " + data.main.temp + " &#8451";
                                currentHumidity.innerHTML = "Humidity: " + data.main.humidity + "%";
                                currentWind.innerHTML = "Wind Speed: " + data.wind.speed + " km/h";
                            var lat = data.coord.lat;
                            var lon = data.coord.lon;

                            var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + APIKey + "&cnt=1";
                         
                            fetch(UVQueryURL) .then(res => res.json()).then(uvdata => {
                                console.log(uvdata)
                                console.log(UVQueryURL)
                            
                                var UVIndex = document.createElement("span");   

                                // UV-index background color changer depending on value it forecasts
                                if(uvdata[0].value < 3) {
                                    UVIndex.setAttribute("class","badge badge-success"); //green
                                } 
                                else if(uvdata[0].value > 3 && uvdata[0].value < 5) {
                                    UVIndex.setAttribute("class","badge badge-warning"); //yellow
                                } 
                                else if(uvdata[0].value > 5) {
                                    UVIndex.setAttribute("class","badge badge-danger"); //red
                                }
                                UVIndex.innerHTML = uvdata[0].value;
                                currentUV.innerHTML = "UV Index: ";
                                currentUV.append(UVIndex);
                            });
                    //  Getting the forecast for the next five days after the current day
                            var cityID = data.id;
                            var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=metric&appid=" + APIKey;
                            fetch(forecastQueryURL)
                            
                            .then(res => res.json()).then(data => {

                   // This process goes through each of the elements under forecast container and populates all the details for each div which incls forecast date, weather forecast, temp, humidity &b also brings in the forecast image
                                var forecastEls = document.querySelectorAll(".forecast");
                                for (i=0; i<forecastEls.length; i++) {
                                    forecastEls[i].innerHTML = "";
                                    var forecastIndex = i*8 + 4;
                                    var forecastDate = moment(data.list[forecastIndex].dt * 1000).format("ddd, MMM Do, YYYY");
                                    var forecastDateEl = document.createElement("p");
                                    forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                                    forecastDateEl.innerHTML = forecastDate;
                                    forecastEls[i].append(forecastDateEl);
                                    var forecastWeatherEl = document.createElement("img");
                                    forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + data.list[forecastIndex].weather[0].icon + "@2x.png");
                                    forecastWeatherEl.setAttribute("alt",data.list[forecastIndex].weather[0].description);
                                    forecastEls[i].append(forecastWeatherEl);
                                    var forecastTempEl = document.createElement("p");
                                    forecastTempEl.innerHTML = "Temperature: " + data.list[forecastIndex].main.temp + " &#8451";
                                    forecastEls[i].append(forecastTempEl);
                                    var forecastHumidityEl = document.createElement("p");
                                    forecastHumidityEl.innerHTML = "Humidity: " + data.list[forecastIndex].main.humidity + "%";
                                    forecastEls[i].append(forecastHumidityEl);
                                    }
                                })

        })
        // If the user does not input the cities' names correctly

        .catch(function (error) {
            console.log(error);
            alert("Please enter a valid city name");
          });  
}

    $(search).on("click",function() {
        var searchTerm = input.value;

        if (searchTerm) {
            getWeather(searchTerm);
            searchHistory.push(searchTerm);
            localStorage.setItem("search",JSON.stringify(searchHistory));
            loadSearchHistory();

          } 
          else {
            alert("Please enter a city name");
          }
          $("#city-input").val("");  
    })

    // Saving search history in localStorage, this history will be leveraged to populate the historical search
    function loadSearchHistory() {
        historyForm.innerHTML = "";
        
        for (var i=0; i<searchHistory.length; i++) {
            var historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            
            historyItem.addEventListener("click", function (e) {
                console.log(this.value)           
                console.log(e.currentTarget === this) 
                getWeather(this.value);
              })

            historyForm.append(historyItem);
        }    

        }

    $("#clear-button").on("click",function() {
        searchHistory = [];
        loadSearchHistory();
        $("#today").empty();
        $("#current-weather").empty();
        localStorage.clear();
        window.location.reload();
    })

    loadSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);        
    }

});









