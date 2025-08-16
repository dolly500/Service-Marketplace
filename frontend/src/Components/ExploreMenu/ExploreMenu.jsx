import "./ExploreMenu.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();
  const categoriesContainerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/category/list');
        const result = await response.json();
        
        if (result.success) {
          setCategories(result.data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError('Error fetching categories: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Check scroll position and update button visibility
  const checkScrollButtons = () => {
    if (categoriesContainerRef.current) {
      const container = categoriesContainerRef.current;
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  // Update scroll buttons when categories change
  useEffect(() => {
    if (categories.length > 0) {
      setTimeout(checkScrollButtons, 100); // Small delay to ensure DOM is updated
    }
  }, [categories]);

  const handleCategoryClick = (categoryName) => {
    setCategory(categoryName);
    navigate(`/category/${categoryName}`);
  };

  const scrollLeft = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300); // Check after scroll animation
    }
  };

  const scrollRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300); // Check after scroll animation
    }
  };

  // Handle scroll event to update button states
  const handleScroll = () => {
    checkScrollButtons();
  };

  if (loading) {
    return (
      <div className="explore-services" id="explore-services">
        <div className="explore-services-header">
          <h1>Checkout our Recent Service <span className="highlight">Category</span></h1>
          <p className="explore-services-subtitle">
            Service categories help organize and structure the offerings on a marketplace,
            <br />making it easier for users to find what they need.
          </p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading service categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-services" id="explore-services">
        <div className="explore-services-header">
          <h1>Checkout our Recent Service <span className="highlight">Category</span></h1>
          <p className="explore-services-subtitle">
            Service categories help organize and structure the offerings on a marketplace,
            <br />making it easier for users to find what they need.
          </p>
        </div>
        <div className="error-container">
          <p>Error loading service categories: {error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-services" id="explore-services">
      <div className="explore-services-header">
        <h1>Checkout our Recent Service <span className="highlight">Category</span></h1>
        <p className="explore-services-subtitle">
          Service categories help organize and structure the offerings on a marketplace,
          <br />making it easier for users to find what they need.
        </p>
      </div>
      
      <div className="category-carousel">
        <button 
          className={`carousel-btn prev ${!canScrollLeft ? 'disabled' : ''}`}
          onClick={scrollLeft}
          disabled={!canScrollLeft}
        >
          &#8249;
        </button>
        
        <div 
          className="categories-container" 
          ref={categoriesContainerRef}
          onScroll={handleScroll}
        >
          {categories.map((item) => {
            const imageUrl = item.image 
              ? `http://localhost:4000/images/${item.image}` 
              : '';
            
            return (
              <div
                onClick={() => handleCategoryClick(item.name)}
                key={item._id}
                className={`category-card ${category === item.name ? "active-card" : ""}`}
              >
                <div className="category-icon">
                  <img src={imageUrl} alt={item.name} />
                </div>
                <div className="category-info">
                  <h3 className="category-name">{item.name}</h3>
                  <p className="category-count">{item.serviceCount} Services</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <button 
          className={`carousel-btn next ${!canScrollRight ? 'disabled' : ''}`}
          onClick={scrollRight}
          disabled={!canScrollRight}
        >
          &#8250;
        </button>
      </div>
      
      <div className="view-all-section">
        <a href="/categories">
          <button 
            className="view-all-btn"
            onClick={() => setCategory("All")}
          >
            View All <span className="arrow">→</span>
          </button>
        </a>
      </div>
    </div>
  );
};

ExploreMenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default ExploreMenu;