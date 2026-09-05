import React from 'react';
import { getWeatherIcon } from '../constants/weatherUtils';

const ForecastCard = ({ time, weatherCode, maxTemp, minTemp, unit, formatTemperature }) => {
  const day = new Date(time).toLocaleDateString('en-US', { weekday: 'short' });
  const icon = getWeatherIcon(weatherCode);

  return (
    <div className="forecast-card">
      <span className="forecast-day">{day}</span>
      <span className="forecast-icon" aria-hidden="true">{icon}</span>
      <div className="forecast-temp">
        <span>{formatTemperature(maxTemp)}°</span>
        <small>/{formatTemperature(minTemp)}°</small>
      </div>
    </div>
  );
};

export default ForecastCard;