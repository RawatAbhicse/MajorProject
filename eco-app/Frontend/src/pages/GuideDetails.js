import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Phone, Mail, CheckCircle, XCircle,
  Award, Globe, Briefcase, ArrowLeft, Users, Trash2, RotateCcw, AlertCircle, MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { guideApi, chatApi } from '../services/api';
import '../styles/GuideDetails.css';

const GuideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [guide, setGuide]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionType, setActionType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    guideApi.getById(id)
      .then(res => setGuide(res.data))
      .catch(() => setError('Failed to load guide profile.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwnGuide = user && guide && (
    guide.userId === user.id || 
    guide.userId === user._id ||
    guide.userId?._id === user.id ||
    String(guide.userId) === String(user.id)
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      console.log('Attempting to delete guide:', id);
      const response = await guideApi.delete(id);
      console.log('Delete response:', response);
      setActionMessage('Guide profile deleted successfully! Redirecting...');
      setActionType('success');
      setTimeout(() => {
        navigate('/guides');
      }, 2000);
    } catch (err) {
      console.error('Delete error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to delete guide profile';
      setActionMessage(errMsg);
      setActionType('error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleRestore = async () => {
    setDeleteLoading(true);
    try {
      console.log('Attempting to restore guide:', id);
      const response = await guideApi.restore(id);
      console.log('Restore response:', response);
      if (response.data && response.data.guide) {
        setGuide(response.data.guide);
        setActionMessage('Guide profile restored successfully!');
        setActionType('success');
        setTimeout(() => {
          setActionMessage('');
        }, 3000);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Restore error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to restore guide profile';
      setActionMessage(errMsg);
      setActionType('error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStartChat = async () => {
    setChatLoading(true);
    try {
      const response = await chatApi.getOrCreate(id, null);
      navigate(`/chat/${response.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setActionMessage('Failed to start chat. Please try again.');
      setActionType('error');
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <div className="gd-container"><p className="gd-status">Loading guide profile…</p></div>;
  if (error)   return <div className="gd-container"><p className="gd-status gd-error">{error}</p></div>;
  if (!guide)  return <div className="gd-container"><p className="gd-status">Guide not found.</p></div>;

  const isAvailable = guide.availability === 'Available';
  const imageSrc = guide.image?.startsWith('http')
    ? guide.image
    : `https://picsum.photos/seed/${id}/600/400`;

  return (
    <div className="gd-container">
      <div className="gd-content">

        {/* Back */}
        <button className="gd-back" onClick={() => navigate('/guides')}>
          <ArrowLeft size={16} /> Back to Guides
        </button>

        {/* Action Messages */}
        {actionMessage && (
          <div className={`action-alert action-${actionType}`}>
            {actionType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Hero */}
        <div className="gd-hero">
          <img
            src={imageSrc}
            alt={guide.name}
            className="gd-hero-img"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${id}/600/400`; }}
          />
          <div className="gd-hero-overlay">
            <h1 className="gd-name">{guide.name}</h1>
            <div className="gd-location">
              <MapPin size={15} /> {guide.location}
            </div>
            <div className="gd-rating-row">
              <Star size={15} className="gd-star" />
              <span className="gd-rating-val">{guide.rating}</span>
              <span className="gd-rating-count">({guide.reviewCount} reviews)</span>
            </div>
          </div>
          <div className={`gd-availability-badge ${isAvailable ? 'avail' : 'busy'}`}>
            {isAvailable ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {guide.availability}
          </div>
          {!guide.isActive && (
            <div className="gd-deleted-badge">
              <XCircle size={14} /> Deactivated
            </div>
          )}
        </div>

        {/* Stats Strip */}
        <div className="gd-stats">
          <div className="gd-stat">
            <Briefcase size={20} className="gd-stat-icon" />
            <p className="gd-stat-value">{guide.experience} yrs</p>
            <p className="gd-stat-label">Experience</p>
          </div>
          <div className="gd-stat">
            <Users size={20} className="gd-stat-icon" />
            <p className="gd-stat-value">{guide.totalTrips}</p>
            <p className="gd-stat-label">Trips Led</p>
          </div>
          <div className="gd-stat">
            <Globe size={20} className="gd-stat-icon" />
            <p className="gd-stat-value">{guide.languages?.length}</p>
            <p className="gd-stat-label">Languages</p>
          </div>
          <div className="gd-stat">
            <Award size={20} className="gd-stat-icon" />
            <p className="gd-stat-value">{guide.certifications?.length}</p>
            <p className="gd-stat-label">Certifications</p>
          </div>
        </div>

        <div className="gd-body">
          {/* Left Column */}
          <div className="gd-left">

            {/* Specialties */}
            <section className="gd-section">
              <h2 className="gd-section-title">Trek Specialties</h2>
              <div className="gd-tags">
                {guide.specialties?.map((s, i) => (
                  <span key={i} className="gd-tag">{s}</span>
                ))}
              </div>
            </section>

            {/* Languages */}
            <section className="gd-section">
              <h2 className="gd-section-title">Languages</h2>
              <div className="gd-tags">
                {guide.languages?.map((l, i) => (
                  <span key={i} className="gd-tag gd-tag-lang">{l}</span>
                ))}
              </div>
            </section>

            {/* Certifications */}
            {guide.certifications?.length > 0 && (
              <section className="gd-section">
                <h2 className="gd-section-title">Certifications</h2>
                <ul className="gd-cert-list">
                  {guide.certifications.map((c, i) => (
                    <li key={i} className="gd-cert-item">
                      <Award size={14} className="gd-cert-icon" /> {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar — Contact & Booking */}
          <aside className="gd-sidebar">
            <div className="gd-contact-card">
              <p className="gd-price">
                ₹{guide.pricePerDay?.toLocaleString()}
                <span className="gd-price-sub"> / day</span>
              </p>

              <a href={`tel:${guide.phone}`} className="gd-contact-btn gd-btn-phone">
                <Phone size={16} /> {guide.phone}
              </a>
              <a href={`mailto:${guide.email}`} className="gd-contact-btn gd-btn-email">
                <Mail size={16} /> {guide.email}
              </a>

              {!isOwnGuide && (
                <button
                  className="gd-contact-btn gd-btn-chat"
                  onClick={handleStartChat}
                  disabled={chatLoading}
                >
                  <MessageCircle size={16} /> {chatLoading ? 'Starting...' : 'Start Chat'}
                </button>
              )}

              <div className={`gd-avail-status ${isAvailable ? 'avail' : 'busy'}`}>
                {isAvailable ? <CheckCircle size={15} /> : <XCircle size={15} />}
                {guide.availability}
              </div>

              {/* Owner Actions */}
              {isOwnGuide && (
                <div className="gd-owner-actions">
                  {guide.isActive ? (
                    <button
                      className="gd-action-btn gd-btn-delete"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleteLoading}
                    >
                      <Trash2 size={16} /> Delete Profile
                    </button>
                  ) : (
                    <button
                      className="gd-action-btn gd-btn-restore"
                      onClick={handleRestore}
                      disabled={deleteLoading}
                    >
                      <RotateCcw size={16} /> Restore Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Guide Profile?</h3>
            <p className="modal-message">
              Are you sure you want to delete your guide profile? You can restore it later.
            </p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="modal-btn modal-btn-delete"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideDetails;
