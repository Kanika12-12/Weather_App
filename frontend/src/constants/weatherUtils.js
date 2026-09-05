export const API_BASE = "https://api.open-meteo.com/v1/forecast";
export const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";
export const NOMINATIM_API = "https://nominatim.openstreetmap.org/reverse";

export const getWeatherDescription = (code) => {
  const weatherDescriptions = {
    0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 56: "Light freezing drizzle", 57: "Dense freezing drizzle",
    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain",
    67: "Heavy freezing rain", 71: "Slight snow fall", 73: "Moderate snow fall",
    75: "Heavy snow fall", 77: "Snow grains", 80: "Slight showers", 81: "Moderate showers",
    82: "Violent showers", 85: "Slight snow showers", 86: "Heavy snow showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
  };
  return weatherDescriptions[code] || "Weather data unavailable";
};

export const getWeatherIcon = (code) => {
  if ([0].includes(code)) return "☀";
  if ([1, 2].includes(code)) return "🌤";
  if ([3].includes(code)) return "☁";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧";
  if ([56, 57, 66, 67, 85, 86].includes(code)) return "🌨";
  if ([71, 73, 75, 77].includes(code)) return "❄";
  if ([95, 96, 99].includes(code)) return "🌩";
  return "☁";
};