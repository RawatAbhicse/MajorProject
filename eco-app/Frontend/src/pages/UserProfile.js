// ...existing code...
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/api';
import {
  User, Mail, Calendar, Edit3, Save, X, LogOut,
  Shield, MapPin, Phone, Loader2
} from 'lucide-react';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const { user, logout } = useAuth();

  /* ────── UI state ────── */
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* ────── Local profile copy ────── */
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    location: '',
    joinDate: '',
    bio: ''
  });

  /* ────── Fill from auth context ────── */
  useEffect(() => {
    if (!user) return;

    const formatDate = (date) =>
      new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

    const join = user.signupTime ? formatDate(user.signupTime) : formatDate(Date.now());

    setProfile({
      username: user.username ?? '',
      email: user.email ?? '',
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      joinDate: join,
      bio: user.bio ?? ''
    });
  }, [user]);

  /* ────── Input change ────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  /* ────── Save profile ────── */
  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await userApi.updateMe({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio
      });

      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to update profile';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /* ────── Cancel edit ────── */
  const cancelEdit = useCallback(() => {
    if (!user) return;

    const formatDate = (date) =>
      new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

    const join = user.signupTime ? formatDate(user.signupTime) : formatDate(Date.now());

    setProfile({
      username: user.username ?? '',
      email: user.email ?? '',
      fullName: user.fullName ?? '',
      phone: user.phone ?? '',
      location: user.location ?? '',
      joinDate: join,
      bio: user.bio ?? ''
    });
    setIsEditing(false);
  }, [user]);

  /* ────── Toast ────── */
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ────── Logout ────── */
  const performLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  /* ────── Modal: Esc + click outside ────── */
  useEffect(() => {
    if (!showLogoutModal) return;

    const onEsc = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };

    const onOutside = (e) => {
      if ((e.target instanceof HTMLElement) && e.target.classList.contains('modal-overlay')) {
        setShowLogoutModal(false);
      }
    };

    document.addEventListener('keydown', onEsc);
    document.addEventListener('mousedown', onOutside);

    return () => {
      document.removeEventListener('keydown', onEsc);
      document.removeEventListener('mousedown', onOutside);
    };
  }, [showLogoutModal]);

  /* ────── Render ────── */
  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-error">
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      {/* Header */}
      <div className="user-profile-header">
        <h1 className="user-profile-title">My Profile</h1>

        <div className="user-profile-actions">
          {!isEditing ? (
            <button
              className="edit-button"
              onClick={() => setIsEditing(true)}
              aria-label="Edit profile"
            >
              <Edit3 className="button-icon" />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button
                className="save-button"
                onClick={saveProfile}
                disabled={isSaving}
                aria-label="Save changes"
              >
                {isSaving ? (
                  <Loader2 className="button-icon animate-spin" />
                ) : (
                  <Save className="button-icon" />
                )}
                {isSaving ? 'Saving…' : 'Save'}
              </button>

              <button
                className="cancel-button"
                onClick={cancelEdit}
                disabled={isSaving}
                aria-label="Cancel editing"
              >
                <X className="button-icon" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="user-profile-content">
        {/* Avatar Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            <User className="avatar-icon" />
          </div>

          <div className="profile-info">
            <h2 className="profile-name">
              {profile.fullName || profile.username}
            </h2>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-join-date">
              <Calendar className="info-icon" />
              Member since {profile.joinDate}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="profile-details">
          <h3 className="details-title">Personal Information</h3>

          <div className="details-grid">
            {/* Full Name */}
            <div className="detail-item">
              <label className="detail-label">
                <User className="label-icon" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="detail-input"
                  placeholder="Enter your full name"
                  autoFocus
                />
              ) : (
                <p className="detail-value">{profile.fullName || 'Not provided'}</p>
              )}
            </div>

            {/* Email */}
            <div className="detail-item">
              <label className="detail-label">
                <Mail className="label-icon" /> Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="detail-input"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="detail-value">{profile.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="detail-item">
              <label className="detail-label">
                <Phone className="label-icon" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="detail-input"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="detail-value">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            {/* Location */}
            <div className="detail-item">
              <label className="detail-label">
                <MapPin className="label-icon" /> Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  className="detail-input"
                  placeholder="Enter your location"
                />
              ) : (
                <p className="detail-value">{profile.location || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="detail-item full-width">
            <label className="detail-label">
              <Shield className="label-icon" /> Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                className="detail-textarea"
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p className="detail-value">{profile.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {/* Logout */}
        <div className="profile-actions">
          <button
            className="logout-button"
            onClick={() => setShowLogoutModal(true)}
            aria-label="Logout"
          >
            <LogOut className="button-icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Logout</h3>
              <button
                className="modal-close"
                onClick={() => setShowLogoutModal(false)}
                aria-label="Close modal"
              >
                <X className="close-icon" />
              </button>
            </div>

            <div className="modal-body">
              <p>Are you sure you want to logout? You'll need to sign in again.</p>
            </div>

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={performLogout}>
                <LogOut className="button-icon" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role="alert"
          aria-live="assertive"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
// ...existing code...