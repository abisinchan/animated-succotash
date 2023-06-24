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
const cityHistoryElement = document.querySelector('.cityHistory');
const apiKey = 'ef3834312c73da95dcd5c0744aacfc9b';

// Function to get the weather data for the given city
function getWeatherData(city) {
  // Call the current weather API to get the current weather data
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
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

      // Save the city in local storage
      saveCity(city);
    })
    .catch((error) => {
      console.log('Error fetching current weather:', error);
      // Display error message
      cityNameElement.textContent = 'City not found';
    });

  // Call the 5-day forecast API to get the forecast data
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`
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
      // Display error message
      forecastItemsElement.innerHTML = '<p>Error fetching forecast</p>';
    });
}

// Event listener for form submission
searchForm.addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent form submission

  const city = searchInput.value.trim();

  if (city !== '') {
    // Clear search input
    searchInput.value = '';

    // Get weather data for the entered city
    getWeatherData(city);
  }
});

// Function to get the current date in the format "Day, Month Date"
function getCurrentDate() {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const currentDate = new Date();
  return currentDate.toLocaleDateString(undefined, options);
}

// Function to format the forecast date from UNIX timestamp
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Function to save the city in local storage
function saveCity(city) {
  // Retrieve the existing city history from local storage
  let cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];

  // Check if the city is already in the city history
  const existingCityIndex = cityHistory.findIndex(
    (item) => item.city.toLowerCase() === city.toLowerCase()
  );

  // If the city is already in the city history, remove it
  if (existingCityIndex > -1) {
    cityHistory.splice(existingCityIndex, 1);
  }

  // Add the city to the beginning of the city history
  cityHistory.unshift({ city });

  // Limit the city history to 8 items
  cityHistory = cityHistory.slice(0, 8);

  // Save the updated city history in local storage
  localStorage.setItem('cityHistory', JSON.stringify(cityHistory));

  // Display the city history
  displayCityHistory(cityHistory);
}

// Function to display the city history buttons
function displayCityHistory(cityHistory) {
  // Clear previous city history buttons
  cityHistoryElement.innerHTML = '';

  // Create a button for each city in the city history
  for (const item of cityHistory) {
    const cityButton = document.createElement('button');
    cityButton.textContent = item.city;
    cityButton.addEventListener('click', () => {
      // Get weather data for the clicked city
      getWeatherData(item.city);
    });

    cityHistoryElement.appendChild(cityButton);
  }
}

// Function to retrieve and display the city history on page load
function displayInitialCityHistory() {
  // Retrieve the city history from local storage
  const cityHistory = JSON.parse(localStorage.getItem('cityHistory'));

  // Display the city history
  if (cityHistory) {
    displayCityHistory(cityHistory);
  }
}

// Get user's location and fetch weather data
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            const city = data[0].name;
            getWeatherData(city);
          } else {
            console.log('Location not found');
          }
        })
        .catch((error) => {
          console.log('Error fetching location:', error);
        });
    },
    (error) => {
      console.log('Error getting location:', error);
    }
  );
}

// Display the initial city history on page load
displayInitialCityHistory();
