const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const currentYearElement = document.querySelector("#currentYear");
const lastModifiedElement = document.querySelector("#lastModified");
const weatherStatus = document.querySelector("#weather-status");
const currentTemperature = document.querySelector("#weather-temperature");
const currentDescription = document.querySelector("#weather-description");
const currentWeatherIcon = document.querySelector("#weather-icon");
const forecastList = document.querySelector("#weather-forecast");
const spotlightContainer = document.querySelector("#spotlight-cards");
const spotlightStatus = document.querySelector("#spotlight-status");

const haikuLocation = {
    latitude: 20.921,
    longitude: -156.305
};

document.documentElement.classList.add("js");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
            menuToggle.setAttribute("aria-expanded", "false");
        } else {
            menuToggle.setAttribute("aria-expanded", "true");
        }
        navigation.classList.toggle("is-open", !isExpanded);
    });
}

if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

if (lastModifiedElement) {
    lastModifiedElement.textContent = document.lastModified;
}

loadWeather();

if (spotlightContainer && spotlightStatus) {
    loadSpotlights();
}

async function loadWeather() {
    weatherStatus.textContent = "Loading weather...";

    const hasKey = window.OPENWEATHERMAP_API_KEY &&
        window.OPENWEATHERMAP_API_KEY.trim() !== "";
    const isLocalPage = location.protocol === "file:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

    if (!hasKey && isLocalPage) {
        try {
            await loadLocalWeatherConfig();
        } catch (error) {
            console.error("Unable to load the local weather config.", error);
        }
    }

    await apiFetch();
}

function loadLocalWeatherConfig() {
    return new Promise(function (resolve, reject) {
        const configScript = document.createElement("script");
        configScript.src = "scripts/weather-config.local.js";
        configScript.addEventListener("load", resolve, { once: true });
        configScript.addEventListener("error", function () {
            reject(new Error("Local weather config file could not be loaded."));
        }, { once: true });
        document.head.appendChild(configScript);
    });
}

async function apiFetch() {
    const apiKey = window.OPENWEATHERMAP_API_KEY || "";
    if (!apiKey.trim()) {
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
        const current = await fetchWeather(currentUrl);
        const forecast = await fetchWeather(forecastUrl);
        renderCurrentWeather(current);
        renderForecast(forecast, Date.now() / 1000);
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

function renderCurrentWeather(data) {
    currentTemperature.textContent = Math.round(data.main.temp);
    currentDescription.textContent = data.weather[0].description;
    currentWeatherIcon.src = "https://openweathermap.org/img/wn/" +
        data.weather[0].icon + "@2x.png";
    currentWeatherIcon.alt = data.weather[0].description;
}

function renderForecast(data, currentTimestamp) {
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

        item.appendChild(date);
        item.appendChild(high);
        item.appendChild(low);
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

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error("Member data request failed: " + response.status);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member data must be an array.");
        }

        const eligibleMembers = members.filter(function (member) {
            return member.membership === 2 || member.membership === 3;
        });
        if (eligibleMembers.length === 0) {
            spotlightStatus.textContent = "No silver or gold members are available to feature.";
            return;
        }
        if (eligibleMembers.length < 2) {
            spotlightStatus.textContent = "At least two silver or gold members are needed for spotlights.";
            return;
        }

        const spotlightCount = eligibleMembers.length === 2 || Math.random() < 0.5 ? 2 : 3;
        const shuffledMembers = eligibleMembers.slice();
        for (let i = shuffledMembers.length - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            const member = shuffledMembers[i];
            shuffledMembers[i] = shuffledMembers[randomIndex];
            shuffledMembers[randomIndex] = member;
        }

        const selectedMembers = shuffledMembers.slice(0, spotlightCount);
        spotlightContainer.classList.toggle("spotlight-count-3", spotlightCount === 3);
        spotlightContainer.replaceChildren(
            ...selectedMembers.map(createSpotlightCard)
        );

        spotlightStatus.textContent = "Showing " + spotlightCount + " silver and gold members.";
    } catch (error) {
        console.error("Unable to load spotlight members.", error);
        spotlightStatus.textContent = "Spotlight members could not be loaded right now.";
    }
}

function createSpotlightCard(member) {
    const card = document.createElement("article");
    card.className = "business-card spotlight-card";

    const heading = document.createElement("h3");
    heading.className = "business-card-heading";
    heading.textContent = member.name;

    const details = document.createElement("div");
    details.className = "business-card-details";

    const logo = document.createElement("img");
    logo.className = "business-card-logo";
    logo.src = "images/" + member.image;
    logo.alt = member.name + " logo";
    logo.width = 160;
    logo.height = 160;
    logo.loading = "lazy";

    const information = document.createElement("div");
    const phone = document.createElement("p");
    phone.textContent = "Phone: " + member.phone;

    const address = document.createElement("p");
    address.textContent = "Address: " + member.address;

    const website = document.createElement("p");
    const websiteLink = document.createElement("a");
    websiteLink.href = member.website;
    websiteLink.textContent = member.website;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";
    website.appendChild(document.createTextNode("Website: "));
    website.appendChild(websiteLink);

    const membership = document.createElement("p");
    membership.className = "spotlight-membership";
    membership.textContent = "Membership: ";
    if (member.membership === 3) {
        membership.textContent += "Gold";
    } else {
        membership.textContent += "Silver";
    }

    information.appendChild(phone);
    information.appendChild(address);
    information.appendChild(website);
    information.appendChild(membership);
    details.appendChild(logo);
    details.appendChild(information);
    card.appendChild(heading);
    card.appendChild(details);

    return card;
}