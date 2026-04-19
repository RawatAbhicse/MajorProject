import React from 'react';
import { Link } from 'react-router-dom';
import { Mountain, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Mountain className="footer-logo-icon" />
              <span className="footer-logo-text">EcoTrek</span>
            </Link>
            <p className="footer-description">
              Your trusted companion for sustainable trekking adventures in the beautiful 
              mountains of Uttarakhand. Discover, plan, and experience eco-friendly treks 
              with local communities.
            </p>
            <div className="footer-social">
            <a href="#" className="footer-social-link">
                <Facebook className="footer-social-icon" />
              </a>
              <a href="#" className="footer-social-link">
                <Twitter className="footer-social-icon" />
              </a>
              <a href="#" className="footer-social-link">
                <Instagram className="footer-social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/treks" className="footer-link">Browse Treks</Link>
              </li>
              <li>
                <Link to="/planner" className="footer-link">Plan Your Trek</Link>
              </li>
              <li>
                <Link to="/budget" className="footer-link">Budget Calculator</Link>
              </li>
              <li>
                <a href="#" className="footer-link">Safety Guidelines</a>
              </li>
              <li>
                <a href="#" className="footer-link">Local Guides</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Services</h3>
            <ul className="footer-links">
              <li>
                <a href="#" className="footer-link">Trek Booking</a>
              </li>
              <li>
                <a href="#" className="footer-link">Guide Services</a>
              </li>
              <li>
                <a href="#" className="footer-link">Equipment Rental</a>
              </li>
              <li>
                <a href="#" className="footer-link">Homestays</a>
              </li>
              <li>
                <a href="#" className="footer-link">Weather Updates</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-section-title">Contact Us</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <span className="footer-contact-text">Dehradun, Uttarakhand, India</span>
              </div>
              <div className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                <span className="footer-contact-text">+91 9876543210</span>
              </div>
              <div className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                <span className="footer-contact-text">info@ecotrek.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">© 2024 EcoTrek Uttarakhand. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#" className="footer-bottom-link">Privacy Policy</a>
              <a href="#" className="footer-bottom-link">Terms of Service</a>
              <a href="#" className="footer-bottom-link">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;