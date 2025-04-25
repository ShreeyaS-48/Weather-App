export default class CurrentLocation {
    #name;
    #lat;
    #lon;
    #unit;
    constructor() {
        this.#name = "Current Location";
        this.#lat = null;
        this.#lon = null;
        this.#unit = "metric";
    }
    getName() {
        return this.#name;
    }
    setName(name) {
        this.#name = name;
    }
    getLat() {
        return this.#lat;
    }
    setLat(lat) {
        this.#lat = lat;
    }
    getLon() {
        return this.#lon;
    }
    setLon(lon) {
        this.#lon = lon;
    }
    getUnit() {
        return this.#unit;
    }
    setUnit(unit) {
        this.#unit = unit;
    }
    toggleUnit(){
        this.#unit = this.#unit === "imperial" ? "metric" : "imperial";
    }
}