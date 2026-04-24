import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Award, MapPin, Globe, Phone, Mail, DollarSign, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';
import { guideApi } from '../services/api';
import '../styles/GuideRegistration.css';

const GuideRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    experience: '',
    pricePerDay: '',
    specialties: [],
    languages: [],
    certifications: [],
    availability: 'Available',
    image: null,
  });

  const [inputValues, setInputValues] = useState({
    specialty: '',
    language: '',
    certification: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSpecialty = () => {
    if (inputValues.specialty.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, inputValues.specialty.trim()],
      }));
      setInputValues(prev => ({ ...prev, specialty: '' }));
    }
  };

  const handleRemoveSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const handleAddLanguage = () => {
    if (inputValues.language.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, inputValues.language.trim()],
      }));
      setInputValues(prev => ({ ...prev, language: '' }));
    }
  };

  const handleRemoveLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const handleAddCertification = () => {
    if (inputValues.certification.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, inputValues.certification.trim()],
      }));
      setInputValues(prev => ({ ...prev, certification: '' }));
    }
  };

  const handleRemoveCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setError('Name is required');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Phone is required');
        return false;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        setError('Phone must be 10 digits');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.location.trim()) {
        setError('Location is required');
        return false;
      }
      if (!formData.experience || formData.experience < 1) {
        setError('Experience must be at least 1 year');
        return false;
      }
      if (!formData.pricePerDay || formData.pricePerDay < 0) {
        setError('Price per day is required');
        return false;
      }
    } else if (currentStep === 3) {
      if (formData.specialties.length === 0) {
        setError('Add at least one specialty');
        return false;
      }
      if (formData.languages.length === 0) {
        setError('Add at least one language');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setError('');
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for submission
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        experience: parseInt(formData.experience),
        pricePerDay: parseInt(formData.pricePerDay),
        specialties: formData.specialties,
        languages: formData.languages,
        certifications: formData.certifications,
        availability: formData.availability,
      };

      console.log('Submitting guide registration...', submitData);
      const response = await guideApi.create(submitData);
      
      console.log('Registration successful:', response.data);
      setSuccess('Guide registration successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/guides');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guide-registration-page">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Become a Guide</h1>
          <p>Share your expertise and guide adventurers through amazing treks</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Personal Info</div>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Experience</div>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Skills</div>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-number">4</div>
            <div className="step-label">Review</div>
          </div>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="registration-form">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="form-step">
              <h2>Personal Information</h2>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <Mail size={18} />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={18} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Profile Picture</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-input"
                    className="file-input"
                    style={{ display: 'none' }}
                  />
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: null }));
                        }}
                        className="remove-image-btn"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="image-input" className="upload-label">
                      <Upload size={32} />
                      <span className="upload-text">Click to upload image</span>
                      <span className="upload-subtext">PNG, JPG, GIF up to 5MB</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Experience & Pricing */}
          {step === 2 && (
            <div className="form-step">
              <h2>Experience & Pricing</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <MapPin size={18} />
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Himachal Pradesh"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Award size={18} />
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <DollarSign size={18} />
                    Price Per Day (₹) *
                  </label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleChange}
                    placeholder="e.g., 1500"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <div className="form-step">
              <h2>Skills & Expertise</h2>

              {/* Specialties */}
              <div className="form-group">
                <label>
                  <Award size={18} />
                  Specialties * (Add at least one)
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={inputValues.specialty}
                    onChange={(e) =>
                      setInputValues(prev => ({ ...prev, specialty: e.target.value }))
                    }
                    placeholder="e.g., Mountain Climbing, Rock Climbing"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpecialty();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialty}
                    className="add-button"
                  >
                    Add
                  </button>
                </div>
                <div className="tags-container">
                  {formData.specialties.map((specialty, index) => (
                    <span key={index} className="tag">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(index)}
                        className="remove-tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="form-group">
                <label>
                  <Globe size={18} />
                  Languages * (Add at least one)
                </label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={inputValues.language}
                    onChange={(e) =>
                      setInputValues(prev => ({ ...prev, language: e.target.value }))
                    }
                    placeholder="e.g., English, Hindi, Mandarin"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLanguage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="add-button"
                  >
                    Add
                  </button>
                </div>
                <div className="tags-container">
                  {formData.languages.map((language, index) => (
                    <span key={index} className="tag">
                      {language}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(index)}
                        className="remove-tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="form-group">
                <label>Certifications (Optional)</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    value={inputValues.certification}
                    onChange={(e) =>
                      setInputValues(prev => ({ ...prev, certification: e.target.value }))
                    }
                    placeholder="e.g., IAMM Certified, Wilderness First Aid"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCertification();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="add-button"
                  >
                    Add
                  </button>
                </div>
                <div className="tags-container">
                  {formData.certifications.map((cert, index) => (
                    <span key={index} className="tag">
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(index)}
                        className="remove-tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="form-step">
              <h2>Review Your Information</h2>

              <div className="review-section">
                <h3>Personal Information</h3>
                <div className="review-row">
                  <span>Name:</span>
                  <strong>{formData.name}</strong>
                </div>
                <div className="review-row">
                  <span>Email:</span>
                  <strong>{formData.email}</strong>
                </div>
                <div className="review-row">
                  <span>Phone:</span>
                  <strong>{formData.phone}</strong>
                </div>
              </div>

              <div className="review-section">
                <h3>Experience & Pricing</h3>
                <div className="review-row">
                  <span>Location:</span>
                  <strong>{formData.location}</strong>
                </div>
                <div className="review-row">
                  <span>Years of Experience:</span>
                  <strong>{formData.experience} years</strong>
                </div>
                <div className="review-row">
                  <span>Price Per Day:</span>
                  <strong>₹{parseInt(formData.pricePerDay).toLocaleString()}</strong>
                </div>
                <div className="review-row">
                  <span>Availability:</span>
                  <strong>{formData.availability}</strong>
                </div>
              </div>

              <div className="review-section">
                <h3>Skills & Expertise</h3>
                <div className="review-row">
                  <span>Specialties:</span>
                  <div className="tags-container">
                    {formData.specialties.map((specialty, index) => (
                      <span key={index} className="tag tag-small">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="review-row">
                  <span>Languages:</span>
                  <div className="tags-container">
                    {formData.languages.map((language, index) => (
                      <span key={index} className="tag tag-small">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="review-row">
                    <span>Certifications:</span>
                    <div className="tags-container">
                      {formData.certifications.map((cert, index) => (
                        <span key={index} className="tag tag-small">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-actions">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn-secondary"
                disabled={loading}
              >
                Previous
              </button>
            )}

            {step < 4 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
                disabled={loading}
              >
                Next
              </button>
            )}

            {step === 4 && (
              <button
                type="submit"
                className="btn-primary btn-submit"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
        </form>

        <p className="form-footer">
          Already a guide? <a href="/guides">View all guides</a>
        </p>
      </div>
    </div>
  );
};

export default GuideRegistration;
