import { useContext } from "react";
import { StoreContext } from "../context/storeContext";
import PropTypes from "prop-types";

const ServiceDisplay = ({ category }) => {
  const { service_list, loading, error } = useContext(StoreContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const ServiceItem = ({ id, name, description, price, image, category }) => {
    return (
      <div style={styles.serviceItem}>
        <div style={styles.serviceItemImgContainer}>
          <img 
            style={styles.serviceItemImage}
            src={image ? `http://localhost:4000/images/${image}` : '/api/placeholder/260/200'} 
            alt={name}
            onError={(e) => {
              e.target.src = '/api/placeholder/260/200';
            }}
          />
        </div>
        <div style={styles.serviceItemInfo}>
          <div style={styles.serviceItemNameRating}>
            <p style={styles.serviceItemName}>{name}</p>
            {category && (
              <div style={styles.categoryBadge}>
                {typeof category === 'object' ? category.name : category}
              </div>
            )}
          </div>
          <p style={styles.serviceItemDesc}>{description}</p>
          <p style={styles.serviceItemPrice}>{formatPrice(price)}</p>
          <button style={styles.bookButton}>Book Now</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>Top services near you!</h2>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>Top services near you!</h2>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Error loading services: {error}</p>
          <button 
            style={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.serviceDisplay} id="service-display">
      <h2 style={styles.title}>Top services near you!</h2>
      <div style={styles.serviceDisplayList}>
        {service_list.map((item, index) => {
          if (category === "All" || category === item.category) {
            return (
              <ServiceItem
                key={item._id || index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                category={item.category}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

const styles = {
  serviceDisplay: {
    textAlign: 'center',
    padding: '20px'
  },
  title: {
    fontSize: 'max(2.5vw, 24px)',
    fontWeight: '600',
    color: '#1a237e',
    margin: '0 0 30px 0'
  },
  serviceDisplayList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    marginTop: '30px',
    gap: '25px',
    rowGap: '40px',
    padding: '0 20px'
  },
  serviceItem: {
    width: '100%',
    margin: 'auto',
    borderRadius: '15px',
    boxShadow: '0 0 10px #00000015',
    transition: 'transform 0.3s ease',
    animation: 'fadeInUp 0.5s ease',
    cursor: 'pointer',
    backgroundColor: '#fff'
  },
  serviceItemImgContainer: {
    position: 'relative'
  },
  serviceItemImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '15px 15px 0 0'
  },
  serviceItemInfo: {
    padding: '20px'
  },
  serviceItemNameRating: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px'
  },
  serviceItemName: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#333',
    margin: '0',
    flex: '1'
  },
  categoryBadge: {
    backgroundColor: '#1a237e',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    marginLeft: '10px'
  },
  serviceItemDesc: {
    fontSize: '12px',
    color: '#676767',
    margin: '0 0 15px 0',
    lineHeight: '1.4'
  },
  serviceItemPrice: {
    fontSize: '22px',
    fontWeight: '500',
    color: '#1a237e',
    margin: '0 0 15px 0'
  },
  bookButton: {
    backgroundColor: '#1a237e',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
    transition: 'background-color 0.3s ease'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    marginTop: '30px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a237e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  loadingText: {
    color: '#666',
    fontSize: '16px',
    margin: '0'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    marginTop: '30px'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  retryBtn: {
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease'
  }
};

// Add CSS animations (only add if not already present)
if (!document.querySelector('#service-display-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-display-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .service-item:hover {
      transform: scale(1.05);
    }
    
    .book-button:hover {
      background-color: #303f9f !important;
    }
    
    .retry-btn:hover {
      background-color: #303f9f !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

// Define prop-types for validation
ServiceDisplay.propTypes = {
  category: PropTypes.string.isRequired,
};

export default ServiceDisplay;