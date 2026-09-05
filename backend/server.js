import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const AIR_QUALITY_API = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODING_API = 'https://nominatim.openstreetmap.org/reverse';

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'weather-api' });
});

app.post('/api/search-history', async (req, res) => {
  const { cityName, latitude, longitude, country } = req.body;

  if (!cityName || !latitude || !longitude) {
    return res.status(400).json({ message: 'cityName, latitude and longitude are required' });
  }

  try {
    const result = await query(
      `INSERT INTO weather_searches (city_name, latitude, longitude, country)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [cityName, Number(latitude), Number(longitude), country || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to save weather search', error: error.message });
  }
});

app.get('/api/search-history', async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM weather_searches ORDER BY searched_at DESC LIMIT 10;`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get search history', error: error.message });
  }
});

app.get('/api/weather', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ message: 'latitude and longitude are required' });
  }

  try {
    const weatherUrl = `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,visibility,surface_pressure,precipitation_probability,precipitation,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=7`;
    const airQualityUrl = `${AIR_QUALITY_API}?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,us_aqi&timezone=auto&forecast_days=1`;
    const [weatherResponse, airQualityResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(airQualityUrl)
    ]);
    const data = await weatherResponse.json();
    const airQualityData = airQualityResponse.ok ? await airQualityResponse.json() : null;

    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json({
        message: 'Weather data fetch failed',
        error: data
      });
    }

    return res.json({ ...data, air_quality: airQualityData });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch weather from external API',
      error: error.message
    });
  }
});

app.get('/api/geocode', async (req, res) => {
  const city = req.query.name;

  if (!city) {
    return res.status(400).json({ message: 'city name is required' });
  }

  try {
    const url = `${GEOCODING_API}?name=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: 'Geocoding request failed',
        error: data
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch city coordinates',
      error: error.message
    });
  }
});

app.get('/api/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'latitude and longitude are required' });
  }

  try {
    const url = `${REVERSE_GEOCODING_API}?lat=${lat}&lon=${lon}&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: 'Reverse geocoding request failed',
        error: data
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to reverse geocode location',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Weather API running on http://localhost:${PORT}`);
});
