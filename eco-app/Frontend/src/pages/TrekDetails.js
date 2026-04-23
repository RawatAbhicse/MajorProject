import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Leaf, Sun, Wind, Droplets } from 'lucide-react';
import MapView from '../components/MapView';
import { trekApi } from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/TrekDetails.css';

const difficultyColor = { easy: '#16a34a', moderate: '#d97706', hard: '#dc2626' };
const seasonLabel = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };

const TrekDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trek, setTrek] = useState(null);
  const [weather, setWeather] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReviews = (trekId) =>
    trekApi.getReviews(trekId)
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]));

  useEffect(() => {
    if (!id) {
      setError('Invalid trek URL: missing ID');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const trekRes = await trekApi.getById(id);
        if (cancelled) return;
        setTrek(trekRes.data);

        // Reviews are public; failures shouldn't block the page.
        loadReviews(id);

        // Weather is auth-protected; treat it as optional.
        api.get('/weather', { params: { lat: trekRes.data.lat, lon: trekRes.data.lon } })
          .then((res) => { if (!cancelled) setWeather(res.data); })
          .catch(() => {});
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to load trek details';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewStatus(null);

    if (!user) {
      setReviewStatus({ type: 'error', message: 'Please login to add a review.' });
      return;
    }

    try {
      await trekApi.addReview(id, { rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      setReviewStatus({ type: 'success', message: 'Review added.' });
      loadReviews(id);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add review';
      setReviewStatus({ type: 'error', message: msg });
    }
  };

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

            {/* Reviews */}
            <section className="trek-details-section reviews-section">
              <h2 className="section-title">Reviews</h2>

              <div className="reviews-meta">
                <span className="reviews-meta__rating">
                  <Star size={16} /> {trek.rating} <span className="reviews-meta__count">({trek.reviewCount} reviews)</span>
                </span>
              </div>

              {reviews.length === 0 ? (
                <p className="reviews-empty">No reviews yet. Be the first to review this trek.</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => (
                    <div key={r._id} className="review-card">
                      <div className="review-card__top">
                        <strong className="review-card__user">{r.username || 'User'}</strong>
                        <span className="review-card__rating">
                          <Star size={14} /> {r.rating}
                        </span>
                      </div>
                      {r.comment && <p className="review-card__comment">{r.comment}</p>}
                      {r.createdAt && (
                        <div className="review-card__date">
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <form className="review-form" onSubmit={submitReview}>
                <h3 className="review-form__title">Add a Review</h3>

                {reviewStatus && (
                  <div className={`review-form__status ${reviewStatus.type === 'error' ? 'is-error' : 'is-success'}`}>
                    {reviewStatus.message}
                  </div>
                )}

                <label className="review-form__label">Rating</label>
                <select
                  className="review-form__input"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <label className="review-form__label">Comment</label>
                <textarea
                  className="review-form__input review-form__textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={3}
                />

                <button className="review-form__btn" type="submit">
                  Submit Review
                </button>
              </form>
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
