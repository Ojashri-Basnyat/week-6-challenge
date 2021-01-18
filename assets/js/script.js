$(document).ready(function () {

    // Declared variables
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
    console.log(searchHistory);
    var APIKey = "397f9df9b1a3538ba933e9c0668ec37d";

//  When search button is clicked capture city name typed by the user

    function getWeather(cityName) {
//  Using the city name run an Axios get request to open weather map api in metric units
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=metric&appid=" + APIKey;
        axios.get(queryURL)
        .then(function(response){
                                console.log(response);
                    //  Use response to display today's weather conditions & use moment.js to get & format dates
                                var currentDate = moment().format("MMM Do, YYYY");
                                console.log(currentDate);
                                name.innerHTML = response.data.name + " " + "(" + currentDate +")";
                                var weatherPic = response.data.weather[0].icon;
                                currentWeather.setAttribute("src","https://openweathermap.org/img/wn/" + weatherPic + "@2x.png");
                                currentWeather.setAttribute("alt",response.data.weather[0].description);
                                currentTemp.innerHTML = "Temperature: " + response.data.main.temp + " &#8451";
                                currentHumidity.innerHTML = "Humidity: " + response.data.main.humidity + "%";
                                currentWind.innerHTML = "Wind Speed: " + response.data.wind.speed + " km/h";
                            var lat = response.data.coord.lat;
                            var lon = response.data.coord.lon;

                            // TODO : this UV Index is being deprecated April 2021 - should be updated to One Call API soon see: https://openweathermap.org/api/one-call-api - Mallory
                            var UVQueryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + APIKey + "&cnt=1";
                            axios.get(UVQueryURL)
                            .then(function(response){
                                var UVIndex = document.createElement("span");   

                                // sets the colour of the UV-index background depending on the value (green, yellow or red)
                                if(response.data[0].value < 3) {
                                    UVIndex.setAttribute("class","badge badge-success");
                                } 
                                else if(response.data[0].value > 3 && response.data[0].value < 5) {
                                    UVIndex.setAttribute("class","badge badge-warning");
                                } 
                                else if(response.data[0].value > 5) {
                                    UVIndex.setAttribute("class","badge badge-danger");
                                }
                                UVIndex.innerHTML = response.data[0].value;
                                currentUV.innerHTML = "UV Index: ";
                                currentUV.append(UVIndex);
                            });
                    //  Using saved city name, execute a 5-day forecast get request from open weather map api
                            var cityID = response.data.id;
                            var forecastQueryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&units=metric&appid=" + APIKey;
                            axios.get(forecastQueryURL)
                            .then(function(response){

                    //  User response to display forecast for next 5 days
                                console.log(response);
                                var forecastEls = document.querySelectorAll(".forecast");
                                for (i=0; i<forecastEls.length; i++) {
                                    forecastEls[i].innerHTML = "";
                                    var forecastIndex = i*8 + 4;
                                    var forecastDate = moment(response.data.list[forecastIndex].dt * 1000).format("ddd, MMM Do, YYYY");
                                    var forecastDateEl = document.createElement("p");
                                    forecastDateEl.setAttribute("class","mt-3 mb-0 forecast-date");
                                    forecastDateEl.innerHTML = forecastDate;
                                    forecastEls[i].append(forecastDateEl);
                                    var forecastWeatherEl = document.createElement("img");
                                    forecastWeatherEl.setAttribute("src","https://openweathermap.org/img/wn/" + response.data.list[forecastIndex].weather[0].icon + "@2x.png");
                                    forecastWeatherEl.setAttribute("alt",response.data.list[forecastIndex].weather[0].description);
                                    forecastEls[i].append(forecastWeatherEl);
                                    var forecastTempEl = document.createElement("p");
                                    forecastTempEl.innerHTML = "Temperature: " + response.data.list[forecastIndex].main.temp + " &#8451";
                                    forecastEls[i].append(forecastTempEl);
                                    var forecastHumidityEl = document.createElement("p");
                                    forecastHumidityEl.innerHTML = "Humidity: " + response.data.list[forecastIndex].main.humidity + "%";
                                    forecastEls[i].append(forecastHumidityEl);
                                    }
                                })

        })
        // Error handling to alert user if they input an invalid city name

        .catch(function (error) {
            console.log(error);
            alert("Please enter a valid city name");
          });  
    }


    // Listener for the click on the search button

    $(search).on("click",function() {
        var searchTerm = input.value;

        // Ensure user input a city name

        if (searchTerm) {
            getWeather(searchTerm);
            searchHistory.push(searchTerm);
            localStorage.setItem("search",JSON.stringify(searchHistory));
            loadSearchHistory();

          } 
          // If user didn't input a value, alert them
          else {
            alert("Please enter a city name");
          }
          $("#city-input").val("");  
    })

    //  Save each city user searches for and display it under the search form
    function loadSearchHistory() {
        historyForm.innerHTML = "";
        
        for (var i=0; i<searchHistory.length; i++) {
            var historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);

            // Listen for users clicking on history items, if clicked, run getWeather()
            
            historyItem.addEventListener("click", function (e) {
                console.log(this.value)           // logs the value of this
                console.log(e.currentTarget === this) // logs TRUE
                getWeather(this.value);
              })

            historyForm.append(historyItem);
        }    

        }

    // Listener for the clear history button

    $("#clear-button").on("click",function() {
        searchHistory = [];
        loadSearchHistory();
        $("#today").empty();
        $("#current-weather").empty();
        localStorage.clear();
        window.location.reload();
    })


    //  When page loads, automatically get today's conditions and 5-day forecast for the last city the user searched for
    loadSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);        
    }

});








// var input = document.querySelector('.input_text');
// var main = document.querySelector('#name');
// var temp = document.querySelector('.temp');
// var desc = document.querySelector('.desc');
// var clouds = document.querySelector('.clouds');
// var button= document.querySelector('.submit');


// button.addEventListener('click', function(name){
// fetch('https://api.openweathermap.org/data/2.5/weather?q='+input.value+'&appid=397f9df9b1a3538ba933e9c0668ec37d')


// .then(response => response.json())
// .then(data => {
//   var tempValue = data['main']['temp'];
//   var nameValue = data['name'];
//   var descValue = data['weather'][0]['description'];

//   main.innerHTML = nameValue;
//   desc.innerHTML = "Desc - "+descValue;
//   temp.innerHTML = "Temp - "+tempValue;
//   input.value ="";

// })

// .catch(err => alert("Wrong city name!"));
// })

