
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const errorMessage = document.getElementById("errorMessage");
const forecastContainer = document.getElementById("forecast");

// Weather condition and icon
function getWeatherInfo(code) {

    const weatherTypes = {
        0: ["Clear Sky", "☀️"],
        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],
        45: ["Foggy", "🌫️"],
        48: ["Rime Fog", "🌫️"],
        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],
        56: ["Freezing Drizzle", "🌧️"],
        57: ["Freezing Drizzle", "🌧️"],
        61: ["Light Rain", "🌧️"],
        63: ["Moderate Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],
        66: ["Freezing Rain", "🌧️"],
        67: ["Heavy Freezing Rain", "🌧️"],
        71: ["Light Snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],
        77: ["Snow Grains", "🌨️"],
        80: ["Rain Showers", "🌦️"],
        81: ["Moderate Showers", "🌧️"],
        82: ["Heavy Showers", "⛈️"],
        85: ["Snow Showers", "🌨️"],
        86: ["Heavy Snow Showers", "❄️"],
        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm with Hail", "⛈️"],
        99: ["Severe Thunderstorm", "⛈️"]
    };

    return weatherTypes[code] || ["Unknown Weather", "🌡️"];
}


// Search city and get coordinates
async function getWeather(city) {

    try {

        errorMessage.textContent = "";
        searchBtn.disabled = true;
        searchBtn.textContent = "Loading...";
        cityName.textContent = "Fetching weather...";
        forecastContainer.innerHTML = "<p>Loading forecast...</p>";

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error("Unable to search city. Try again.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found! Please enter a valid city name.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Fetch real-time weather and 5-day forecast
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`
        );

        if (!weatherResponse.ok) {
            throw new Error("Weather data unavailable. Please try again.");
        }

        const weatherData = await weatherResponse.json();

        displayWeather(location, weatherData);

    } catch (error) {

        errorMessage.textContent = error.message;
        cityName.textContent = "Weather unavailable";
        temperature.textContent = "--°C";
        description.textContent = "Please try another city";
        weatherIcon.textContent = "❓";
        humidity.textContent = "--%";
        wind.textContent = "-- km/h";
        forecastContainer.innerHTML =
            "<p>Forecast is unavailable.</p>";

    } finally {

        searchBtn.disabled = false;
        searchBtn.textContent = "Search";

    }
}


// Display current weather
function displayWeather(location, data) {

    const current = data.current;

    const weather = getWeatherInfo(current.weather_code);

    cityName.textContent =
        `${location.name}, ${location.country}`;

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    description.textContent = weather[0];

    weatherIcon.textContent = weather[1];

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${current.wind_speed_10m} km/h`;

    displayForecast(data.daily);

}


// Display 5-day forecast
function displayForecast(daily) {

    forecastContainer.innerHTML = "";

    daily.time.forEach((date, index) => {

        const weather = getWeatherInfo(
            daily.weather_code[index]
        );

        const dayName = new Date(
            date + "T12:00:00"
        ).toLocaleDateString("en-US", {
            weekday: "short"
        });

        const maxTemp = Math.round(
            daily.temperature_2m_max[index]
        );

        const minTemp = Math.round(
            daily.temperature_2m_min[index]
        );

        const rainChance =
            daily.precipitation_probability_max[index];

        const forecastCard = document.createElement("div");

        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <h3>${dayName}</h3>
            <div class="icon">${weather[1]}</div>
            <p>${maxTemp}° / ${minTemp}°</p>
            <small>${weather[0]}</small>
            <br>
            <small>💧 ${rainChance ?? "--"}%</small>
        `;

        forecastContainer.appendChild(forecastCard);

    });

}


// Search button
searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {
        errorMessage.textContent =
            "Please enter a city name!";
        cityInput.focus();
        return;
    }

    getWeather(city);

});


// Search using Enter key
cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }

});


// Default city when website opens
getWeather("Chennai");
