import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

const getWeatherTheme = (weatherCode) => {
  if ([0].includes(weatherCode)) return 'clear';
  if ([1, 2].includes(weatherCode)) return 'partly-cloudy';
  if ([3].includes(weatherCode)) return 'cloudy';
  if ([45, 48].includes(weatherCode)) return 'fog';
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) return 'rain';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return 'snow';
  if ([95, 96, 99].includes(weatherCode)) return 'storm';
  return 'clear';
};

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C');
  const [themeMode, setThemeMode] = useState('dark');
  const [searchHistory, setSearchHistory] = useState([]);

  const currentWeatherCode = weatherData?.hourly?.weather_code?.[new Date().getHours()] ?? 0;
  const weatherTheme = getWeatherTheme(currentWeatherCode);

  const formatTemperature = (value) => {
    if (unit === 'F') {
      return Math.round((value * 9) / 5 + 32);
    }
    return Math.round(value);
  };

  const fetchWeatherData = async (latitude, longitude, city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);
      const data = await response.json();
      if (response.ok) {
        setWeatherData(data);
        setCityName(city);
        const [cityName, country] = city.split(',').map((part) => part.trim());
        fetch('/api/search-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cityName, country, latitude, longitude })
        }).then(() => loadSearchHistory()).catch(() => {});
      } else {
        setError('Error fetching weather data. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to the weather service. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const response = await fetch('/api/search-history');
      if (response.ok) {
        setSearchHistory(await response.json());
      }
    } catch {
      // Search history is optional and should not block weather loading.
    }
  };

  const fetchCityCoordinates = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/geocode?name=${encodeURIComponent(city)}`);
      const data = await response.json();
      if (response.ok && data.results && data.results.length > 0) {
        const { latitude, longitude, name, country } = data.results[0];
        fetchWeatherData(latitude, longitude, `${name}, ${country}`);
      } else {
        setError('City not found. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to get city coordinates. Please check your spelling.');
      setLoading(false);
    }
  };

  const fetchCityNameFromCoords = async (latitude, longitude) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
      fetchWeatherData(latitude, longitude, city);
    } catch {
      fetchWeatherData(latitude, longitude, 'Your Location');
    }
  };

  useEffect(() => {
    loadSearchHistory();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchCityNameFromCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Geolocation denied. Showing default city weather.');
          fetchCityCoordinates('New York');
        }
      );
    } else {
      fetchCityCoordinates('London');
    }
  }, []);

  return (
    <div className={`weather-app-shell theme-${themeMode} weather-${weatherTheme}`}>
      <div className="weather-panel">
        <div className="top-controls">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            {themeMode === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          <div className="unit-toggle" aria-label="Temperature unit toggle">
            <button type="button" className={unit === 'C' ? 'active' : ''} onClick={() => setUnit('C')}>
              °C
            </button>
            <button type="button" className={unit === 'F' ? 'active' : ''} onClick={() => setUnit('F')}>
              °F
            </button>
          </div>
        </div>

        <SearchBar onSearch={fetchCityCoordinates} />

        {searchHistory.length > 0 && (
          <div className="recent-searches">
            <span className="recent-label">Recent</span>
            <div className="recent-list">
              {searchHistory.slice(0, 5).map((search) => (
                <button
                  type="button"
                  className="recent-city"
                  key={`${search.city_name}-${search.searched_at}`}
                  onClick={() => fetchWeatherData(search.latitude, search.longitude, `${search.city_name}${search.country ? `, ${search.country}` : ''}`)}
                >
                  📍 {search.city_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="error-banner" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && weatherData && (
          <WeatherDisplay
            data={weatherData}
            city={cityName}
            unit={unit}
            formatTemperature={formatTemperature}
            themeMode={themeMode}
          />
        )}
      </div>
    </div>
  );
}

export default App;