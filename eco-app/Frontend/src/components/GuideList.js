import React, { useState, useEffect } from 'react';
import { Star, MapPin, Phone, Mail, Award, Users } from 'lucide-react';
import axios from 'axios';
import './styles/GuideList.css';

const GuideList = ({ onGuideSelect = () => {} }) => {
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/guides')
      .then((res) => {
        console.log('Guides fetched:', res.data);
        setGuides(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Guides fetch error:', err);
        setError('Failed to load guides');
        setLoading(false);
      });
  }, []);

  const filteredGuides = guides.filter((guide) => {
    if (filterBy === 'all') return true;
    if (filterBy === 'available') return guide.availability === 'Available';
    if (filterBy === 'experienced') return guide.experience >= 10;
    if (filterBy === 'top-rated') return guide.rating >= 4.8;
    return true;
  });

  const handleGuideClick = (guide) => {
    setSelectedGuide(guide);
    onGuideSelect(guide);
  };

  if (loading) return <div className="guide-list-container">Loading...</div>;
  if (error) return <div className="guide-list-container">{error}</div>;

  return (
    <div className="guide-list-container">
      <div className="filter-controls">
        <button
          onClick={() => setFilterBy('all')}
          className={`filter-button ${filterBy === 'all' ? 'active' : 'inactive'}`}
        >
          All Guides
        </button>
        <button
          onClick={() => setFilterBy('available')}
          className={`filter-button ${filterBy === 'available' ? 'active' : 'inactive'}`}
        >
          Available Now
        </button>
        <button
          onClick={() => setFilterBy('experienced')}
          className={`filter-button ${filterBy === 'experienced' ? 'active' : 'inactive'}`}
        >
          10+ Years Exp
        </button>
        <button
          onClick={() => setFilterBy('top-rated')}
          className={`filter-button ${filterBy === 'top-rated' ? 'active' : 'inactive'}`}
        >
          Top Rated
        </button>
      </div>

      <div className="guides-grid">
        {filteredGuides.map((guide) => (
            <div
            key={guide._id}
            onClick={() => handleGuideClick(guide)}
            className="guide-card"
          >
            <div className="p-6">
              <div className="guide-header">
                <img
                  src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/guides/${guide._id}/image`}
                  alt={guide.name}
                  className="guide-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100';
                  }}
                />
                <div className="flex-1">
                  <h3 className="guide-name">{guide.name}</h3>
                  <div className="guide-location">
                    <MapPin className="guide-location-icon" />
                    <span>{guide.location}</span>
                  </div>
                  <div className="guide-rating">
                    <div className="flex items-center">
                      <Star className="rating-icon" />
                      <span className="rating-value">{guide.rating}</span>
                    </div>
                    <span className="rating-reviews">({guide.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="availability-status">
                <span
                  className={`status-indicator ${guide.availability === 'Available' ? 'available' : 'unavailable'}`}
                ></span>
                {guide.availability}
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <Award className="stat-icon" />
                  <span>{guide.experience} years exp</span>
                </div>
                <div className="stat-item">
                  <Users className="stat-icon" />
                  <span>{guide.totalTrips} trips</span>
                </div>
              </div>
              <div className="specialties-container">
                <p className="specialties-label">Specialties:</p>
                <div className="specialties-list">
                  {guide.specialties.slice(0, 2).map((specialty, index) => (
                    <span key={index} className="specialty-badge">{specialty}</span>
                  ))}
                  {guide.specialties.length > 2 && (
                    <span className="specialty-more">+{guide.specialties.length - 2} more</span>
                  )}
                </div>
              </div>
              <div className="languages-container">
                <p className="languages-label">Languages:</p>
                <p className="languages-text">{guide.languages.join(', ')}</p>
              </div>
              <div className="price-container">
                <span className="price-text">₹{guide.pricePerDay.toLocaleString()}</span>
                <span className="price-subtext">per day</span>
              </div>
              <div className="action-buttons">
                <button className="btn-primary">Book Guide</button>
                <button className="btn-secondary">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="btn-secondary">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="no-results">
          <Users className="no-results-icon" />
          <p className="no-results-text">No guides found matching your criteria</p>
          <button
            onClick={() => setFilterBy('all')}
            className="no-results-button"
          >
            Show all guides
          </button>
        </div>
      )}
    </div>
  );
};

export default GuideList;