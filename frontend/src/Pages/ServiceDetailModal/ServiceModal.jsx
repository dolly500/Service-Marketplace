import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ServiceDetailModal = ({ isOpen, onClose, serviceId }) => {
  const [serviceDetail, setServiceDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceDetail();
    }
  }, [isOpen, serviceId]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:4000/api/service/detail/${serviceId}`);
      const result = await response.json();
      
      if (result.success) {
        setServiceDetail(result.data);
      } else {
        setError('Failed to fetch service details');
      }
    } catch (err) {
      setError('Error fetching service details: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBookService = () => {
    console.log('Booking service:', serviceId);
    // Add your booking logic here
    // For example: navigate to booking page or open booking form
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={handleOverlayClick}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading service details...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
            <button style={styles.retryBtn} onClick={fetchServiceDetail}>
              Retry
            </button>
          </div>
        )}

        {serviceDetail && !loading && !error && (
          <div style={styles.serviceDetailContent}>
            <div style={styles.serviceImageContainer}>
              <img 
                src={`http://localhost:4000/images/${serviceDetail.image}`}
                alt={serviceDetail.name}
                style={styles.serviceImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=Service+Image';
                }}
              />
            </div>

            <div style={styles.serviceInfo}>
              <div style={styles.categoryBadge}>
                {serviceDetail.category?.name || 'General'}
              </div>
              
              <h2 style={styles.serviceName}>{serviceDetail.name}</h2>
              
              <p style={styles.serviceDescription}>
                {serviceDetail.description}
              </p>

              <div style={styles.priceSection}>
                <span style={styles.priceLabel}>Price:</span>
                <span style={styles.price}>${serviceDetail.price}</span>
              </div>

              <div style={styles.serviceStatus}>
                <span style={styles.statusLabel}>Status:</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: serviceDetail.isActive ? '#4caf50' : '#f44336'
                }}>
                  {serviceDetail.isActive ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div style={styles.serviceDates}>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Created:</span>
                  <span style={styles.dateValue}>
                    {new Date(serviceDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>Updated:</span>
                  <span style={styles.dateValue}>
                    {new Date(serviceDetail.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button 
                  style={{
                    ...styles.bookButton,
                    opacity: serviceDetail.isActive ? 1 : 0.5,
                    cursor: serviceDetail.isActive ? 'pointer' : 'not-allowed'
                  }}
                  onClick={handleBookService}
                  disabled={!serviceDetail.isActive}
                >
                  Book Service
                </button>
                <button style={styles.cancelButton} onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    padding: '15px 20px 0 20px',
    borderRadius: '12px 12px 0 0',
    zIndex: 1001
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s ease'
  },
  serviceDetailContent: {
    padding: '20px'
  },
  serviceImageContainer: {
    marginBottom: '20px'
  },
  serviceImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e0e0e0'
  },
  serviceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  categoryBadge: {
    display: 'inline-block',
    backgroundColor: '#1a237e',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    alignSelf: 'flex-start'
  },
  serviceName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: '0'
  },
  serviceDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.5',
    margin: '0'
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  priceLabel: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  price: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a237e'
  },
  serviceStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusLabel: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white'
  },
  serviceDates: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  dateLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  dateValue: {
    fontSize: '14px',
    color: '#333'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  bookButton: {
    backgroundColor: '#1a237e',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    flex: 1,
    minWidth: '120px'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    flex: 1,
    minWidth: '120px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
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
    padding: '60px 20px'
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    textAlign: 'center'
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

// Add CSS animations and hover effects
if (!document.querySelector('#service-modal-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'service-modal-animations';
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    .modal-content {
      animation: modalFadeIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(styleSheet);
}

ServiceDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  serviceId: PropTypes.string
};

export default ServiceDetailModal;