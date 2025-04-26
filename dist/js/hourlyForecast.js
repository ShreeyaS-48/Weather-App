import { getWeatherFromCoords } from "./dataFunctions.js";
import CurrentLocation from "./CurrentLocation.js";
import { displayThreeHourForecast } from "./domFunctions.js";
const currentLoc = new CurrentLocation();
const initApp = () => {
    loadThreeHourForecast();
};

document.addEventListener("DOMContentLoaded", initApp);

const loadThreeHourForecast = async () => {
    const queryString = window.location.search;  
    const urlParams = new URLSearchParams(queryString);
    const date = urlParams.get("date");   
    const lat = urlParams.get("lat");   
    const lon = urlParams.get("lon");   
    currentLoc.setLat(lat);
    currentLoc.setLon(lon);
    const location = document.getElementById("threeHourForecast__date");
    location.textContent = `${date}`;
    const weatherJson = await getWeatherFromCoords(currentLoc);
    if(weatherJson) {
        let weatherArray = [];
        weatherJson.list.forEach(item => {
            if(item.dt_txt.slice(0,item.dt_txt.indexOf(" ")) === date){
                weatherArray.push(item);
            }
        });
        displayThreeHourForecast(weatherArray);
    }
};


