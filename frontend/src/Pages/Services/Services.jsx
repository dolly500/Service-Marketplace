import { useState, useEffect } from 'react';
import ServiceCard from '../../Components/ServiceCard';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/service/list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setServices(data.data.filter(service => service.isActive));
      } else {
        throw new Error('Invalid response format');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(`Failed to fetch services: ${err.message}`);
      setLoading(false);
    }
  };

  const handleServiceClick = (serviceId) => {
    // Handle service click logic here
    console.log('Service clicked:', serviceId);
  };

  const handleBookClick = (serviceId) => {
    // Handle book click logic here
    console.log('Book clicked for service:', serviceId);
  };

  if (loading) {
    return (
      <div style={styles.serviceDisplay}>
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
      <div style={styles.serviceDisplay}>
        <h2 style={styles.title}>Top services near you!</h2>
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Error loading services: {error}</p>
          <button style={styles.retryBtn} onClick={fetchServices}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.serviceDisplay}>
      <h2 style={styles.title}>CheckOut for All services</h2>
      <div style={styles.serviceDisplayList}>
        {services.map((service) => (
          <ServiceCard
            key={service._id}
            id={service._id}
            name={service.name}
            description={service.description}
            price={service.price}
            image={service.image}
            category={service.category}
            onServiceClick={handleServiceClick}
            onBookClick={handleBookClick}
          />
        ))}
      </div>
    </div>
  );
}

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

// Add CSS animations
if (!document.querySelector('#services-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'services-animations';
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

export default Services;