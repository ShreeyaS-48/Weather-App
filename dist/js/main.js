import CurrentLocation from "./CurrentLocation.js";
import { addSpinner , displayError, displayApiError, setPlaceholderText, updateScreenReaderConfirmation, updateDisplay} from "./domFunctions.js";
import { setLocationObject, getHomeLocation, getAQIFromCoords, getWeatherFromCoords, cleanText, getCoordsFromApi } from "./dataFunctions.js";
import { generateNotification } from "./toastNotifications.js";
const currentLoc = new CurrentLocation();
const initApp = () => {
    const geoButton = document.getElementById("getLocation");
    geoButton.addEventListener("click", getGeoWeather);
    const homeButton = document.getElementById("home");
    homeButton.addEventListener("click", loadWeather);
    const saveButton = document.getElementById("saveLocation");
    saveButton.addEventListener("click", saveLocation);
    const unitButton = document.getElementById("unit");
    unitButton.addEventListener("click", setUnitPref);
    const refreshButton = document.getElementById("refresh");
    refreshButton.addEventListener("click", refreshWeather);
    const locationEntry = document.getElementById("searchBar__form");
    locationEntry.addEventListener("submit", submitNewLocation);
    const micButton = document.getElementById("searchBar__mic");
    micButton.addEventListener("click", voiceSearch);
    setPlaceholderText();
    loadWeather();
};

document.addEventListener("DOMContentLoaded", initApp);

const getGeoWeather = (event) => {
    if(event) {
        if(event.type === "click") {
            const mapIcon = document.querySelector(".fa-map-marker-alt");
            addSpinner(mapIcon);
        }
    }
    if (!navigator.geolocation) geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError );
};

const geoError = (errObj) => {
    const errMsg = errObj ? errObj.message : "Geolocation not supported";
    displayError(errMsg, errMsg);
};

const geoSuccess = (position) => {
    const myCoordsObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);

}

const loadWeather = (event) => {
    const savedLocation = getHomeLocation();
    if(!savedLocation && !event) return getGeoWeather();
    if(!savedLocation && event.type === "click") {
        displayError("No Home Location Saved", "Sorry. Please Save your home location first.");
    } else if(savedLocation && !event){
        displayHomeLocationWeather(savedLocation);
    } else {
        const homeIcon = document.querySelector(".fa-home");
        addSpinner(homeIcon);
        displayHomeLocationWeather(savedLocation);
    }
};

const displayHomeLocationWeather= (home) => {
    if(typeof home === "string"){
        const locationJson = JSON.parse(home);
        const myCoordsObj = {
            lat: locationJson.lat,
            lon: locationJson.lon,
            name: locationJson.name,
            unit: locationJson.unit
        };
        setLocationObject(currentLoc, myCoordsObj);
        updateDataAndDisplay(currentLoc);
    }
};

const saveLocation = () => {
    if(currentLoc.getLat() && currentLoc.getLon()) {
        const saveIcon = document.querySelector(".fa-save");
        addSpinner(saveIcon);
        const location = {
            name : currentLoc.getName(),
            lat : currentLoc.getLat(),
            lon : currentLoc.getLon(),
            unit : currentLoc.getUnit()
        };
        localStorage.setItem("defaultWeatherLocation", JSON.stringify(location));
        updateScreenReaderConfirmation(`Saved ${currentLoc.getName()} as home location`);
    }
};

const setUnitPref = () => {
    const unitIcon = document.querySelector(".fa-chart-bar");
    addSpinner(unitIcon);
    currentLoc.toggleUnit();
    updateDataAndDisplay(currentLoc);
};

const refreshWeather = () => {
    const refreshIcon = document.querySelector(".fa-sync-alt");
    addSpinner(refreshIcon);
    updateDataAndDisplay(currentLoc);
}; 

const submitNewLocation = async (event) => {
    event.preventDefault();
    const text = document.getElementById("searchBar__text").value;
    const entryText = cleanText(text);
    document.getElementById("searchBar__text").value = "";
    setPlaceholderText();
    if(!entryText.length) return;
    const searchIcon = document.querySelector(".fa-search");
    addSpinner(searchIcon);
    const coordsData = await getCoordsFromApi(entryText, currentLoc.getUnit());
    if(coordsData){
        if(coordsData.cod === 200) {
        const myCoordsObj = {
            lat: coordsData.coord.lat,
            lon: coordsData.coord.lon,
            name: coordsData.sys.country 
            ? `${coordsData.name}, ${coordsData.sys.country}` 
            : coordsData.name
        };
        setLocationObject(currentLoc, myCoordsObj);
        updateDataAndDisplay(currentLoc);
        } else {
            displayApiError(coordsData);
        }
    } else {
        displayApiError("Connection Error", "Connection Error");
    }
};

const voiceSearch = (event) => {
    const input = document.getElementById("searchBar__text");
    input.placeholder = "Listening...";
    const micIcon = document.querySelector(".fa-microphone");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        const inputField = document.getElementById("searchBar__text")
        recognition.start();
        addSpinner(micIcon);
        recognition.addEventListener("result", (event) => {
            const spokenText = event.results[0][0].transcript;
            inputField.value = spokenText;
            document.getElementById("searchBar__form").dispatchEvent(new Event("submit"));
          });
        recognition.addEventListener("error", (event) => {
            setPlaceholderText();
            console.error("Speech recognition error:", event.error);
        });
    }
    else{
        console.warn("Speech Recognition not supported in this browser.");
    }
}


const updateDataAndDisplay = async (locationObj) => {
    const weatherJson = await getWeatherFromCoords(locationObj);
    const aqiJson = await getAQIFromCoords(locationObj);
    if(weatherJson && aqiJson) {
        updateDisplay(weatherJson, aqiJson, locationObj);
        generateNotification(weatherJson, aqiJson, locationObj);
    }
};
