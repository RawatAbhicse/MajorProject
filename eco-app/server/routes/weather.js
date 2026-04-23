import { Router } from 'express';
import axios from 'axios';
import { config } from 'dotenv';

config();
const router = Router();

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// --- Helper for API Calls ---
const fetchWeather = async (endpoint, lat, lon) => {
  return await axios.get(`${BASE_URL}/${endpoint}`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
  });
};

// GET /weather - Current Weather
router.get('/', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetchWeather('weather', lat, lon);
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch current weather';
    console.error(`Weather API Error [${status}]:`, message);
    res.status(status).json({ error: message });
  }
});

// GET /weather/forecast - 5 Day / 3 Hour Forecast
router.get('/forecast', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await fetchWeather('forecast', lat, lon);
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch forecast data';
    console.error(`Forecast API Error [${status}]:`, message);
    res.status(status).json({ error: message });
  }
});
// GET /weather/geo - Convert city → lat/lon
router.get('/geo', async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/geo/1.0/direct',
      {
        params: {
          q,
          limit: 1,
          appid: API_KEY,
        },
      }
    );

    if (!response.data.length) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(response.data[0]); // { lat, lon, name, country }
  } catch (error) {
    console.error('Geo API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch location coordinates' });
  }
});
export default router;