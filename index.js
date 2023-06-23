const apiKey = 'ef3834312c73da95dcd5c0744aacfc9b';

const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
    event.preventDefault();

    const cityInput = document.getElementById('city-input');
    const cityName = cityInput.value.trim();

    if (cityName !== '') {
        fetchWeatherData(cityName);
    } else {
        alert('Please enter a city name.');
    }

    cityInput.value = '';
}

function fetchWeatherData(cityName) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                fetchWeatherByCoordinates(lat, lon);
            } else {
                console.log('No results found for the given city name.');
            }
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

function fetchWeatherByCoordinates(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const city = data.timezone.split('/').pop(); // Extract the city name from the timezone
            const currentWeather = data.current;
            const dailyWeather = data.daily;

            updateWeatherUI(city, currentWeather, dailyWeather);
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

function updateWeatherUI(city, currentWeather, dailyWeather) {
    const cityNameElement = document.getElementById('city-name');
    const currentDateElement = document.getElementById('current-date');
    const currentTemperatureElement = document.getElementById('current-temperature');
    const currentHumidityElement = document.getElementById('current-humidity');
    const currentWindSpeedElement = document.getElementById('current-wind-speed');
    const currentIconElement = document.getElementById('current-icon');
    const forecastItemsElement = document.getElementById('forecast-items');

    cityNameElement.textContent = city;
    currentDateElement.textContent = `Date: ${new Date(currentWeather.dt * 1000).toLocaleDateString()}`;
    currentTemperatureElement.textContent = `Temperature: ${currentWeather.temp}°C`;
    currentHumidityElement.textContent = `Humidity: ${currentWeather.humidity}%`;
    currentWindSpeedElement.textContent = `Wind Speed: ${currentWeather.wind_speed} m/s`;
    currentIconElement.src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}.png`;
    currentIconElement.alt = 'Weather Icon';

    forecastItemsElement.innerHTML = '';

    dailyWeather.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecastItem');
        forecastItem.innerHTML = `
            <p>Date: ${new Date(day.dt * 1000).toLocaleDateString()}</p>
            <p>Temperature: ${day.temp.day}°C</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Wind Speed: ${day.wind_speed} m/s</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
        `;
        forecastItemsElement.appendChild(forecastItem);
    });
}
