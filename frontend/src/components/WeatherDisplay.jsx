import React from 'react';
import ForecastCard from './ForecastCard';
import { getWeatherDescription, getWeatherIcon } from '../constants/weatherUtils';

const WeatherDisplay = ({ data, city, unit, formatTemperature, themeMode }) => {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentHour = now.getHours();

  const temperature = data.hourly.temperature_2m[currentHour];
  const feelsLike = data.hourly.apparent_temperature[currentHour];
  const relativeHumidity = data.hourly.relative_humidity_2m[currentHour];
  const windSpeed = data.hourly.wind_speed_10m[currentHour];
  const windDirection = data.hourly.wind_direction_10m?.[currentHour] ?? 0;
  const visibility = data.hourly.visibility?.[currentHour] ?? 0;
  const pressure = data.hourly.surface_pressure[currentHour];
  const weatherCode = data.hourly.weather_code[currentHour];
  const uvIndex = Math.round(data.hourly.uv_index?.[currentHour] ?? data.daily.uv_index_max?.[0] ?? 0);
  const airQuality = data.air_quality?.hourly;
  const aqi = Math.round(airQuality?.us_aqi?.[currentHour] ?? 0);
  const pm25 = airQuality?.pm2_5?.[currentHour] ?? 0;
  const pm10 = airQuality?.pm10?.[currentHour] ?? 0;
  const carbonMonoxide = airQuality?.carbon_monoxide?.[currentHour] ?? 0;
  const nitrogenDioxide = airQuality?.nitrogen_dioxide?.[currentHour] ?? 0;
  const airQualityIsGood = aqi <= 50;

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const sunriseTime = new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const sunsetTime = new Date(data.daily.sunset[0]).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const todayEntries = data.hourly.time
    .map((time, index) => ({
      time: new Date(time),
      temp: data.hourly.temperature_2m[index],
      rainChance: data.hourly.precipitation_probability?.[index] ?? 0
    }))
    .filter((entry) => {
      const entryDate = entry.time;
      return (
        entryDate.getFullYear() === now.getFullYear() &&
        entryDate.getMonth() === now.getMonth() &&
        entryDate.getDate() === now.getDate()
      );
    });

  const maxTempToday = Math.max(...todayEntries.map((entry) => entry.temp));
  const maxRainChance = Math.max(...todayEntries.map((entry) => entry.rainChance));
  const peakTempEntry = todayEntries.reduce((max, entry) => (entry.temp > max.temp ? entry : max), todayEntries[0]);

  const rainWindow = todayEntries.filter((entry) => entry.rainChance >= 60);
  const rainStart = rainWindow[0]?.time;
  const rainEnd = rainWindow[rainWindow.length - 1]?.time;

  const bestOutdoorWindow = todayEntries.find(
    (entry) => entry.time.getHours() >= 7 && entry.time.getHours() <= 10 && entry.rainChance < 30
  );

  const recommendation =
    maxRainChance >= 70
      ? {
          icon: '☂️',
          title: 'Carry an umbrella',
          detail: `Rain probability: ${maxRainChance}% between ${rainStart?.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          })} – ${rainEnd?.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          })}`
        }
      : {
          icon: '👕',
          title: 'Light clothes recommended',
          detail: `Temperature will reach ${formatTemperature(maxTempToday)}°${unit} today.`
        };

  const alert =
    maxRainChance >= 75 && rainStart && rainEnd
      ? {
          icon: '⚠️',
          title: 'Heavy Rain Alert',
          detail: `Expected between ${rainStart.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          })} – ${rainEnd.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
          })}.`
        }
      : null;

  const hourlyForecast = data.hourly.time
    .map((time, index) => ({
      time: new Date(time),
      temperature: data.hourly.temperature_2m[index],
      weatherCode: data.hourly.weather_code[index],
      rainChance: data.hourly.precipitation_probability?.[index] ?? 0
    }))
    .filter((entry) => entry.time >= now)
    .slice(0, 12);

  const insightItems = [
    {
      icon: '🌧️',
      text: rainStart
        ? `Rain is likely after ${rainStart.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
        : 'Rain chances stay low today.'
    },
    {
      icon: '🌡️',
      text: `Temperature will peak at ${formatTemperature(peakTempEntry.temp)}°${unit} around ${peakTempEntry.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
    },
    {
      icon: '🏃',
      text: bestOutdoorWindow
        ? `Best outdoor time: ${bestOutdoorWindow.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(bestOutdoorWindow.time.getTime() + 3 * 60 * 60 * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
        : 'Outdoor conditions stay comfortable through most of the day.'
    }
  ];

  return (
    <div className="weather-content">
      <header className="weather-header">
        <div className="location-label">
          <span aria-hidden="true">📍</span>
          <h2>{city}</h2>
        </div>
        <p>{dateString}</p>
      </header>

      <section className="hero-card">
        <div className="temperature-block">
          <div className="main-temp">{formatTemperature(temperature)}°</div>
          <p className="feels-like">Feels like {formatTemperature(feelsLike)}°</p>
          <p className="weather-condition">{getWeatherDescription(weatherCode)}</p>
        </div>

        <div className="weather-emoji-wrap">
          <div className="weather-emoji" aria-label="Current weather icon">
            {getWeatherIcon(weatherCode)}
          </div>
        </div>
      </section>

      <section className="smart-summary">
        <div className="summary-card primary">
          <div className="summary-icon">{recommendation.icon}</div>
          <div>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.detail}</p>
          </div>
        </div>

        {alert && (
          <div className="summary-card alert">
            <div className="summary-icon">{alert.icon}</div>
            <div>
              <h3>{alert.title}</h3>
              <p>{alert.detail}</p>
            </div>
          </div>
        )}
      </section>

      <section className="hourly-section">
        <div className="section-heading-row">
          <h3>Next 12 Hours</h3>
          <span>Hourly outlook</span>
        </div>
        <div className="hourly-list">
          {hourlyForecast.map((entry) => (
            <div className="hourly-card" key={entry.time.toISOString()}>
              <span className="hourly-time">
                {entry.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
              <span className="hourly-icon" aria-hidden="true">{getWeatherIcon(entry.weatherCode)}</span>
              <strong>{formatTemperature(entry.temperature)}°</strong>
              <span className="hourly-rain">💧 {entry.rainChance}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="weather-tools-grid">
        <article className="uv-card">
          <div className="tool-heading">
            <span aria-hidden="true">☀️</span>
            <p className="label">UV Index</p>
          </div>
          <div className="uv-value">{uvIndex} <span>{uvIndex >= 6 ? 'High' : uvIndex >= 3 ? 'Moderate' : 'Low'}</span></div>
          <p className="tool-recommendation">{uvIndex >= 3 ? 'Sunscreen recommended' : 'Sun protection is optional'}</p>
        </article>

        <article className="air-quality-card">
          <div className="tool-heading">
            <span aria-hidden="true">{airQualityIsGood ? '🟢' : '🟠'}</span>
            <div>
              <p className="label">Air Quality</p>
              <h3>{airQualityIsGood ? 'Good Air Quality' : 'Moderate Air Quality'}</h3>
            </div>
          </div>
          <div className="air-quality-grid">
            <div><span>AQI</span><strong>{aqi || '—'}</strong></div>
            <div><span>PM2.5</span><strong>{Math.round(pm25)} µg</strong></div>
            <div><span>PM10</span><strong>{Math.round(pm10)} µg</strong></div>
            <div><span>CO</span><strong>{Math.round(carbonMonoxide)} µg</strong></div>
            <div><span>NO₂</span><strong>{Math.round(nitrogenDioxide)} µg</strong></div>
          </div>
          <p className="tool-recommendation">{airQualityIsGood ? 'Perfect for outdoor activities.' : 'Consider shorter outdoor sessions.'}</p>
        </article>
      </section>

      <section className="insights-panel">
        <div className="insights-header">
          <span className="insights-badge">✨</span>
          <h3>Weather Insights</h3>
        </div>

        <div className="insight-list">
          {insightItems.map((item) => (
            <div key={item.text} className="insight-item">
              <span>{item.icon}</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🌅</span>
          <div>
            <p className="label">Sunrise</p>
            <p className="value">{sunriseTime}</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🌇</span>
          <div>
            <p className="label">Sunset</p>
            <p className="value">{sunsetTime}</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">💧</span>
          <div>
            <p className="label">Humidity</p>
            <p className="value">{relativeHumidity}%</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🌬</span>
          <div>
            <p className="label">Wind</p>
            <p className="value">{Math.round(windSpeed)} km/h {getWindDirection(windDirection)}</p>
          </div>
        </div>

        <div className="stat-card pressure-card">
          <span className="stat-icon">🔽</span>
          <div>
            <p className="label">Pressure</p>
            <p className="value">{Math.round(pressure)} hPa</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">👁️</span>
          <div>
            <p className="label">Visibility</p>
            <p className="value">{visibility ? `${(visibility / 1000).toFixed(1)} km` : '—'}</p>
          </div>
        </div>
      </section>

      <section className="forecast-section">
        <h3>7-Day Forecast</h3>
        <div className="forecast-list">
          {data.daily.time.map((time, index) => (
            <ForecastCard
              key={time}
              time={time}
              weatherCode={data.daily.weather_code[index]}
              maxTemp={data.daily.temperature_2m_max[index]}
              minTemp={data.daily.temperature_2m_min[index]}
              unit={unit}
              formatTemperature={formatTemperature}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default WeatherDisplay;