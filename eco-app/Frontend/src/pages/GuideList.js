// src/pages/GuideList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Phone, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { guideApi } from '../services/api';
import '../styles/GuideList.css';

const GuideCard = ({ guide }) => {
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
    totalTrips
  } = guide;

  const imageSrc = image?.startsWith('http')
    ? image
    : `https://picsum.photos/seed/${id}/300/300`;

  const isAvailable = availability === 'Available';

  return (
    <div className="guide-card">
      <div className="guide-image-container">
        <img
          src={imageSrc}
          alt={name}
          className="guide-image"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${id}/300/300`; }}
        />
        <div className="guide-rating-badge">
          <Star className="star-icon" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="guide-content">
        <h3 className="guide-name">{name}</h3>
        
        <div className="guide-location">
          <MapPin className="icon" />
          <span>{location}</span>
        </div>

        <div className="guide-stats">
          <span><strong>{experience}</strong> years</span>
          <span>•</span>
          <span><strong>{totalTrips}</strong> trips</span>
        </div>

        <div className="guide-specialties">
          {specialties.slice(0, 2).map((s, i) => (
            <span key={i} className="specialty-tag">{s}</span>
          ))}
          {specialties.length > 2 && <span className="more">+{specialties.length - 2}</span>}
        </div>

        <div className="guide-languages">
          Speaks: {languages.join(', ')}
        </div>

        <div className="guide-price">
          <strong>₹{pricePerDay?.toLocaleString()}</strong>/day
        </div>

        <div className="guide-availability">
          {isAvailable ? (
            <span className="available">
              <CheckCircle className="icon-sm" /> Available
            </span>
          ) : (
            <span className="busy">
              <XCircle className="icon-sm" /> {availability}
            </span>
          )}
        </div>

        <div className="guide-actions">
          <a href={`tel:${phone}`} className="btn-icon">
            <Phone className="icon" />
          </a>
          <a href={`mailto:${email}`} className="btn-icon">
            <Mail className="icon" />
          </a>
          <Link to={`/guides/${id}`} className="btn-primary">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

const GuideList = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    guideApi.getAll()
      .then(res => {
        setGuides(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load guides');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="guide-list-container">Loading guides...</div>;
  if (error) return <div className="guide-list-container error">{error}</div>;

  return (
    <div className="guide-list-container">
      <div className="guide-list-header">
        <h1>Meet Our Expert Guides</h1>
        <p>Handpicked local experts for safe and memorable treks</p>
      </div>

      <div className="guide-grid">
        {guides.map(guide => (
          <GuideCard key={guide._id} guide={guide} />
        ))}
      </div>

      {guides.length === 0 && (
        <p className="no-guides">No guides available at the moment.</p>
      )}
    </div>
  );
};

export default GuideList;