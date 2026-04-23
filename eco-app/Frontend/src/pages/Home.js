import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Users, Star, ArrowRight, Leaf, Shield, Heart } from 'lucide-react';
import TrekCard from '../components/TrekCard';
import WeatherWidget from '../components/WeatherWidget';
import { trekApi } from '../services/api';
import '../styles/Home.css';

import Footer from '../components/Footer';
const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredTreks, setFeaturedTreks] = useState([]);
  const [treksLoading, setTreksLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    trekApi.getAll()
      .then(res => {
        const sorted = [...res.data].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
        setFeaturedTreks(sorted.slice(0, 3));
      })
      .catch(() => setFeaturedTreks([]))
      .finally(() => setTreksLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/treks${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const stats = [
    { label: 'Happy Trekkers', value: '5,000+', icon: Users },
    { label: 'Trek Routes', value: '50+', icon: MapPin },
    { label: 'Average Rating', value: '4.8+', icon: Star },
    { label: 'Years Experience', value: '10+', icon: Shield }
  ];

  const features = [
    {
      icon: Leaf,
      title: 'Eco-Friendly Treks',
      description: 'Sustainable tourism that supports local communities and preserves nature.'
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Professional guides, safety equipment, and real-time weather monitoring.'
    },
    {
      icon: Heart,
      title: 'Community Support',
      description: 'Direct partnerships with local guides, homestays, and mountain communities.'
    }
  ];
  return (
    <div className="home-container">
      <section className="hero-section">
        <div
          className="hero-overlay"
          style={{ backgroundImage: 'url("https://picsum.photos/seed/uttarakhand/1920/1080")' }}
        ></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            Discover 
            3<br/>Uttarakhand's
            <span className="hero-title-highlight">Hidden Gems</span>
          </h1>
          <p className="hero-description">
            Plan eco-friendly treks with local guides, real-time weather updates, and sustainable tourism practices.
          </p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <div className="search-input-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search treks, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <span>Explore Treks</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="quick-actions">
            <Link to="/planner" className="quick-action-button">
              Plan Your Trek
            </Link>
            <Link to="/budget" className="quick-action-button">
              Budget Calculator
            </Link>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-indicator-inner">
            <div className="scroll-indicator-dot"></div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">
                  <stat.icon className="stat-icon-inner" />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="treks-section">
        <div className="treks-container">
          <div className="text-center mb-12">
            <h2 className="treks-title">Featured Treks</h2>
            <p className="treks-description">
              Discover our most popular eco-friendly trekking routes in Uttarakhand
            </p>
          </div>

          <div className="treks-grid">
            {treksLoading ? (
              <p style={{ textAlign: 'center', color: '#64748b', gridColumn: '1/-1' }}>Loading treks…</p>
            ) : featuredTreks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', gridColumn: '1/-1' }}>No treks found. Run the seed script to populate the database.</p>
            ) : (
              featuredTreks.map((trek) => (
                <TrekCard key={trek._id} trek={trek} />
              ))
            )}
          </div>

          <div className="text-center">
            <Link to="/treks" className="btn-primary inline-flex items-center space-x-2">
              <span>View All Treks</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="text-center mb-12">
            <h2 className="features-title">Why Choose EcoTrek?</h2>
            <p className="features-description">
              We're committed to sustainable tourism that benefits everyone
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon-container">
                  <div className="feature-icon-circle">
                    <feature.icon className="feature-icon" />
                  </div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-grid">
            <div className="cta-content">
              <h2 className="cta-title">Plan with Confidence</h2>
              <p className="cta-description">
                Get real-time weather updates, connect with experienced local guides, 
                and join a community of eco-conscious trekkers. Your adventure starts here.
              </p>
              <div className="cta-buttons">
                <Link to="/planner" className="btn-primary inline-flex items-center space-x-2">
                  <span>Start Planning</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/treks" className="btn-secondary inline-flex items-center space-x-2">
                  <span>Browse Treks</span>
                </Link>
              </div>
            </div>
             <div className="mt-6 lg:mt-0">
              <WeatherWidget location="Dehradun" lat={30.3165} lon={78.0322} />
            </div>
          </div>
        </div>
      </section>
      
    <Footer></Footer>
    </div>
  );
};

export default Home;