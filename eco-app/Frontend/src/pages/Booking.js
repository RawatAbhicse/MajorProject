import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trekApi } from '../services/api';
import '../styles/Booking.css';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    date: '',
    groupSize: 1,
    specialRequests: '',
  });

  useEffect(() => {
    trekApi.getById(id)
      .then(res => setTrek(res.data))
      .catch(() => setError('Failed to load trek details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) { setError('Please select a date.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      // Booking persistence endpoint not yet implemented on the server;
      // this simulates a successful booking confirmation for now.
      await new Promise(r => setTimeout(r, 800));
      setSuccess(true);
    } catch {
      setError('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="booking-container"><p>Loading trek details…</p></div>;
  if (error && !trek) return <div className="booking-container"><p className="error">{error}</p></div>;

  if (success) {
    return (
      <div className="booking-container">
        <div className="booking-form" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#10B981', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Booking Confirmed!
          </h2>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>{trek?.name}</strong> on <strong>{form.date}</strong> for{' '}
            <strong>{form.groupSize}</strong> person{form.groupSize > 1 ? 's' : ''}.
          </p>
          <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>
            Total: ₹{((trek?.price || 0) * form.groupSize).toLocaleString()}
          </p>
          <button className="btn-primary" onClick={() => navigate('/treks')}>
            Browse More Treks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <h1 className="booking-title">Book Your Trek</h1>

      {trek && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B' }}>{trek.name}</h2>
          <p style={{ color: '#64748B' }}>{trek.location} · {trek.duration} days · ₹{trek.price?.toLocaleString()} / person</p>
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        {error && <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>}

        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' }}>
          Trek Date
        </label>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="booking-input"
          min={new Date().toISOString().split('T')[0]}
          required
        />

        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' }}>
          Group Size
        </label>
        <input
          type="number"
          name="groupSize"
          value={form.groupSize}
          onChange={handleChange}
          className="booking-input"
          min={1}
          max={trek?.maxGroupSize || 20}
          required
        />

        <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' }}>
          Special Requests (optional)
        </label>
        <textarea
          name="specialRequests"
          value={form.specialRequests}
          onChange={handleChange}
          className="booking-input"
          rows={3}
          placeholder="Any dietary requirements, accessibility needs, etc."
          style={{ resize: 'vertical' }}
        />

        {trek && (
          <p style={{ color: '#64748B', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Estimated total: <strong>₹{((trek.price || 0) * form.groupSize).toLocaleString()}</strong>
          </p>
        )}

        <button type="submit" className="btn-primary booking-submit" disabled={submitting}>
          {submitting ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
};

export default Booking;
