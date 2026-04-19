// ...existing code...
import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Map } from 'lucide-react';
import TrekCard from '../components/TrekCard';
import MapView from '../components/MapView';
import { trekApi } from '../services/api';
import '../styles/TrekList.css';

const TrekList = () => {
  const [treks, setTreks] = useState([]);
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    duration: 'all',
    priceRange: 'all',
    season: 'all',
    location: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    trekApi.getAll()
      .then((res) => {
        setTreks(res.data);
        setFilteredTreks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Treks fetch error:', err);
        setError('Failed to load treks');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = treks.filter((trek) => {
      const matchesSearch =
        trek.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trek.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty = filters.difficulty === 'all' || trek.difficulty === filters.difficulty;
      const matchesDuration =
        filters.duration === 'all' ||
        (filters.duration === 'short' && trek.duration <= 5) ||
        (filters.duration === 'medium' && trek.duration >= 6 && trek.duration <= 8) ||
        (filters.duration === 'long' && trek.duration >= 9);

      const matchesPrice =
        filters.priceRange === 'all' ||
        (filters.priceRange === 'budget' && trek.price <= 15000) ||
        (filters.priceRange === 'mid' && trek.price > 15000 && trek.price <= 25000) ||
        (filters.priceRange === 'premium' && trek.price > 25000);

      const matchesSeason = filters.season === 'all' || trek.season === filters.season;

      const matchesLocation =
        filters.location === 'all' || trek.location.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesDifficulty && matchesDuration && matchesPrice && matchesSeason && matchesLocation;
    });

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    setFilteredTreks(filtered);
  }, [treks, searchQuery, filters, sortBy]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty: 'all',
      duration: 'all',
      priceRange: 'all',
      season: 'all',
      location: 'all',
    });
    setSearchQuery('');
  };

  const difficultyOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'easy', label: 'Easy' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'hard', label: 'Hard' },
  ];

  const durationOptions = [
    { value: 'all', label: 'Any Duration' },
    { value: 'short', label: '1-5 Days' },
    { value: 'medium', label: '6-8 Days' },
    { value: 'long', label: '9+ Days' },
  ];

  const priceOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'budget', label: 'Under ₹15,000' },
    { value: 'mid', label: '₹15,000 - ₹25,000' },
    { value: 'premium', label: 'Above ₹25,000' },
  ];

  const seasonOptions = [
    { value: 'all', label: 'All Seasons' },
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'autumn', label: 'Autumn' },
    { value: 'winter', label: 'Winter' },
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'chamoli', label: 'Chamoli' },
    { value: 'uttarkashi', label: 'Uttarkashi' },
    { value: 'pithoragarh', label: 'Pithoragarh' },
    { value: 'tehri', label: 'Tehri' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' },
  ];

  if (loading) return <div className="trek-list-container">Loading...</div>;
  if (error) return <div className="trek-list-container">{error}</div>;

  return (
    <div className="trek-list-container">
      <div className="trek-list-content">
        <div className="trek-list-header">
          <h1 className="trek-list-title">Discover Uttarakhand Treks</h1>
          <p className="trek-list-description">
            Explore {treks.length} eco-friendly trekking routes across the Himalayas
          </p>
        </div>

        <div className="search-filter-bar">
          <div className="search-filter-content">
            <div className="search-input-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search treks, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-toggle-button ${viewMode === 'grid' ? 'active' : 'inactive'}`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`view-toggle-button ${viewMode === 'map' ? 'active' : 'inactive'}`}
              >
                <Map className="view-toggle-icon" />
                Map View
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle"
            >
              <Filter className="filter-toggle-icon" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filters-grid">
                <div>
                  <label className="filter-label">Difficulty</label>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                    className="input-field"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="input-field"
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Price Range</label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="input-field"
                  >
                    {priceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Season</label>
                  <select
                    value={filters.season}
                    onChange={(e) => handleFilterChange('season', e.target.value)}
                    className="input-field"
                  >
                    {seasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="filter-label">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="input-field"
                  >
                    {locationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-actions">
                <button onClick={clearFilters} className="clear-filters">
                  Clear All Filters
                </button>
                <p className="results-count">
                  Showing {filteredTreks.length} of {treks.length} treks
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="results-header">
          <div>
            <p className="results-text">
              {filteredTreks.length} trek{filteredTreks.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <div className="sort-container">
            <span className="sort-label">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="treks-grid">
            {filteredTreks.map((trek, index) => (
              <TrekCard
                key={trek._id ?? trek.id ?? trek.slug ?? index}
                trek={trek}
              />
            ))}
          </div>
        ) : (
          <div className="map-view-container">
            <div className="map-view-map">
              <MapView
                treks={filteredTreks}
                selectedTrek={selectedTrek}
                onTrekSelect={setSelectedTrek}
                height="600px"
              />
            </div>
            <div className="map-view-list">
              {filteredTreks.map((trek, index) => (
                <div
                  key={trek._id ?? trek.id ?? trek.slug ?? index}
                  onClick={() => setSelectedTrek(trek)}
                  className={`map-view-card ${selectedTrek?.id === trek.id ? 'selected' : ''}`}
                >
                  <div className="map-view-card-content">
                    <img
                      src={trek.image || `https://picsum.photos/seed/${trek._id}/200/150`}
                      alt={trek.name}
                      className="map-view-card-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://picsum.photos/seed/${trek._id}/200/150`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="map-view-card-title">{trek.name}</h3>
                      <p className="map-view-card-location">{trek.location}</p>
                      <div className="map-view-card-details">
                        <span className="map-view-card-price">₹{trek.price.toLocaleString()}</span>
                        <span className="map-view-card-duration">{trek.duration} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredTreks.length === 0 && (
          <div className="no-results">
            <MapPin className="no-results-icon" />
            <h3 className="no-results-title">No treks found</h3>
            <p className="no-results-text">
              Try adjusting your search criteria or clearing filters
            </p>
            <button onClick={clearFilters} className="no-results-button">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrekList;
// ...existing code...