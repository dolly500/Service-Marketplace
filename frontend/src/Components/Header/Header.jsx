import { useState } from 'react';
import './Header.css';
import { Search, MapPin, Star, Shield, Calendar, } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="header">
      <div className="header-container">
        {/* Left Content Section */}
        <div className="header-content">
          <div className="booking-status">
            <div className="status-indicator">
              <span className="status-dot"></span>
              300 Booking Completed
            </div>
          </div>
          
          <h1 className="header-title">
            Get your<span className="title-highlight"> Home Services</span>
          </h1>
          
          <p className="header-subtitle">
            We can connect you to the right Service, first time and everytime.
          </p>

          {/* Search Section */}
          <div className="search-container">
            <div className="search-box">
              <div className="search-input-group">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for Service"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="location-input-group">
                <MapPin className="location-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="location-input"
                />
              </div>
              <button className="search-btn">
                <Search size={18} />
                Search
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="stats-container">
            <div className="stat-item">
              <Shield className="stat-icon" size={24} />
              <div className="stat-content">
                <span className="stat-number">215,292 +</span>
                <span className="stat-label">Verified Providers</span>
              </div>
            </div>
            <div className="stat-item">
              <Calendar className="stat-icon" size={24} />
              <div className="stat-content">
                <span className="stat-number">90,000+</span>
                <span className="stat-label">Services Completed</span>
              </div>
            </div>
            <div className="stat-item">
              <Star className="stat-icon" size={24} />
              <div className="stat-content">
                <span className="stat-number">2,390,968</span>
                <span className="stat-label">Reviews Globally</span>
              </div>
            </div>
          </div>
        </div>      
      </div>
    </div>
  );
};

export default Header;