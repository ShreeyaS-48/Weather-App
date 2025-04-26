const fetch = require("node-fetch");

const { WEATHER_API_KEY } = process.env;

exports.handler = async(event, context) => {
    const params = JSON.parse(event.body);
    const { lat, lon} = params;
    const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
    try {
        const aqiStream = await fetch(url);
        const aqiJson = await aqiStream.json();
        return {
            statusCode: 200,
            body : JSON.stringify(aqiJson)
        };
    } catch(err) {
        return {
            statusCode: 422, 
            body: err.stack
        };
    }
}