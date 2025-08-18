import { useContext, useState } from "react";
import { StoreContext } from "../context/storeContext";
import PropTypes from "prop-types";
import ServiceCard from "../../Components/ServiceCard";
import ServiceDetailModal from "../../Pages/ServiceDetailModal/ServiceModal"; 

const ServiceDisplay = ({ category }) => {
  const { service_list, loading, error } = useContext(StoreContext);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);

  const handleServiceClick = (serviceId) => {
    // Open modal with service details
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleBookClick = (serviceId) => {
    // Open modal with service details (you can customize this behavior)
    setSelectedServiceId(serviceId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedServiceId(null);
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
    <>
      <div style={styles.serviceDisplay} id="service-display">
        <h2 style={styles.title}>Top services near you!</h2>
        <div style={styles.serviceDisplayList}>
          {service_list.map((item, index) => {
            if (category === "All" || category === item.category) {
              return (
                <ServiceCard
                  key={item._id || index}
                  id={item._id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                  image={item.image}
                  category={item.category}
                  onServiceClick={handleServiceClick}
                  onBookClick={handleBookClick}
                />
              );
            }
          })}
        </div>
      </div>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        serviceId={selectedServiceId}
      />
    </>
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

// Add CSS animations for loading spinner
if (!document.querySelector('#service-display-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-display-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .retry-btn:hover {
      background-color: #303f9f !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

ServiceDisplay.propTypes = {
  category: PropTypes.string.isRequired,
};

export default ServiceDisplay;