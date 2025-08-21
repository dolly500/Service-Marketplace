import PropTypes from "prop-types";

const ServiceCard = ({ 
  id, 
  name, 
  description, 
  price, 
  image, 
  category, 
  isActive = false,
  onServiceClick = null,
  onBookClick = null,
  showActiveBadge = false,
  customStyles = {}
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  const handleCardClick = () => {
    if (onServiceClick) {
      onServiceClick(id);
    }
  };

  const handleBookClick = (e) => {
    e.stopPropagation(); 
    if (onBookClick) {
      onBookClick(id);
    }
  };

  const mergedStyles = {
    ...defaultStyles,
    ...customStyles
  };

  return (
    <div 
      style={mergedStyles.serviceItem} 
      onClick={handleCardClick}
      className="service-card"
    >
      <div style={mergedStyles.serviceItemImgContainer}>
        <img 
          style={mergedStyles.serviceItemImage}
          src={image ? `http://localhost:4000/images/${image}` : '/api/placeholder/260/200'} 
          alt={name}
          onError={(e) => {
            e.target.src = '/api/placeholder/260/200';
          }}
        />
        {showActiveBadge && isActive && (
          <div style={mergedStyles.activeBadge}>Active</div>
        )}
      </div>
      <div style={mergedStyles.serviceItemInfo}>
        <div style={mergedStyles.serviceItemNameRating}>
          <p style={mergedStyles.serviceItemName}>{name}</p>
          {category && (
            <div style={mergedStyles.categoryBadge}>
              {typeof category === 'object' ? category.name : category}
            </div>
          )}
        </div>
        <p style={mergedStyles.serviceItemDesc}>{description}</p>
        <p style={mergedStyles.serviceItemPrice}>{formatPrice(price)}</p>
        <button 
          style={mergedStyles.bookButton}
          onClick={handleBookClick}
          className="book-button"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

const defaultStyles = {
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
  activeBadge: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: '#28a745',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
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
  }
};

// Add CSS animations (only add if not already present)
if (!document.querySelector('#service-card-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-card-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
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
    
    .service-card:hover {
      transform: scale(1.05);
    }
    
    .book-button:hover {
      background-color: #303f9f !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

ServiceCard.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  image: PropTypes.string,
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object
  ]),
  isActive: PropTypes.bool,
  onServiceClick: PropTypes.func,
  onBookClick: PropTypes.func,
  showActiveBadge: PropTypes.bool,
  customStyles: PropTypes.object
};

export default ServiceCard;