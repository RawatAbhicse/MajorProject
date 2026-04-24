import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mountain, Menu, X, User, LogOut, Map, Home, BookOpen, DollarSign, Users, ChevronDown, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navbar.css';

const navLinks = [
  { path: '/home',    label: 'Home',     icon: Home },
  { path: '/treks',   label: 'Treks',    icon: Map },
  { path: '/guides',  label: 'Guides',   icon: Users },
  { path: '/friends', label: 'Friends',  icon: MessageCircle },
  { path: '/planner', label: 'Planner',  icon: BookOpen },
  { path: '/budget',  label: 'Budget',   icon: DollarSign },
];

const Navbar = () => {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className={`nb ${scrolled ? 'nb--scrolled' : ''}`}>
      <div className="nb__inner">

        {/* Logo */}
        <Link to={user ? '/home' : '/'} className="nb__logo">
          <div className="nb__logo-icon">
            <Mountain size={20} />
          </div>
          <span className="nb__logo-text">EcoTrek</span>
        </Link>

        {/* Desktop Links */}
        {user && (
          <div className="nb__links">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`nb__link ${isActive(path) ? 'nb__link--active' : ''}`}
              >
                <Icon size={15} className="nb__link-icon" />
                {label}
                {isActive(path) && <span className="nb__link-dot" />}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="nb__right">
          {user ? (
            <div className="nb__profile" ref={profileRef}>
              <button
                className="nb__avatar-btn"
                onClick={() => setProfileOpen(p => !p)}
                aria-label="Profile menu"
              >
                <div className="nb__avatar">{initials}</div>
                <span className="nb__username">{user.username}</span>
                <ChevronDown size={14} className={`nb__chevron ${profileOpen ? 'nb__chevron--open' : ''}`} />
              </button>

              {profileOpen && (
                <div className="nb__dropdown">
                  <div className="nb__dropdown-header">
                    <div className="nb__dropdown-avatar">{initials}</div>
                    <div>
                      <p className="nb__dropdown-name">{user.fullName || user.username}</p>
                      <p className="nb__dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  <div className="nb__dropdown-divider" />
                  <Link to="/profile" className="nb__dropdown-item" onClick={() => setProfileOpen(false)}>
                    <User size={15} /> My Profile
                  </Link>
                  <Link to="/register-guide" className="nb__dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Users size={15} /> Become a Guide
                  </Link>
                  <button className="nb__dropdown-item nb__dropdown-item--danger" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nb__login-btn">Sign In</Link>
          )}

          {/* Hamburger */}
          {user && (
            <button
              className="nb__hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && user && (
        <div className="nb__mobile">
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nb__mobile-link ${isActive(path) ? 'nb__mobile-link--active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="nb__mobile-divider" />
          <Link to="/profile" className="nb__mobile-link">
            <User size={16} /> Profile
          </Link>
          <button className="nb__mobile-link nb__mobile-link--danger" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
