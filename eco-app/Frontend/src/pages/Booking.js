import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Users, Star, ChevronRight, ChevronLeft,
  CheckCircle, Shield, Award, AlertCircle, Loader,
} from 'lucide-react';
import { trekApi, guideApi, bookingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Booking.css';

const STEPS = ['Select Guide', 'Trip Details', 'Review & Pay'];

const loadRazorpayScript = () =>
  new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const difficultyColor = { easy: '#16a34a', moderate: '#d97706', hard: '#dc2626' };

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep]       = useState(0);
  const [trek, setTrek]       = useState(null);
  const [guides, setGuides]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [processing, setProcessing] = useState(false);

  const [selectedGuide, setSelectedGuide] = useState(null);
  const [form, setForm] = useState({
    date: '',
    groupSize: 1,
    specialRequests: '',
  });

  useEffect(() => {
    Promise.all([trekApi.getById(id), guideApi.getAll()])
      .then(([trekRes, guidesRes]) => {
        setTrek(trekRes.data);
        setGuides((guidesRes.data || []).filter(g => g.isActive));
      })
      .catch(() => setError('Failed to load booking data. Please try again.'))
      .finally(() => setLoading(false));
  }, [id]);

  const trekAmount  = trek ? trek.price * form.groupSize : 0;
  const guideAmount = (selectedGuide && trek) ? selectedGuide.pricePerDay * trek.duration : 0;
  const totalAmount = trekAmount + guideAmount;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'groupSize' ? Math.max(1, parseInt(value) || 1) : value }));
  };

  const canAdvance = useCallback(() => {
    if (step === 0) return !!selectedGuide;
    if (step === 1) return !!form.date;
    return true;
  }, [step, selectedGuide, form.date]);

  const handlePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const { data: order } = await bookingApi.createOrder({
        trekId:          id,
        guideId:         selectedGuide._id,
        date:            form.date,
        groupSize:       form.groupSize,
        specialRequests: form.specialRequests,
      });

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Payment gateway failed to load. Check your connection and try again.');
        setProcessing(false);
        return;
      }

      const options = {
        key:         order.keyId,
        amount:      Math.round(order.amount * 100),
        currency:    'INR',
        name:        'EcoTrek',
        description: `${trek.name} — Guide: ${selectedGuide.name}`,
        order_id:    order.orderId,
        prefill: {
          name:  user?.fullName || user?.username || '',
          email: user?.email || '',
        },
        theme: { color: '#10B981' },
        modal: {
          backdropclose: false,
          ondismiss: () => setProcessing(false),
        },
        handler: async (response) => {
          try {
            const { data: result } = await bookingApi.verifyPayment({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              trekId:          id,
              guideId:         selectedGuide._id,
              date:            form.date,
              groupSize:       form.groupSize,
              specialRequests: form.specialRequests,
              trekAmount:      order.trekAmount,
              guideAmount:     order.guideAmount,
              totalAmount:     order.amount,
            });
            navigate(`/bookings/${result.bookingId}`, { replace: true });
          } catch {
            setError('Payment was processed but booking confirmation failed. Contact support.');
            setProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="bk-loading">
        <Loader size={32} className="bk-spin" />
        <p>Loading booking details…</p>
      </div>
    );
  }

  if (error && !trek) {
    return (
      <div className="bk-error-page">
        <AlertCircle size={40} />
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="bk-page">

      {/* ── Left: Trek Summary ── */}
      <aside className="bk-sidebar">
        <div className="bk-trek-card">
          <div className="bk-trek-img-wrap">
            <img
              src={trek.image || 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'}
              alt={trek.name}
              className="bk-trek-img"
              onError={e => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/6/63/Valley_of_flowers_uttaranchal_full_view.JPG'; }}
            />
            <span
              className="bk-difficulty-badge"
              style={{ background: difficultyColor[trek.difficulty] }}
            >
              {trek.difficulty}
            </span>
          </div>
          <div className="bk-trek-info">
            <h2 className="bk-trek-name">{trek.name}</h2>
            <p className="bk-trek-location"><MapPin size={14} /> {trek.location}</p>
            <div className="bk-trek-meta">
              <span><Clock size={14} /> {trek.duration} days</span>
              <span><Users size={14} /> Max {trek.maxGroupSize}</span>
              <span><Star size={14} style={{ color: '#f59e0b' }} /> {trek.rating}</span>
            </div>
            <div className="bk-trek-price-row">
              <span className="bk-price-label">Price per person</span>
              <span className="bk-price-value">₹{trek.price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        {selectedGuide && (
          <div className="bk-price-breakdown">
            <h3>Price Breakdown</h3>
            <div className="bk-price-row">
              <span>Trek (₹{trek.price?.toLocaleString()} × {form.groupSize})</span>
              <span>₹{trekAmount.toLocaleString()}</span>
            </div>
            <div className="bk-price-row">
              <span>Guide (₹{selectedGuide.pricePerDay?.toLocaleString()} × {trek.duration}d)</span>
              <span>₹{guideAmount.toLocaleString()}</span>
            </div>
            <div className="bk-price-row bk-price-total">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}

        <ul className="bk-trust-list">
          <li><Shield size={14} /> Free cancellation up to 7 days</li>
          <li><CheckCircle size={14} /> Verified certified guides</li>
          <li><Award size={14} /> Equipment &amp; meals covered</li>
        </ul>
      </aside>

      {/* ── Right: Steps ── */}
      <div className="bk-main">

        {/* Step indicator */}
        <div className="bk-stepper">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`bk-step ${i === step ? 'bk-step--active' : ''} ${i < step ? 'bk-step--done' : ''}`}>
                <div className="bk-step-circle">
                  {i < step ? <CheckCircle size={16} /> : <span>{i + 1}</span>}
                </div>
                <span className="bk-step-label">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`bk-step-line ${i < step ? 'bk-step-line--done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bk-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Step 0: Select Guide ── */}
        {step === 0 && (
          <div className="bk-step-panel">
            <h2 className="bk-panel-title">Choose Your Guide <span className="bk-required">*</span></h2>
            <p className="bk-panel-sub">A certified guide is required for every booking.</p>

            {guides.length === 0 ? (
              <p className="bk-empty">No guides are currently available.</p>
            ) : (
              <div className="bk-guides-grid">
                {guides.map(guide => (
                  <button
                    key={guide._id}
                    className={`bk-guide-card ${selectedGuide?._id === guide._id ? 'bk-guide-card--selected' : ''}`}
                    onClick={() => setSelectedGuide(guide)}
                    type="button"
                  >
                    {selectedGuide?._id === guide._id && (
                      <CheckCircle size={18} className="bk-guide-check" />
                    )}
                    <div className="bk-guide-avatar">
                      {guide.image && !guide.image.includes('placeholder') ? (
                        <img src={guide.image} alt={guide.name} />
                      ) : (
                        <span>{(guide.name || '?')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="bk-guide-info">
                      <h4 className="bk-guide-name">{guide.name}</h4>
                      <p className="bk-guide-exp">{guide.experience} yrs experience</p>
                      <div className="bk-guide-rating">
                        <Star size={12} style={{ color: '#f59e0b' }} />
                        <span>{guide.rating || 'New'}</span>
                        <span className="bk-guide-trips">· {guide.totalTrips} trips</span>
                      </div>
                      {guide.specialties?.length > 0 && (
                        <div className="bk-guide-tags">
                          {guide.specialties.slice(0, 2).map(s => (
                            <span key={s} className="bk-tag">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="bk-guide-price">
                      <span className="bk-guide-price-val">₹{guide.pricePerDay?.toLocaleString()}</span>
                      <span className="bk-guide-price-sub">/day</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="bk-nav-row bk-nav-row--right">
              <button
                className="bk-btn bk-btn--primary"
                onClick={() => setStep(1)}
                disabled={!selectedGuide}
              >
                Next: Trip Details <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Trip Details ── */}
        {step === 1 && (
          <div className="bk-step-panel">
            <h2 className="bk-panel-title">Trip Details</h2>

            <div className="bk-selected-guide-banner">
              <div className="bk-guide-avatar bk-guide-avatar--sm">
                <span>{(selectedGuide?.name || '?')[0].toUpperCase()}</span>
              </div>
              <div>
                <p className="bk-sgb-name">{selectedGuide?.name}</p>
                <p className="bk-sgb-sub">₹{selectedGuide?.pricePerDay?.toLocaleString()}/day · {trek.duration} days</p>
              </div>
              <button className="bk-change-link" onClick={() => setStep(0)} type="button">
                Change
              </button>
            </div>

            <div className="bk-form">
              <div className="bk-field">
                <label className="bk-label">Trek Date <span className="bk-required">*</span></label>
                <input
                  type="date"
                  name="date"
                  className="bk-input"
                  value={form.date}
                  onChange={handleFormChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="bk-field">
                <label className="bk-label">Group Size <span className="bk-required">*</span></label>
                <div className="bk-number-row">
                  <button
                    type="button"
                    className="bk-num-btn"
                    onClick={() => setForm(p => ({ ...p, groupSize: Math.max(1, p.groupSize - 1) }))}
                    disabled={form.groupSize <= 1}
                  >−</button>
                  <span className="bk-num-val">{form.groupSize}</span>
                  <button
                    type="button"
                    className="bk-num-btn"
                    onClick={() => setForm(p => ({ ...p, groupSize: Math.min(trek.maxGroupSize, p.groupSize + 1) }))}
                    disabled={form.groupSize >= trek.maxGroupSize}
                  >+</button>
                  <span className="bk-num-hint">Max {trek.maxGroupSize} per group</span>
                </div>
              </div>

              <div className="bk-field">
                <label className="bk-label">Special Requests <span className="bk-optional">(optional)</span></label>
                <textarea
                  name="specialRequests"
                  className="bk-input bk-textarea"
                  value={form.specialRequests}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Dietary requirements, accessibility needs, preferred pace…"
                />
              </div>
            </div>

            <div className="bk-nav-row">
              <button className="bk-btn bk-btn--ghost" onClick={() => setStep(0)} type="button">
                <ChevronLeft size={16} /> Back
              </button>
              <button
                className="bk-btn bk-btn--primary"
                onClick={() => setStep(2)}
                disabled={!form.date}
                type="button"
              >
                Review &amp; Pay <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Pay ── */}
        {step === 2 && (
          <div className="bk-step-panel">
            <h2 className="bk-panel-title">Review Your Booking</h2>

            <div className="bk-review-block">
              <h3 className="bk-review-section-title">Trek</h3>
              <div className="bk-review-row"><span>Name</span><strong>{trek.name}</strong></div>
              <div className="bk-review-row"><span>Location</span><strong>{trek.location}</strong></div>
              <div className="bk-review-row"><span>Duration</span><strong>{trek.duration} days</strong></div>
              <div className="bk-review-row"><span>Difficulty</span>
                <strong style={{ color: difficultyColor[trek.difficulty] }}>
                  {trek.difficulty}
                </strong>
              </div>
            </div>

            <div className="bk-review-block">
              <h3 className="bk-review-section-title">Guide</h3>
              <div className="bk-review-row"><span>Name</span><strong>{selectedGuide.name}</strong></div>
              <div className="bk-review-row"><span>Experience</span><strong>{selectedGuide.experience} years</strong></div>
              {selectedGuide.certifications?.length > 0 && (
                <div className="bk-review-row"><span>Certifications</span><strong>{selectedGuide.certifications.join(', ')}</strong></div>
              )}
            </div>

            <div className="bk-review-block">
              <h3 className="bk-review-section-title">Trip Details</h3>
              <div className="bk-review-row"><span>Date</span>
                <strong>{new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div className="bk-review-row"><span>Group Size</span><strong>{form.groupSize} person{form.groupSize > 1 ? 's' : ''}</strong></div>
              {form.specialRequests && (
                <div className="bk-review-row"><span>Requests</span><strong>{form.specialRequests}</strong></div>
              )}
            </div>

            <div className="bk-review-block bk-review-block--total">
              <h3 className="bk-review-section-title">Payment Summary</h3>
              <div className="bk-review-row"><span>Trek (₹{trek.price?.toLocaleString()} × {form.groupSize})</span><strong>₹{trekAmount.toLocaleString()}</strong></div>
              <div className="bk-review-row"><span>Guide (₹{selectedGuide.pricePerDay?.toLocaleString()} × {trek.duration} days)</span><strong>₹{guideAmount.toLocaleString()}</strong></div>
              <div className="bk-review-row bk-review-total">
                <span>Total</span>
                <strong>₹{totalAmount.toLocaleString()}</strong>
              </div>
            </div>

            <div className="bk-nav-row">
              <button className="bk-btn bk-btn--ghost" onClick={() => setStep(1)} type="button" disabled={processing}>
                <ChevronLeft size={16} /> Back
              </button>
              <button
                className="bk-btn bk-btn--pay"
                onClick={handlePayment}
                disabled={processing}
                type="button"
              >
                {processing ? (
                  <><Loader size={16} className="bk-spin" /> Processing…</>
                ) : (
                  <>Pay ₹{totalAmount.toLocaleString()} with Razorpay</>
                )}
              </button>
            </div>

            <p className="bk-secure-note">
              <Shield size={13} /> Secured by Razorpay · 256-bit SSL encryption
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
