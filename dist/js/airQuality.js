import CurrentLocation from "./CurrentLocation.js";
import { getAQIFromCoords } from "./dataFunctions.js";
import { displayAirQualityDetails } from "./domFunctions.js"
const currentLoc = new CurrentLocation();
const initApp = () => {
    loadAirQualityDetails();
};

document.addEventListener("DOMContentLoaded", initApp);

const loadAirQualityDetails = async () => {
    const queryString = window.location.search;  
    const urlParams = new URLSearchParams(queryString);
    const date = urlParams.get("date");   
    const lat = urlParams.get("lat");   
    const lon = urlParams.get("lon");   
    currentLoc.setLat(lat);
    currentLoc.setLon(lon);
    const location = document.getElementById("airQuality__location");
    location.textContent = `Lat: ${lat.indexOf("-") === -1 ? lat.slice(0,5) : lat.slice(0,6)} • Long: ${lon.indexOf("-") === -1 ? lon.slice(0,5) : lon.slice(0,6)}`;
    const aqiJson = await getAQIFromCoords(currentLoc);
    if(aqiJson) {
        console.log(aqiJson);
        displayAirQualityDetails(aqiJson);
    }
};


