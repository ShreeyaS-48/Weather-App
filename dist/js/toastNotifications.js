export const generateNotification =  (weatherJson, aqiJson, locationObj)=>{
    const msg = getNotificationMsg(weatherJson, aqiJson, locationObj);
    if(msg!== null) {
        const toastContainer = document.getElementById("toastNotifications__container");
        const notification = document.createElement("div");
        notification.classList.add("notification");
        notification.innerHTML = msg;
        toastContainer.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

const getNotificationMsg = (weatherJson, aqiJson, locationObj) => {
    let msg = null;
    if(weatherJson.list[0].weather[0].description.indexOf("rain")!== -1){
        msg = '<i class="fa-solid fa-cloud-rain"></i><p>Carry umbrella!</p>';
    } else if(locationObj.getUnit()==="imperial" && (Number(weatherJson.list[0].main.temp)>=95)||locationObj.getUnit()==="metric" && (Number(weatherJson.list[0].main.temp)>35)){
        msg = '<i class="fa-solid fa-glass-water"></i><p>Stay hydrated!</p>';
    } else if(weatherJson.list[0].weather[0].description.indexOf("snow")!== -1){
        msg = '<i class="fa-solid fa-snowflake"></i><p>Snow Expected!</p>';
    } else if(weatherJson.list[0].weather[0].description.indexOf("thunderstorm")!== -1){
        msg = '<i class="fa-solid fa-cloud-bolt"></i><p>Storm Expected!</p>';
    } else if (Number(aqiJson.list[0].main.aqi) > 3) {
        msg = '<i class="fa-solid fa-triangle-exclamation"></i><p>Poor Air Quality!</p>';
    }
    return msg;
}