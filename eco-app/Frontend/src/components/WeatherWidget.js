import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import api from '../services/api';
import '../styles/WeatherWidget.css';

const DEFAULT_COORDINATES = {
  Dehradun: { lat: 30.3165, lon: 78.0322 }
};

const buildWeatherModel = (current, forecast, fallbackLabel) => ({
  location: current.name || fallbackLabel,
  current: {
    temperature: Math.round(current.main.temp),
    description: current.weather[0].description,
    condition: current.weather[0].main,
    humidity: current.main.humidity,
    wind: current.wind.speed,
    visibility: current.visibility / 1000
  },
  forecast: buildForecast(forecast.list)
});

const buildForecast = (list) => {
  const dailyMap = {};

  list.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const key = date.toDateString();

    if (!dailyMap[key]) {
      dailyMap[key] = {
        temps: [],
        precipitation: 0,
        condition: item.weather[0].main
      };
    }

    dailyMap[key].temps.push(item.main.temp);

    // rain probability (if exists)
    if (item.pop) {
      dailyMap[key].precipitation = Math.max(
        dailyMap[key].precipitation,
        Math.round(item.pop * 100)
      );
    }
  });

  const days = Object.keys(dailyMap).slice(0, 5);

  return days.map((date, index) => {
    const dayData = dailyMap[date];
    const temps = dayData.temps;

    return {
      day:
        index === 0
          ? "Today"
          : index === 1
            ? "Tomorrow"
            : new Date(date).toLocaleDateString("en-US", { weekday: "short" }),

      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
      condition: mapCondition(dayData.condition),
      precipitation: dayData.precipitation
    };
  });
};
const mapCondition = (condition) => {
  switch (condition.toLowerCase()) {
    case "clear":
      return "sunny";
    case "clouds":
      return "partly-cloudy";
    case "rain":
      return "rainy";
    default:
      return "cloudy";
  }
};
const getWeatherIcon = (condition, className = "") => {
  switch (condition?.toLowerCase()) {
    case "clear":
      return <span className={className}>☀️</span>;
    case "clouds":
      return <span className={className}>☁️</span>;
    case "rain":
      return <span className={className}>🌧️</span>;
    default:
      return <span className={className}>🌤️</span>;
  }
};
const WeatherWidget = ({ location: initialLocation = 'Dehradun', compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(true);

  // Fetch Weather (handles both city & coords)
  const fetchWeather = useCallback(async (params) => {
    setLoading(true);
    try {
      const [currentRes, forecastRes] = await Promise.all([
        api.get('/weather', { params }),
        api.get('/weather/forecast', { params })
      ]);

      const fallbackLabel = params.q || 'Current Location';

      setWeather(
        buildWeatherModel(
          currentRes.data,
          forecastRes.data,
          fallbackLabel
        )
      );
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      alert('Location not found. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial Load → User Location → Fallback
  useEffect(() => {
    const getInitialLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setIsUsingCurrentLocation(true);
            fetchWeather({
              lat: pos.coords.latitude,
              lon: pos.coords.longitude
            });
          },
          () => {
            const fallback =
              DEFAULT_COORDINATES[initialLocation] ||
              DEFAULT_COORDINATES.Dehradun;

            setIsUsingCurrentLocation(false);
            fetchWeather({
              lat: fallback.lat,
              lon: fallback.lon
            });
          }
        );
      }
    };

    getInitialLocation();
  }, [fetchWeather, initialLocation]);

  // Search City
  const handleSearch = async (e) => {
    e.preventDefault();

    const city = searchQuery.trim();
    if (!city) return;

    try {
      setLoading(true);

      // 1️⃣ Get coordinates from backend
      const geoRes = await api.get('/weather/geo', {
        params: { q: city }
      });

      const { lat, lon, name } = geoRes.data;

      // 2️⃣ Fetch weather using lat/lon
      await fetchWeather({ lat, lon });

      setIsUsingCurrentLocation(false);
      setSearchQuery('');

    } catch (error) {
      console.error(error);
      alert("Location not found");
    } finally {
      setLoading(false);
    }
  };
  // Use Current Location
  const handleGetLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setIsUsingCurrentLocation(true);
      fetchWeather({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      });
    });
  };

  if (loading && !weather) {
    return (
      <div className="weather-widget loading-pulse">
        Fetching sky data...
      </div>
    );
  }

  return (
    <div className={`weather-widget ${compact ? 'weather-compact' : ''}`}>

      {/* 🔍 Search + Location */}
      <div className="weather-search-container">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search any city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <Search size={18} />
          </button>
        </form>

        <button
          className={`location-btn ${isUsingCurrentLocation ? 'active' : ''}`}
          onClick={handleGetLocation}
          title="Use my location"
        >
          <MapPin size={18} />
        </button>
      </div>

      {/* 📍 Status */}
      <p className="location-status">
        {isUsingCurrentLocation
          ? '📍 Using your current location'
          : '🔎 Showing searched location'}
      </p>
      <div className="weather-details">
  <div>💧 {weather.current.humidity}%</div>
  <div>💨 {weather.current.wind} km/h</div>
  <div>👁️ {weather.current.visibility} km</div>
</div>
      {/* Weather Content */}
      {weather && (
        <>
          <div className="weather-header">
            <div>
              <h3 className="weather-location">{weather.location}</h3>
              <p className="weather-description">
                {weather.current.description}
              </p>
            </div>

            <div className="weather-temp-main">
              {getWeatherIcon(weather.current.condition, "w-10 h-10")}
              <span className="temp-value">
                {weather.current.temperature}°C
              </span>
            </div>
          </div>
          <div className="forecast-section">
            <h4 className="forecast-title">5-Day Forecast</h4>

            <div className="forecast-list">
              {weather.forecast.map((day, i) => (
                <div key={i} className="forecast-item">
                  <div className="forecast-left">
                    {getWeatherIcon(day.condition)}
                    <span>{day.day}</span>
                  </div>

                  <div className="forecast-right">
                    <span className="rain">{day.precipitation}%</span>
                    <span className="temp">
                      {day.high}° <span className="low">{day.low}°</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Optional Reset Button */}
          {!isUsingCurrentLocation && (
            <button
              className="reset-location"
              onClick={handleGetLocation}
            >
              Use My Location
            </button>
          )}

          {/* Keep your existing forecast + stats UI below */}
        </>
      )}
    </div>
  );
};

export default WeatherWidget;