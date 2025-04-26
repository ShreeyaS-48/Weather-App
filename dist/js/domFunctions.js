export const setPlaceholderText = () => {
    const input = document.getElementById("searchBar__text");
    window.innerWidth < 400 
    ? (input.placeholder = "City, State, Country") 
    : (input.placeholder = "City, State, Country or Zip Code");
};

export const addSpinner = (element) => {
    animateButton(element);
    setTimeout(animateButton, 1000, element);
}

const animateButton = (element) => {
    element.classList.toggle("none");
    element.nextElementSibling.classList.toggle("block");
    element.nextElementSibling.classList.toggle("none");
};

export const displayError = (headerMsg, srMsg) => {
    updateWeatherLocationHeader(headerMsg);
    updateScreenReaderConfirmation(srMsg);
};

export const displayApiError = (statusCode) => {
    const properMsg = toProperCase(statusCode.message);
    updateWeatherLocationHeader(properMsg);
    updateScreenReaderConfirmation(`${properMsg}. Please try again.`);
};

const toProperCase = (text) => {
    const words = text.split(" ");
    const properWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return properWords.join(" ");
}

const updateWeatherLocationHeader = (message) => {
    const h1 = document.getElementById("currentForecast__location");
    if(message.indexOf("Lat:") !== -1 && message.indexOf("Long:") !== -1) {
        const msgArray = message.split(" ");
        const mapArray = msgArray.map(msg => {
            return msg.replace(":", ": ");
        });
        const lat = mapArray[0].indexOf("-") === -1 ? mapArray[0].slice(0,10) : mapArray[0].slice(0,11);
        const lon = mapArray[1].indexOf("-") === -1 ? mapArray[1].slice(0,11) : mapArray[1].slice(0,12);
        h1.textContent = `${lat} • ${lon}`;
    } else {
        h1.textContent = message;
    }
};

export const updateScreenReaderConfirmation = (message) => {
    document.getElementById("confirmation").textContent = message;
}

export const updateDisplay = (weatherJson, aqiJson, locationObj) =>{
    fadeDisplay();
    clearDisplay();
    const weatherClass = getWeatherClass(weatherJson.list[0].weather[0].icon);
    setBackgroundImage(weatherClass);
    const screenReaderWeather = buildScreenReaderWeather(weatherJson, locationObj);
    updateScreenReaderConfirmation(screenReaderWeather);
    updateWeatherLocationHeader(locationObj.getName());
    const ccArray = createCurrentConditionsDivs(weatherJson, aqiJson, locationObj.getUnit());
    displayCurrentConditions(ccArray);
    displayFiveDayForecast(weatherJson);
    setFocusOnSearch();
    fadeDisplay();
};

const fadeDisplay =() => { 
    const cc = document.getElementById("currentForecast");
    cc.classList.toggle("zero-vis");
    cc.classList.toggle("fade-in");
    const fiveDay = document.getElementById("dailyForecast");
    fiveDay.classList.toggle("zero-vis");
    fiveDay.classList.toggle("fade-in");
};

const clearDisplay = () => { 
    const currentConditions = document.getElementById("currentForecast__conditions");
    deleteContents(currentConditions);
    const fiveDayForecast = document.getElementById("dailyForecast__contents");
    deleteContents(fiveDayForecast);
}

const deleteContents = (parentElement) => {
    let child = parentElement.lastElementChild;
    while(child){
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
}

const getWeatherClass = (icon) => {
    const firstTwoChars = icon.slice(0,2);
    const lastChar = icon.slice(2);
    const weatherLookup = {
        "09" : "snow",
        "10" : "rain", 
        "11" : "rain", 
        "13" : "snow",
        "50" : "fog",  
    }
    let weatherClass;
    if(weatherLookup[firstTwoChars]) {
        weatherClass = weatherLookup[firstTwoChars];
    } else if (lastChar === "d") {
        weatherClass = "clouds";
    } else {
        weatherClass = "night";
    }
    return weatherClass;
};

const setBackgroundImage = (weatherClass) => {
    document.documentElement.classList.add(weatherClass);
    document.documentElement.classList.forEach(img=>{
        if(img!== weatherClass) document.documentElement.classList.remove(img);
    });
};

const buildScreenReaderWeather =(weatherJson, locationObj) => {
    const location = locationObj.getName();
    const unit = locationObj.getUnit();
    const tempUnit = unit === "imperial" ? "Farenheit" : "Celcius";
    return `${weatherJson.list[0].weather[0].description} and ${Math.round(Number(weatherJson.list[0].main.temp))}°${tempUnit} in ${location}`;
};

const setFocusOnSearch = ()=> {
    document.getElementById("searchBar__text").focus();
}

const createCurrentConditionsDivs = (weatherObj, aqiObj, unit) => {
    const dateTime = document.getElementById("currentForecast__dateTime");
    dateTime.textContent = weatherObj.list[0].dt_txt;
    let t = [];
    let i = 0;
    while(i<8){
        t.push(Math.round(Number(weatherObj.list[i].main.temp_min)));
        t.push(Math.round(Number(weatherObj.list[i].main.temp_max)));
        i++;
    }
    const tempUnit = unit === "imperial" ? "F" : "C";
    const windUnit = unit === "imperial" ? "m/h" : "m/s";
    const icon = createMainImgDiv(weatherObj.list[0].weather[0].icon,weatherObj.list[0].weather[0].description );
    const temp = createElem("div", "temp", `${Math.round(Number(weatherObj.list[0].main.temp))}°`, tempUnit);
    const properDesc = toProperCase(weatherObj.list[0].weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const feels = createElem("div", "feels", `Feels Like ${Math.round(Number(weatherObj.list[0].main.feels_like))}°`);
    const maxTemp = createElem("div", "maxtemp", `High ${Math.max(...t)}°`);
    const minTemp = createElem("div", "mintemp", `Low ${Math.min(...t)}°`);
    const humidity = createElem("div", "humidity", `Humidity ${Math.round(Number(weatherObj.list[0].main.humidity))}%`);
    const wind = createElem("div", "wind", `Wind ${Math.round(Number(weatherObj.list[0].wind.speed))}${windUnit}`);
    const pressure = createElem("div", "pressure", `Pressure ${weatherObj.list[0].main.pressure}hPa`);
    const aqi = createElem("a", "aqi", `AQI ${aqiObj.list[0].main.aqi}`);
    aqi.href = `./aqi.html?date=${weatherObj.list[0].dt_txt.slice(0,weatherObj.list[0].dt_txt.indexOf(" "))}&lat=${weatherObj.city.coord.lat}&lon=${weatherObj.city.coord.lon}`;
    const visibility = createElem("div", "visibility", `Visibility ${Math.round(Number(weatherObj.list[0].visibility)/1000)}km`);
    return [icon, temp, desc, feels, maxTemp, minTemp, humidity, wind, pressure, aqi, visibility];
};

const createMainImgDiv = (icon, altText) => {
    const iconDiv = createElem("div", "icon");
    iconDiv.id = "icon";
    const faIcon = translateIconToFontAwesome(icon);
    faIcon.ariaHidden = true;
    faIcon.title = altText;
    iconDiv.appendChild(faIcon);
    return iconDiv;
};

const createElem = (elemType, divClassName, divText, unit) => {
    const div = document.createElement(elemType);
    div.className = divClassName;
    if (divText) {
        div.innerHTML = divText;
    }
    if (divClassName === "temp") {
        const unitDiv = document.createElement("div");
        unitDiv.className = "unit";
        unitDiv.textContent = unit;
        div.appendChild(unitDiv);
    }
    return div;
};

const translateIconToFontAwesome = (icon) => {
    const i = document.createElement("i");
    const firstTwoChars = icon.slice(0,2);
    const lastChar = icon.slice(2);
    switch(firstTwoChars) {
        case "01" : 
            if(lastChar === "d") {
                i.classList.add("far", "fa-sun");
            } else {
                i.classList.add("far", "fa-moon");
            }
            break;
        case "02" : 
            if(lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun");
            } else {
                i.classList.add("fas", "fa-cloud-moon");
            }
            break;
        case "03" :
            i.classList.add("fas", "fa-cloud"); 
            break;
        case "04" :
            i.classList.add("fas", "fa-cloud-meatball"); 
            break;
        case "09" :
            i.classList.add("fas", "fa-cloud-rain"); 
            break;
        case "10" : 
            if(lastChar === "d") {
                i.classList.add("fas", "fa-cloud-sun-rain");
            } else {
                i.classList.add("fas", "fa-cloud-moon-rain");
            }
            break;
        case "11" :
            i.classList.add("fas", "fa-poo-storm"); 
            break;
        case "13" :
            i.classList.add("far", "fa-snowflake"); 
            break;
        case "50" :
            i.classList.add("fas", "fa-smog"); 
            break;
        default :
            i.classList.add("far", "fa-question-circle");
    }
    return i;
};

const displayCurrentConditions = (currentConditionsArray) => {
    const ccContainer = document.getElementById("currentForecast__conditions");
    currentConditionsArray.forEach(cc => {
        ccContainer.appendChild(cc);
    });
};

const displayFiveDayForecast = (weatherJson) => {
    let str = weatherJson.list[0].dt_txt.slice(0,weatherJson.list[0].dt_txt.indexOf(" "));
    let i = 1;
    while(weatherJson.list[i].dt_txt.slice(0,weatherJson.list[i].dt_txt.indexOf(" ")) === str){
        i++;
    }
    for(let j = i;j<=39;j+=8){
        let temp=[];
            for(let k=j;k<=j+7;k++){
                if(k>39){
                    break;
                }
                temp.push(Math.round(Number(weatherJson.list[k].main.temp_min)));
                temp.push(Math.round(Number(weatherJson.list[k].main.temp_max)));
            }
        const lat = weatherJson.city.coord.lat;
        const lon = weatherJson.city.coord.lon;
        const dfArray = createDailyForecastDivs(lat, lon, weatherJson.list[j], Math.max(...temp), Math.min(...temp));
        displayDailyForecast(dfArray);
    }
};

const createDailyForecastDivs = (lat, lon ,dayWeather, max_temp, min_temp) => {
    const date = dayWeather.dt_txt.slice(0,dayWeather.dt_txt.indexOf(" "));
    const dayAbbreviationText = getDayAbbreviation(dayWeather.dt);
    const dayAbbreviation = createElem("p", "dayAbbreviation", dayAbbreviationText);
    const dayIcon = createDailyForecastIcon(dayWeather.weather[0].icon.slice(0,2)+"d", dayWeather.weather[0].description);
    const dayHigh =  createElem("p", "dayHigh", `${max_temp}°`);
    const dayLow =  createElem("p", "dayLow", `${min_temp}°`);
    return [date, lat,lon, dayAbbreviation, dayIcon, dayHigh, dayLow];
};

const getDayAbbreviation = (data) => {
    const dateObj = new Date(data * 1000);
    const utcString = dateObj.toUTCString();
    return utcString.slice(0, 3).toUpperCase();
};

const createDailyForecastIcon = (icon, altText)=> {
    const img = document.createElement("img");
    if(window.innerWidth<786 || window.innerHeight < 1025) {
        img.src = `https://openweathermap.org/img/wn/${icon}.png`;
    } else {
        img.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    }
    img.alt = altText;
    return img;
};

const displayDailyForecast = (dfArray) => {
    const dayDiv = createElem("a", "forecastDay");
    const date = dfArray.shift();
    const lat = dfArray.shift();
    const lon = dfArray.shift();
    dfArray.forEach(el => {
        dayDiv.appendChild(el);
        dayDiv.classList.add(date);
        dayDiv.href = `./hourlyForecast.html?date=${date}&lat=${lat}&lon=${lon}`;
    });
    const dailyForecastContainer = document.getElementById("dailyForecast__contents");
    dailyForecastContainer.appendChild(dayDiv);
};

export const displayThreeHourForecast = (weatherArray) => {
    weatherArray.forEach(item => {
        createThreeHourForecastDivs(item);
    });
}
const createThreeHourForecastDivs = (item)=>{
    const container = document.getElementById("threeHourForecast__conditions");
    const threeHourForecast__div = createElem("div", "threeHourForecast__div");
    const time = createElem("div", "time", item.dt_txt.slice(item.dt_txt.indexOf(" ")+1));
    const temp = createElem("div", "temperature", `Temp ${Math.round(Number(item.main.temp))}°`);
    const properDesc = toProperCase(item.weather[0].description);
    const desc = createElem("div", "desc", properDesc);
    const humidity = createElem("div", "humidity", `Humidity ${Math.round(Number(item.main.humidity))}%`);
    const wind = createElem("div", "wind", `Wind ${Math.round(Number(item.wind.speed))}m/s`);
    const pressure = createElem("div", "pressure", `Pressure ${item.main.pressure}hPa`);
    const icon = createDailyForecastIcon(item.weather[0].icon,item.weather[0].description );
    const forecastArray = [time, temp, desc, humidity, wind, pressure,icon];
    forecastArray.forEach(el => threeHourForecast__div.appendChild(el));
    container.appendChild(threeHourForecast__div);
};

export const displayAirQualityDetails = (aqiJson) => {
    createAirQualityDetailsDivs(aqiJson);
}

const createAirQualityDetailsDivs = (aqiJson)=>{
    const container = document.getElementById("airQuality__conditions");
    const aqiIndex = createElem("div", "aqi", `AQI: ${Number(aqiJson.list[0].main.aqi)}`);
    const pollutants = createElem("div", "pollutants");
    const name = createElem("div", "name", `Pollutant`);
    const value = createElem("div", "value", `Concentration in μg/m<sup>3</sup>`);
    const coname = createElem("div", "co name", `CO:`);
    const covalue= createElem("div", "co value", `${Number(aqiJson.list[0].components.co)}`);
    const nh3name = createElem("div", "nh3 name", `NH<sub>3</sub>:`);
    const nh3value = createElem("div", "nh3 value", `${Number(aqiJson.list[0].components.nh3)}`);
    const noname = createElem("div", "no name", `NO:`);
    const novalue = createElem("div", "no value", `${Number(aqiJson.list[0].components.no)}`);
    const no2name = createElem("div", "no2 name", `NO<sub>2</sub>:`);
    const no2value = createElem("div", "no2 value", `${Number(aqiJson.list[0].components.no2)}`);
    const o3name = createElem("div", "o3 name", `O<sub>3</sub>:`);
    const o3value = createElem("div", "o3 value", `${Number(aqiJson.list[0].components.o3)}`);
    const pm25name = createElem("div", "pm2_5 name", `PM<sub>2.5</sub>:`);
    const pm25value = createElem("div", "pm2_5 value", `${Number(aqiJson.list[0].components.pm2_5)}`);
    const pm10name = createElem("div", "pm10 name", `PM<sub>10</sub>:`);
    const pm10value = createElem("div", "pm10 value", `${Number(aqiJson.list[0].components.pm10)}`);
    const so2name = createElem("div", "so2 name", `SO<sub>2</sub>:`);
    const so2value = createElem("div", "so2 value", `${Number(aqiJson.list[0].components.so2)}`);
    const pollutantsArray = [name, value, coname, covalue, nh3name, nh3value, noname, novalue, no2name, no2value, o3name, o3value, pm25name, pm25value, pm10name, pm10value, so2name, so2value];
    pollutantsArray.forEach(el => {
        pollutants.appendChild(el);
    });
    container.appendChild(aqiIndex);
    container.appendChild(pollutants);
};