// Get references to the necessary HTML elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const cityNameElement = document.getElementById('city-name');
const currentDateElement = document.getElementById('current-date');
const currentTemperatureElement = document.getElementById('current-temperature');
const currentHumidityElement = document.getElementById('current-humidity');
const currentWindSpeedElement = document.getElementById('current-wind-speed');
const currentIconElement = document.getElementById('current-icon');
const forecastItemsElement = document.getElementById('forecast-items');
const apiKey = 'ef3834312c73da95dcd5c0744aacfc9b';

// Event listener for form submission
searchForm.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form submission

  const searchQuery = searchInput.value.trim();

  // Call the geocoding API to get latitude and longitude for the city
  fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=1&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const { lat, lon } = data[0];

        // Call the current weather API to get the current weather data
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            // Update the current weather elements with the retrieved data
            cityNameElement.textContent = data.name;
            currentDateElement.textContent = getCurrentDate();
            // Convert temperature from Kelvin to Fahrenheit
            const currentTemperatureFahrenheit = Math.round(
              ((data.main.temp - 273.15) * 9) / 5 + 32
            );
            currentTemperatureElement.textContent = `${currentTemperatureFahrenheit}°F`;
            currentHumidityElement.textContent = `Humidity: ${data.main.humidity}%`;
            currentWindSpeedElement.textContent = `Wind Speed: ${data.wind.speed} m/s`;
            currentIconElement.setAttribute(
              'src',
              `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`
            );
            currentIconElement.setAttribute('alt', data.weather[0].description);
          })
          .catch((error) => {
            console.log('Error fetching current weather:', error);
          });

        // Call the 5-day forecast API to get the forecast data
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            // Clear previous forecast items
            forecastItemsElement.innerHTML = '';

            // Loop through the forecast data and create forecast items for each day
            for (let i = 0; i < data.list.length; i += 8) {
              const forecast = data.list[i];

              const forecastItem = document.createElement('div');
              forecastItem.classList.add('forecast-item');

              const forecastDate = document.createElement('p');
              forecastDate.textContent = formatDate(forecast.dt);
              forecastItem.appendChild(forecastDate);

              // Convert temperature from Kelvin to Fahrenheit
              const forecastTemperatureFahrenheit = Math.round(
                ((forecast.main.temp - 273.15) * 9) / 5 + 32
              );

              const forecastTemperature = document.createElement('p');
              forecastTemperature.textContent = `${forecastTemperatureFahrenheit}°F`;
              forecastItem.appendChild(forecastTemperature);

              const forecastIcon = document.createElement('img');
              forecastIcon.setAttribute(
                'src',
                `http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`
              );
              forecastIcon.setAttribute('alt', forecast.weather[0].description);
              forecastItem.appendChild(forecastIcon);

              forecastItemsElement.appendChild(forecastItem);
            }
          })
          .catch((error) => {
            console.log('Error fetching forecast:', error);
          });
      } else {
        // Clear previous weather data
        cityNameElement.textContent = '';
        currentDateElement.textContent = '';
        currentTemperatureElement.textContent = '';
        currentHumidityElement.textContent = '';
        currentWindSpeedElement.textContent = '';
        currentIconElement.setAttribute('src', '');
        currentIconElement.setAttribute('alt', '');

        // Display city not found message
        cityNameElement.textContent = 'City not found';
      }
    })
    .catch((error) => {
      console.log('Error fetching geocoding:', error);
    });
});

// Function to get the current date in the format "Day, Month Date"
function getCurrentDate() {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const currentDate = new Date();
  return currentDate.toLocaleDateString(undefined, options);
}

// Function to format the forecast date
function formatDate(timestamp) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const forecastDate = new Date(timestamp * 1000);
  return forecastDate.toLocaleDateString(undefined, options);
}
