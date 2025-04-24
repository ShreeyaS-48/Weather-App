const WEATHER_API_KEY = "Your Key";
export const setLocationObject = (locationObj, coordsObj) => {
    const { lat, lon, name, unit } = coordsObj;
    locationObj.setLat(lat);
    locationObj.setLon(lon);
    locationObj.setName(name);
    if(unit) {
        locationObj.setUnit(unit);
    }
};

export const getHomeLocation = () => {
    return localStorage.getItem("defaultWeatherLocation");
};

export const getWeatherFromCoords = async (locationObj) => {
    const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const units = locationObj.getUnit();
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${WEATHER_API_KEY}`;
    try{
        const weatherStream = await fetch(url);
        const weatherjson = await weatherStream.json();
        return weatherjson;
    }
    catch(err){
        console.error(err.stack);
    }

};

export const getAQIFromCoords = async (locationObj) => {
    const lat = locationObj.getLat();
    const lon = locationObj.getLon();
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    try{
        const aqiStream = await fetch(url);
        const aqiJson = await aqiStream.json();
        return aqiJson;
    }
    catch(err){
        console.error(err.stack);
    }

};


export const getCoordsFromApi = async (entryText, units) => {
    const regex = /^\d+$/g;
    const flag = regex.test(entryText) ? "zip" : "q" ;
    const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
    const encodedUrl = encodeURI(url);
    try{
        const dataStream = await fetch(encodedUrl);
        const jsonData = await dataStream.json();
        return jsonData;
    }
    catch(err){
        console.error(err.stack);
    }
};


export const cleanText = (text) => {
    const regex = / {2,}/g;
    const entryText = text.replaceAll(regex, " ").trim();
    return entryText;
};