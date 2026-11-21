import apiKey from "./weather-config.js";

const haikuLocation = {
    latitude: 20.921,
    longitude: -156.305
};

export async function loadWeather() {
    const weatherStatus = document.querySelector("#weather-status");
    const currentTemperature = document.querySelector("#weather-temperature");
    const currentDescription = document.querySelector("#weather-description");
    const currentWeatherIcon = document.querySelector("#weather-icon");
    const forecastList = document.querySelector("#weather-forecast");

    if (!weatherStatus || !currentTemperature || !currentDescription ||
        !currentWeatherIcon || !forecastList) {
        return;
    }

    if (!apiKey || apiKey.trim() === "") {
        weatherStatus.textContent = "Weather data is unavailable right now.";
        return;
    }

    try {
        const parameters = new URLSearchParams({
            lat: haikuLocation.latitude,
            lon: haikuLocation.longitude,
            units: "imperial",
            appid: apiKey
        });
        const currentUrl = "https://api.openweathermap.org/data/2.5/weather?" + parameters;
        const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?" + parameters;
        const [current, forecast] = await Promise.all([
            fetchWeather(currentUrl),
            fetchWeather(forecastUrl)
        ]);

        renderCurrentWeather(current, currentTemperature, currentDescription, currentWeatherIcon);
        renderForecast(forecast, forecastList, Date.now() / 1000);
        weatherStatus.textContent = "Weather data for Haiku, Hawaii, USA.";
    } catch (error) {
        console.error("Unable to load Haiku weather from OpenWeatherMap.", error);
        weatherStatus.textContent = "Weather data is unavailable right now.";
    }
}

async function fetchWeather(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Weather request failed");
    }
    return response.json();
}

function renderCurrentWeather(data, temperature, description, icon) {
    temperature.textContent = Math.round(data.main.temp);
    description.textContent = data.weather[0].description;
    icon.src = "https://openweathermap.org/img/wn/" +
        data.weather[0].icon + "@2x.png";
    icon.alt = data.weather[0].description;
}

function renderForecast(data, forecastList, currentTimestamp) {
    const todayKey = getHaikuDateKey(currentTimestamp);
    const forecastDays = new Map();

    for (const entry of data.list) {
        const dateKey = getHaikuDateKey(entry.dt);
        if (dateKey === todayKey) {
            continue;
        }

        const day = forecastDays.get(dateKey);
        if (day) {
            day.high = Math.max(day.high, entry.main.temp_max);
            day.low = Math.min(day.low, entry.main.temp_min);
        } else {
            forecastDays.set(dateKey, {
                timestamp: entry.dt,
                high: entry.main.temp_max,
                low: entry.main.temp_min
            });
        }
    }

    forecastList.replaceChildren();
    for (const temperatures of Array.from(forecastDays.values()).slice(0, 3)) {
        const item = document.createElement("li");
        const date = document.createElement("strong");
        date.textContent = formatForecastDate(temperatures.timestamp);

        const high = document.createElement("span");
        high.textContent = "High: " + Math.round(temperatures.high) + " °F";

        const low = document.createElement("span");
        low.textContent = "Low: " + Math.round(temperatures.low) + " °F";

        item.append(date, high, low);
        forecastList.appendChild(item);
    }
}

function getHaikuDateKey(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        timeZone: "Pacific/Honolulu"
    });
}

function formatForecastDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: "Pacific/Honolulu"
    });
}
