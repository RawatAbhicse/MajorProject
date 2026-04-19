import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, Eye, Droplets } from 'lucide-react';
import '../styles/WeatherWidget.css';

const WeatherWidget = ({ location = 'Dehradun', compact = false }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockWeather = {
          location: location,
          current: {
            temperature: 22,
            condition: 'partly-cloudy',
            description: 'Partly Cloudy',
            humidity: 68,
            windSpeed: 12,
            visibility: 10,
            uvIndex: 6,
            pressure: 1013
          },
          forecast: [
            { day: 'Today', high: 25, low: 18, condition: 'partly-cloudy', precipitation: 20 },
            { day: 'Tomorrow', high: 23, low: 16, condition: 'cloudy', precipitation: 40 },
            { day: 'Wed', high: 28, low: 20, condition: 'sunny', precipitation: 10 },
            { day: 'Thu', high: 26, low: 19, condition: 'rainy', precipitation: 80 },
            { day: 'Fri', high: 24, low: 17, condition: 'partly-cloudy', precipitation: 30 }
          ]
        };
        setWeather(mockWeather);
        setForecast(mockWeather.forecast);
        setLoading(false);
      }, 1000);
    };
    fetchWeather();
  }, [location]);

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: <Sun className="w-6 h-6 text-yellow-400" />,
      'partly-cloudy': <Cloud className="w-6 h-6 text-gray-400" />,
      cloudy: <Cloud className="w-6 h-6 text-gray-500" />,
      rainy: <CloudRain className="w-6 h-6 text-blue-400" />
    };
    return icons[condition] || icons['sunny'];
  };

  const getSmallWeatherIcon = (condition) => {
    const icons = {
      sunny: <Sun className="w-4 h-4 text-yellow-400" />,
      'partly-cloudy': <Cloud className="w-4 h-4 text-gray-400" />,
      cloudy: <Cloud className="w-4 h-4 text-gray-500" />,
      rainy: <CloudRain className="w-4 h-4 text-blue-400" />
    };
    return icons[condition] || icons['sunny'];
  };

  if (loading) {
    return (
      <div className={`weather-widget weather-loading ${compact ? 'weather-compact' : ''}`}>
        <div className="loading-pulse">
          <div className="loading-bar1"></div>
          <div className="loading-bar2"></div>
          <div className="loading-bar3"></div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="weather-widget weather-compact">
        <div className="weather-compact-content">
          <div>
            <p className="weather-compact-location">{weather.location}</p>
            <div className="weather-compact-main">
              {getWeatherIcon(weather.current.condition)}
              <span className="weather-compact-temperature">
                {weather.current.temperature}°C
              </span>
            </div>
          </div>
          <div className="weather-compact-info">
            <p className="weather-compact-description">{weather.current.description}</p>
            <p className="weather-compact-range">
              H: {forecast[0]?.high}° L: {forecast[0]?.low}°
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <div className="weather-header">
          <div>
            <h3 className="weather-location">{weather.location}</h3>
            <p className="weather-description">{weather.current.description}</p>
          </div>
          {getWeatherIcon(weather.current.condition)}
        </div>
        
        <div className="weather-temperature">
          {weather.current.temperature}°C
        </div>

        <div className="weather-details">
          <div className="weather-detail-item">
            <Droplets className="weather-detail-icon" />
            <span>{weather.current.humidity}%</span>
          </div>
          <div className="weather-detail-item">
            <Wind className="weather-detail-icon" />
            <span>{weather.current.windSpeed} km/h</span>
          </div>
          <div className="weather-detail-item">
            <Eye className="weather-detail-icon" />
            <span>{weather.current.visibility} km</span>
          </div>
        </div>
      </div>

      <div className="forecast-section">
        <h4 className="forecast-title">5-Day Forecast</h4>
        <div className="forecast-list">
          {forecast.map((day, index) => (
            <div key={index} className="forecast-item">
              <div className="forecast-day-container">
                {getSmallWeatherIcon(day.condition)}
                <span className="forecast-day">{day.day}</span>
              </div>
              <div className="forecast-details">
                <div className="forecast-precipitation">
                  <Droplets className="precipitation-icon" />
                  <span>{day.precipitation}%</span>
                </div>
                <div className="forecast-temperatures">
                  <Thermometer className='precipitation-icon'/>
                  <span>{day.high}°</span>
                  <span className="forecast-low">{day.low}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="weather-alert">
        <div className="alert-content">
          <div className="alert-indicator"></div>
          <div>
            <p className="alert-title">Weather Advisory</p>
            <p className="alert-description">
              Afternoon showers expected. Carry rain gear for outdoor activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;