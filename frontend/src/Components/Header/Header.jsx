import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import { Search, MapPin, Star, Shield, Calendar } from 'lucide-react';

const suggestionsList = [
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Handyman",
  "Painting",
  "Gardening",
  "Carpentry",
  "Pest Control"
];

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchWrapperRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('query', searchQuery.trim());
      if (location.trim()) {
        searchParams.set('location', location.trim());
      }
      navigate(`/searchservices?${searchParams.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      const filtered = suggestionsList.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/searchservices?query=${suggestion}`);
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <div className="header-container">
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
            <form onSubmit={handleSearch} className="search-box">
              <div className="search-input-group relative" ref={searchWrapperRef}>
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for Service (e.g., cleaning, plumbing)"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="search-input"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="suggestions-dropdown">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li 
                        key={index} 
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="suggestion-item"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
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
              <button type="submit" className="search-btn">
                <Search size={18} />
                Search
              </button>
            </form>
          </div>

          {/* Popular Searches */}
          <div className="popular-searches">
            <span className="popular-label">Popular:</span>
            <div className="search-tags">
              {["Cleaning", "Plumbing", "Electrical", "Handyman", "Painting", "Gardening", "Carpentry", "Pest Control"].map((tag, idx) => (
                <span 
                  key={idx}
                  className="search-tag" 
                  onClick={() => handleSuggestionClick(tag)}
                >
                  {tag}
                </span>
              ))}
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
