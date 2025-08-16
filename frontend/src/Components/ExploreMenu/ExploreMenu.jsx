import "./ExploreMenu.css";
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
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
        <h1>Checkout our Recent <span className="highlight">Category</span></h1>
        <p className="explore-services-subtitle">
          Service categories help organize and structure the offerings on a marketplace,
          <br />making it easier for users to find what they need.
        </p>
      </div>
      
      <div className="categories-grid">
        {categories.slice(0, 7).map((item) => {
          const imageUrl = item.image 
            ? `http://localhost:4000/images/${item.image}` 
            : '';
          
          const description = item.description;
          
          return (
            <div
              onClick={() =>
                setCategory((prev) =>
                  prev === item.name ? "All" : item.name
                )
              }
              key={item._id}
              className={`category-card ${category === item.name ? "active-card" : ""}`}
            >
              <div className="category-icon-wrapper">
                <div className="category-icon">
                  <img
                    src={imageUrl}
                    alt={item.name}                
                  />
                </div>
              </div>
              
              <div className="category-info">
                <h3 className="category-name">{item.name}</h3>
                <p className="category-description">
                  {description}
                </p>
                <strong>{item.serviceCount} services</strong>
              </div>
            </div>
          );
        })}
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

// Define PropTypes for the component
ExploreMenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default ExploreMenu;