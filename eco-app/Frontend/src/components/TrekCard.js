import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Thermometer } from 'lucide-react';
import api from '../services/api';
import '../styles/TrekCard.css';

// Map OpenWeatherMap icon codes to emoji
const weatherEmoji = (iconCode = '') => {
  if (!iconCode) return '🌤️';
  const base = iconCode.replace('d', '').replace('n', '');
  const map = { '01': '☀️', '02': '⛅', '03': '☁️', '04': '☁️', '09': '🌧️', '10': '🌦️', '11': '⛈️', '13': '❄️', '50': '🌫️' };
  return map[base] ?? '🌤️';
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

const TrekCard = ({ trek }) => {
  const {
    _id: id,
    name,
    location,
    duration,
    difficulty,
    price,
    rating,
    reviewCount,
    maxGroupSize,
    description,
    isEcoFriendly,
    lat,
    lon,
  } = trek;

  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;
    api.get('/weather', { params: { lat, lon } })
      .then(res => setWeather(res.data))
      .catch(() => {}); // silently ignore — weather is non-critical
  }, [lat, lon]);

  const temp        = weather ? Math.round(weather.main.temp) : null;
  const description_w = weather?.weather?.[0]?.description ?? 'Clear';
  const icon        = weatherEmoji(weather?.weather?.[0]?.icon);

  return (
    <div className="trek-card">
      <div className="trek-image-container">
        <img
          src={trek.image || 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'}
          alt={name}
          className="trek-image"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'; }}
        />

        <div className="trek-badges">
          {isEcoFriendly && <span className="eco-badge">Eco-Friendly</span>}
          <span className={`difficulty-badge ${difficultyColors[difficulty] || difficultyColors.moderate}`}>
            {difficulty || 'Moderate'}
          </span>
        </div>

        <div className="weather-info">
          <div className="weather-info-inner">
            <span className="weather-icon">{icon}</span>
            <span className="weather-temperature">
              {temp !== null ? `${temp}°C` : '…'}
            </span>
          </div>
        </div>

        <div className="price-overlay">
          <span className="price-text">₹{price?.toLocaleString() || '0'}</span>
          <span className="price-subtext">per person</span>
        </div>
      </div>

      <div className="trek-content">
        <div className="trek-header">
          <h3 className="trek-title">{name}</h3>
          <div className="trek-location">
            <MapPin className="location-icon" />
            <span className="truncate">{location}</span>
          </div>
          <div className="trek-rating">
            <Star className="rating-icon" />
            <span className="rating-value">{rating || 4.5}</span>
            <span className="rating-reviews">({reviewCount || 0} reviews)</span>
          </div>
        </div>

        <p className="trek-description">{description}</p>

        <div className="trek-details">
          <div className="detail-item">
            <Clock className="detail-icon" />
            <span>{duration} days</span>
          </div>
          <div className="detail-item">
            <Users className="detail-icon" />
            <span>Max {maxGroupSize || 12}</span>
          </div>
          <div className="detail-item">
            <Thermometer className="detail-icon" />
            <span style={{ textTransform: 'capitalize' }}>{description_w}</span>
          </div>
        </div>

        <Link to={`/trek/${id}`} className="btn-primary w-full text-center block">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TrekCard;
