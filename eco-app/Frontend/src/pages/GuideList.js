// src/pages/GuideList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Users, Zap, Globe, Award, Search, Filter, ChevronDown } from 'lucide-react';
import { guideApi } from '../services/api';
import '../styles/GuideList.css';

const GuideCard = ({ guide }) => {
  const navigate = useNavigate();
  const {
    _id: id,
    name,
    image,
    rating = 4.5,
    reviewCount = 0,
    experience,
    location,
    specialties = [],
    languages = [],
    phone,
    email,
    pricePerDay,
    availability,
    totalTrips,
    certifications = []
  } = guide;

  const imageSrc = image?.startsWith('http')
    ? image
    : `https://picsum.photos/seed/${id}/300/300`;

  const isAvailable = availability === 'Available';

  return (
    <div className="guide-card">
      <div className="guide-card-header">
        <div className="guide-image-wrapper">
          <img
            src={imageSrc}
            alt={name}
            className="guide-image"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${id}/300/300`; }}
          />
          <div className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </div>
          {certifications.length > 0 && (
            <div className="certification-badge" title={`${certifications.length} certifications`}>
              <Award size={14} /> {certifications.length}
            </div>
          )}
        </div>

        <div className="guide-header-info">
          <div className="guide-rating">
            <div className="rating-stars">
              <Star className="star-filled" size={16} />
              <span className="rating-number">{rating}</span>
            </div>
            <span className="review-count">({reviewCount} reviews)</span>
          </div>
          <h3 className="guide-name">{name}</h3>
          <div className="guide-location">
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        </div>
      </div>

      <div className="guide-card-body">
        <div className="guide-stats-grid">
          <div className="stat-item">
            <span className="stat-icon">📅</span>
            <div className="stat-content">
              <span className="stat-label">Experience</span>
              <span className="stat-value">{experience} years</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏔️</span>
            <div className="stat-content">
              <span className="stat-label">Trips Led</span>
              <span className="stat-value">{totalTrips}</span>
            </div>
          </div>
        </div>

        <div className="guide-section">
          <h4 className="section-title">Specialties</h4>
          <div className="specialties-list">
            {specialties.slice(0, 3).map((s, i) => (
              <span key={i} className="specialty-badge">{s}</span>
            ))}
            {specialties.length > 3 && <span className="specialty-more">+{specialties.length - 3}</span>}
          </div>
        </div>

        <div className="guide-section">
          <h4 className="section-title">Languages</h4>
          <div className="languages-list">
            {languages.map((lang, i) => (
              <span key={i} className="language-badge">{lang}</span>
            ))}
          </div>
        </div>

        <div className="guide-price-section">
          <span className="price-label">Price</span>
          <span className="price-value">₹{pricePerDay?.toLocaleString()}</span>
          <span className="price-unit">/day</span>
        </div>
      </div>

      <div className="guide-card-footer">
        <a href={`tel:${phone}`} className="btn-contact btn-call" title="Call guide">
          <Phone size={16} />
        </a>
        <a href={`mailto:${email}`} className="btn-contact btn-email" title="Email guide">
          <Mail size={16} />
        </a>
        <button 
          onClick={() => navigate(`/guides/${id}`)}
          className="btn-view-profile"
        >
          View Profile
          <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      </div>
    </div>
  );
};

const GuideList = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    guideApi.getAll()
      .then(res => {
        setGuides(res.data);
        setFilteredGuides(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load guides');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = guides;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(guide =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType === 'available') {
      filtered = filtered.filter(g => g.availability === 'Available');
    } else if (filterType === 'experienced') {
      filtered = filtered.filter(g => g.experience >= 10);
    } else if (filterType === 'toprated') {
      filtered = filtered.filter(g => g.rating >= 4.5);
    }

    setFilteredGuides(filtered);
  }, [searchTerm, filterType, guides]);

  if (loading) {
    return (
      <div className="guide-list-page">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading expert guides...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="guide-list-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guide-list-page">
      {/* Hero Section */}
      <div className="guide-hero">
        <div className="hero-content">
          <h1 className="hero-title">Meet Our Expert Guides</h1>
          <p className="hero-subtitle">Handpicked local experts for safe, sustainable, and unforgettable treks</p>
          <button 
            className="btn-become-guide"
            onClick={() => navigate('/register-guide')}
          >
            <Zap size={18} />
            Become a Guide
          </button>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="guide-controls">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, location, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={showFilterMenu ? 'open' : ''} />
            </button>

            {showFilterMenu && (
              <div className="filter-menu">
                <button
                  className={`filter-option ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => { setFilterType('all'); setShowFilterMenu(false); }}
                >
                  All Guides
                </button>
                <button
                  className={`filter-option ${filterType === 'available' ? 'active' : ''}`}
                  onClick={() => { setFilterType('available'); setShowFilterMenu(false); }}
                >
                  Available Now
                </button>
                <button
                  className={`filter-option ${filterType === 'experienced' ? 'active' : ''}`}
                  onClick={() => { setFilterType('experienced'); setShowFilterMenu(false); }}
                >
                  10+ Years Experience
                </button>
                <button
                  className={`filter-option ${filterType === 'toprated' ? 'active' : ''}`}
                  onClick={() => { setFilterType('toprated'); setShowFilterMenu(false); }}
                >
                  Top Rated (4.5+)
                </button>
              </div>
            )}
          </div>

          <div className="results-count">
            {filteredGuides.length} guides found
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      <div className="guide-list-container">
        {filteredGuides.length > 0 ? (
          <div className="guide-grid">
            {filteredGuides.map((guide, index) => (
              <div key={guide._id} className="guide-card-wrapper" style={{ animationDelay: `${index * 0.05}s` }}>
                <GuideCard guide={guide} />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-guides-container">
            <Users size={64} className="no-guides-icon" />
            <h3>No Guides Found</h3>
            <p>Try adjusting your search or filters</p>
            <button 
              className="btn-reset-filters"
              onClick={() => { setSearchTerm(''); setFilterType('all'); }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="guide-stats-section">
        <div className="stat-card">
          <div className="stat-number">{guides.length}</div>
          <div className="stat-text">Expert Guides</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{guides.reduce((sum, g) => sum + (g.totalTrips || 0), 0)}</div>
          <div className="stat-text">Treks Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">⭐ {(guides.reduce((sum, g) => sum + (g.rating || 0), 0) / guides.length).toFixed(1)}</div>
          <div className="stat-text">Average Rating</div>
        </div>
      </div>
    </div>
  );
};

export default GuideList;