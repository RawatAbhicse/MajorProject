import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Leaf, Sun, Wind, Droplets } from 'lucide-react';
import MapView from '../components/MapView';
import { trekApi } from '../services/api';
import api from '../services/api';
import '../styles/TrekDetails.css';

const difficultyColor = { easy: '#16a34a', moderate: '#d97706', hard: '#dc2626' };
const seasonLabel = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

const TrekDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trek, setTrek] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid trek URL: missing ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    trekApi.getById(id)
      .then((res) => {
        setTrek(res.data);
        return api.get('/weather', { params: { lat: res.data.lat, lon: res.data.lon } });
      })
      .then((res) => setWeather(res.data))
      .catch((err) => {
        const msg = err.response?.data?.error || 'Failed to load trek details';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="trek-details-container"><p className="trek-details-status">Loading trek...</p></div>;
  if (error)   return <div className="trek-details-container"><p className="trek-details-status error">{error}</p></div>;
  if (!trek)   return <div className="trek-details-container"><p className="trek-details-status">Trek not found</p></div>;

  return (
    <div className="trek-details-container">
      <div className="trek-details-content">

        {/* Hero Image */}
        <div className="trek-details-hero">
          <img
            src={trek.image || 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'}
            alt={trek.name}
            className="trek-details-hero-img"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'; }}
          />
          <div className="trek-details-hero-overlay">
            <h1 className="trek-details-title">{trek.name}</h1>
            <div className="trek-details-location">
              <MapPin size={16} />
              <span>{trek.location}</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="trek-details-stats">
          <div className="stat-item">
            <Clock size={20} className="stat-icon" />
            <div>
              <p className="stat-value">{trek.duration} days</p>
              <p className="stat-label">Duration</p>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-difficulty" style={{ color: difficultyColor[trek.difficulty] }}>
              {trek.difficulty?.charAt(0).toUpperCase() + trek.difficulty?.slice(1)}
            </span>
            <div>
              <p className="stat-label" style={{ marginTop: 4 }}>Difficulty</p>
            </div>
          </div>
          <div className="stat-item">
            <Users size={20} className="stat-icon" />
            <div>
              <p className="stat-value">Max {trek.maxGroupSize}</p>
              <p className="stat-label">Group Size</p>
            </div>
          </div>
          <div className="stat-item">
            <Sun size={20} className="stat-icon" />
            <div>
              <p className="stat-value">{seasonLabel[trek.season] || trek.season}</p>
              <p className="stat-label">Best Season</p>
            </div>
          </div>
          <div className="stat-item">
            <Star size={20} className="stat-icon" style={{ color: '#f59e0b' }} />
            <div>
              <p className="stat-value">{trek.rating} <span className="stat-reviews">({trek.reviewCount} reviews)</span></p>
              <p className="stat-label">Rating</p>
            </div>
          </div>
          {trek.isEcoFriendly && (
            <div className="stat-item">
              <Leaf size={20} className="stat-icon" style={{ color: '#10b981' }} />
              <div>
                <p className="stat-value eco-label">Eco-Friendly</p>
                <p className="stat-label">Certified</p>
              </div>
            </div>
          )}
        </div>

        <div className="trek-details-body">
          {/* Left Column */}
          <div className="trek-details-left">
            <section className="trek-details-section">
              <h2 className="section-title">About This Trek</h2>
              <p className="trek-details-description">{trek.description}</p>
            </section>

            {/* Map */}
            <section className="trek-details-section">
              <h2 className="section-title">Trek Location</h2>
              <div className="trek-details-map">
                <MapView center={[trek.lon, trek.lat]} />
              </div>
            </section>
          </div>

          {/* Right Column — Booking Card */}
          <aside className="trek-details-sidebar">
            <div className="booking-card">
              <p className="booking-price">
                ₹{trek.price?.toLocaleString()}
                <span className="booking-price-sub"> / person</span>
              </p>

              {/* Weather Widget */}
              {weather && (
                <div className="weather-card">
                  <p className="weather-title">Current Weather</p>
                  <div className="weather-row">
                    <Wind size={16} />
                    <span>{Math.round(weather.main.temp)}°C — {weather.weather[0].description}</span>
                  </div>
                  <div className="weather-row">
                    <Droplets size={16} />
                    <span>Humidity {weather.main.humidity}%</span>
                  </div>
                </div>
              )}

              <button
                className="trek-details-book"
                onClick={() => navigate(`/booking/${id}`)}
              >
                Book Now
              </button>

              <ul className="booking-features">
                <li>✓ Free cancellation up to 7 days</li>
                <li>✓ Expert certified guide included</li>
                <li>✓ Equipment &amp; meals covered</li>
                <li>✓ 24/7 support on trail</li>
              </ul>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default TrekDetails;
