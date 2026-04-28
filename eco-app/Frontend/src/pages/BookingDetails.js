import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Clock, Calendar, Users, Star, Shield,
  ChevronLeft, MessageCircle, CheckCircle, AlertCircle,
  Phone, Mail, Award, Loader,
} from 'lucide-react';
import { bookingApi } from '../services/api';
import '../styles/BookingDetails.css';

const STATUS_META = {
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  pending:   { label: 'Pending',   icon: AlertCircle, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  refunded:  { label: 'Refunded',  icon: CheckCircle, color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
};

const DIFF_COLOR = { easy: '#16a34a', moderate: '#d97706', hard: '#dc2626' };

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    bookingApi.getById(id)
      .then(res => setBooking(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load booking details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="bd-state">
        <Loader size={32} className="bd-spin" />
        <p>Loading booking details…</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bd-state bd-state--error">
        <AlertCircle size={36} />
        <p>{error || 'Booking not found.'}</p>
        <button onClick={() => navigate('/my-bookings')}>Back to My Bookings</button>
      </div>
    );
  }

  const trek   = booking.trekId;
  const guide  = booking.guideId;
  const meta   = STATUS_META[booking.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  const trekDate = booking.date
    ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const bookedOn = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="bd-page">

      {/* ── Back + Status header ── */}
      <div className="bd-top">
        <button className="bd-back" onClick={() => navigate('/my-bookings')}>
          <ChevronLeft size={18} /> My Bookings
        </button>
        <div
          className="bd-status-pill"
          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        >
          <StatusIcon size={14} />
          {meta.label}
        </div>
      </div>

      <h1 className="bd-page-title">Booking Confirmation</h1>
      <p className="bd-booking-id">Booking ID: <span>#{booking._id?.slice(-8).toUpperCase()}</span></p>

      <div className="bd-grid">

        {/* ── Trek card ── */}
        <section className="bd-card">
          <h2 className="bd-card-title">Trek Details</h2>
          <div className="bd-trek-hero">
            <img
              src={trek?.image || 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'}
              alt={trek?.name}
              className="bd-trek-img"
              onError={e => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'; }}
            />
            {trek?.difficulty && (
              <span
                className="bd-diff-badge"
                style={{ background: DIFF_COLOR[trek.difficulty] }}
              >
                {trek.difficulty}
              </span>
            )}
          </div>
          <div className="bd-trek-body">
            <h3 className="bd-trek-name">{trek?.name}</h3>
            <p className="bd-trek-loc"><MapPin size={14} /> {trek?.location}</p>
            <div className="bd-trek-meta">
              <span><Clock size={14} /> {trek?.duration} days</span>
              {trek?.season && <span>Best in {trek.season}</span>}
              {trek?.rating && <span><Star size={14} style={{ color: '#f59e0b' }} /> {trek.rating}</span>}
            </div>
            {trek?.description && (
              <p className="bd-trek-desc">{trek.description.slice(0, 200)}{trek.description.length > 200 ? '…' : ''}</p>
            )}
          </div>
        </section>

        {/* ── Guide card ── */}
        <section className="bd-card">
          <h2 className="bd-card-title">Your Guide</h2>
          <div className="bd-guide-top">
            <div className="bd-guide-avatar">
              {guide?.image && !guide.image.includes('placeholder') ? (
                <img src={guide.image} alt={guide.name} />
              ) : (
                <span>{(guide?.name || '?')[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="bd-guide-name">{guide?.name}</h3>
              <p className="bd-guide-exp">{guide?.experience} years experience</p>
              {guide?.rating > 0 && (
                <div className="bd-guide-rating">
                  <Star size={13} style={{ color: '#f59e0b' }} />
                  <span>{guide.rating}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bd-guide-details">
            {guide?.specialties?.length > 0 && (
              <div className="bd-detail-row">
                <span className="bd-detail-label">Specialties</span>
                <div className="bd-tags">
                  {guide.specialties.map(s => <span key={s} className="bd-tag">{s}</span>)}
                </div>
              </div>
            )}
            {guide?.languages?.length > 0 && (
              <div className="bd-detail-row">
                <span className="bd-detail-label">Languages</span>
                <span>{guide.languages.join(', ')}</span>
              </div>
            )}
            {guide?.certifications?.length > 0 && (
              <div className="bd-detail-row">
                <span className="bd-detail-label"><Award size={13} /> Certifications</span>
                <span>{guide.certifications.join(', ')}</span>
              </div>
            )}
            {guide?.phone && (
              <div className="bd-detail-row">
                <span className="bd-detail-label"><Phone size={13} /> Phone</span>
                <a href={`tel:${guide.phone}`} className="bd-contact-link">{guide.phone}</a>
              </div>
            )}
            {guide?.email && (
              <div className="bd-detail-row">
                <span className="bd-detail-label"><Mail size={13} /> Email</span>
                <a href={`mailto:${guide.email}`} className="bd-contact-link">{guide.email}</a>
              </div>
            )}
          </div>

          {booking.chatId && (
            <Link to={`/chat/${booking.chatId}`} className="bd-chat-btn">
              <MessageCircle size={16} /> Open Chat with Guide
            </Link>
          )}
        </section>

        {/* ── Booking info ── */}
        <section className="bd-card">
          <h2 className="bd-card-title">Trip Information</h2>
          <div className="bd-info-grid">
            <div className="bd-info-item">
              <Calendar size={18} />
              <div>
                <p className="bd-info-label">Trek Date</p>
                <p className="bd-info-value">{trekDate}</p>
              </div>
            </div>
            <div className="bd-info-item">
              <Users size={18} />
              <div>
                <p className="bd-info-label">Group Size</p>
                <p className="bd-info-value">{booking.groupSize} person{booking.groupSize > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="bd-info-item">
              <Clock size={18} />
              <div>
                <p className="bd-info-label">Duration</p>
                <p className="bd-info-value">{trek?.duration} days</p>
              </div>
            </div>
            <div className="bd-info-item">
              <Shield size={18} />
              <div>
                <p className="bd-info-label">Booked On</p>
                <p className="bd-info-value">{bookedOn}</p>
              </div>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="bd-special">
              <p className="bd-detail-label">Special Requests</p>
              <p className="bd-special-text">{booking.specialRequests}</p>
            </div>
          )}
        </section>

        {/* ── Payment summary ── */}
        <section className="bd-card bd-card--payment">
          <h2 className="bd-card-title">Payment Summary</h2>
          <div className="bd-pay-row">
            <span>Trek cost (₹{trek?.price?.toLocaleString()} × {booking.groupSize})</span>
            <span>₹{booking.trekAmount?.toLocaleString()}</span>
          </div>
          <div className="bd-pay-row">
            <span>Guide fee (₹{guide?.pricePerDay?.toLocaleString()} × {trek?.duration} days)</span>
            <span>₹{booking.guideAmount?.toLocaleString()}</span>
          </div>
          <div className="bd-pay-row bd-pay-total">
            <span>Total Paid</span>
            <span>₹{booking.totalAmount?.toLocaleString()}</span>
          </div>

          <div className="bd-payment-status">
            <Shield size={14} />
            <span>Payment {booking.payment?.status === 'captured' ? 'successful' : booking.payment?.status}</span>
            {booking.payment?.razorpayPaymentId && (
              <span className="bd-pay-id">· ID: {booking.payment.razorpayPaymentId}</span>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default BookingDetails;
