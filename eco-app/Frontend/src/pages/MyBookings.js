import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Clock, Calendar, Users, ChevronRight,
  Package, Loader, AlertCircle,
} from 'lucide-react';
import { bookingApi } from '../services/api';
import '../styles/MyBookings.css';

const STATUS_META = {
  confirmed: { label: 'Confirmed',  color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  pending:   { label: 'Pending',    color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  cancelled: { label: 'Cancelled',  color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  refunded:  { label: 'Refunded',   color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
};

const DIFF_COLOR = { easy: '#16a34a', moderate: '#d97706', hard: '#dc2626' };

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    bookingApi.getAll()
      .then(res => setBookings(res.data))
      .catch(() => setError('Failed to load bookings. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-state">
        <Loader size={32} className="mb-spin" />
        <p>Loading your bookings…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-state mb-state--error">
        <AlertCircle size={36} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-page">
      <div className="mb-header">
        <h1 className="mb-title">My Bookings</h1>
        <p className="mb-sub">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} found</p>
      </div>

      {bookings.length === 0 ? (
        <div className="mb-empty">
          <Package size={52} />
          <h2>No bookings yet</h2>
          <p>You haven't booked any treks. Start exploring!</p>
          <Link to="/treks" className="mb-browse-btn">Browse Treks</Link>
        </div>
      ) : (
        <div className="mb-list">
          {bookings.map(booking => {
            const trek  = booking.trekId;
            const guide = booking.guideId;
            const meta  = STATUS_META[booking.status] || STATUS_META.pending;
            const trekDate = booking.date
              ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';

            return (
              <Link key={booking._id} to={`/bookings/${booking._id}`} className="mb-card">
                <div className="mb-card-img-wrap">
                  <img
                    src={trek?.image || 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'}
                    alt={trek?.name}
                    className="mb-card-img"
                    onError={e => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'; }}
                  />
                  {trek?.difficulty && (
                    <span
                      className="mb-diff-badge"
                      style={{ background: DIFF_COLOR[trek.difficulty] }}
                    >
                      {trek.difficulty}
                    </span>
                  )}
                </div>

                <div className="mb-card-body">
                  <div className="mb-card-top">
                    <div>
                      <h3 className="mb-trek-name">{trek?.name || 'Unknown Trek'}</h3>
                      <p className="mb-trek-loc"><MapPin size={13} /> {trek?.location || '—'}</p>
                    </div>
                    <span
                      className="mb-status-badge"
                      style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mb-card-meta">
                    <span><Calendar size={13} /> {trekDate}</span>
                    <span><Clock size={13} /> {trek?.duration} days</span>
                    <span><Users size={13} /> {booking.groupSize} person{booking.groupSize > 1 ? 's' : ''}</span>
                  </div>

                  {guide && (
                    <p className="mb-guide-line">
                      Guide: <strong>{guide.name}</strong>
                    </p>
                  )}

                  <div className="mb-card-footer">
                    <span className="mb-total">₹{booking.totalAmount?.toLocaleString()}</span>
                    <span className="mb-view-link">
                      View Details <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
