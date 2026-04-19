// src/components/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const facts = [
  'Over 200 hidden treks are waiting for you in the Himalayas!',
  'Eco-friendly guides recycle 100% of waste on every trip.',
  'Our users have planted 5,000+ trees through trek bookings.',
  'Real-time weather updates keep you safe on the trail.',
];

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: ''
  });
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [factIdx, setFactIdx] = useState(0);

  const navigate = useNavigate();
  const { login, signup } = useAuth();

  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % facts.length), 4500);
    return () => clearInterval(id);
  }, []);

  const handleChange = e => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      if (isLogin) {
        const r = await login(formData.username, formData.password);
        r.success ? navigate('/home') : setError(r.error || 'Login failed');
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match'); return;
        }
        const r = await signup(formData.username, formData.email, formData.password);
        r.success ? navigate('/home') : setError(r.error || 'Signup failed');
      }
    } catch { setError('Network error'); } finally { setIsLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        {/* HERO */}
        <section className="hero">
          <h1 className="title">
            Discover the <span className="highlight">Untouched</span> Himalayas
          </h1>
          <p className="subtitle">
            Eco-friendly treks,, expert guides, real-time weather — all in one place.
          </p>
        </section>

        {/* CARD */}
        <div className="card">
          <div className="tabs">
            <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>SIGN IN</button>
            <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>SIGN UP</button>
          </div>

          <form onSubmit={handleSubmit} className="form">
            {error && <div className="error">{error}</div>}

            <input name="username" placeholder="USERNAME" value={formData.username} onChange={handleChange} required className="input" />
            {!isLogin && <input name="email" type="email" placeholder="EMAIL" value={formData.email} onChange={handleChange} required className="input" />}
            <input name="password" type="password" placeholder="PASSWORD" value={formData.password} onChange={handleChange} required className="input" />
            {!isLogin && <input name="confirmPassword" type="password" placeholder="CONFIRM PASSWORD" value={formData.confirmPassword} onChange={handleChange} required className="input" />}

            {isLogin && (
              <label className="checkbox">
                <input type="checkbox" checked={keepSignedIn} onChange={e => setKeepSignedIn(e.target.checked)} />
                Keep me signed in
              </label>
            )}

            <button type="submit" disabled={isLoading} className="btn">
              {isLoading ? 'LOADING...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </button>

            {isLogin && <a href="#" className="link" onClick={e => e.preventDefault()}>Forgot Password?</a>}
          </form>
        </div>

        {/* FACT */}
        <div className="fact">
          <span>Did you know?</span> {facts[factIdx]}
        </div>
      </div>
    </div>
  );
};

export default Login;