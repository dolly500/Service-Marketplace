import { useState, useEffect } from 'react';

const ProvidersDisplay = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/providers');
      const data = await response.json();
      
      if (data.success) {
        setProviders(data.providers);
      } else {
        setError('Failed to fetch providers');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return <div className="loading">Loading providers...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <style jsx>{`
        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
        }

        .header p {
          margin: 0;
          color: #666;
          font-size: 16px;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid #e0e0e0;
          overflow-x: auto;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        .table th {
          background: #f8f9fa;
          color: #495057;
          font-weight: 600;
          padding: 15px 12px;
          text-align: left;
          border-bottom: 2px solid #dee2e6;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .table td {
          padding: 15px 12px;
          border-bottom: 1px solid #dee2e6;
          color: #495057;
          vertical-align: middle;
        }

        .table tbody tr:hover {
          background-color: #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .table tbody tr:last-child td {
          border-bottom: none;
        }

        .table tbody tr:nth-child(even) {
          background-color: #fafafa;
        }

        .table tbody tr:nth-child(even):hover {
          background-color: #f0f0f0;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-approved {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .status-rejected {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
          color: #666;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          padding: 15px;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
        }

        .email {
          color: #007bff;
          text-decoration: none;
        }

        .email:hover {
          text-decoration: underline;
        }

        .business-name {
          font-weight: 500;
          color: #2c3e50;
        }

        .business-address {
          color: #666;
          font-size: 13px;
          max-width: 200px;
          line-height: 1.4;
        }

        .business-description {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          max-width: 250px;
        }

        .name {
          font-weight: 600;
          color: #343a40;
        }

        .tooltip {
          position: relative;
          cursor: help;
        }

        .tooltip:hover::after {
          content: attr(data-tooltip);
          position: absolute;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          white-space: normal;
          max-width: 300px;
          z-index: 1000;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 5px;
          word-wrap: break-word;
        }

        .tooltip:hover::before {
          content: '';
          position: absolute;
          border: 5px solid transparent;
          border-top-color: #333;
          z-index: 1000;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
        }

        @media (max-width: 1200px) {
          .container {
            padding: 10px;
          }
          
          .table-container {
            overflow-x: auto;
          }
        }

        @media (max-width: 768px) {
          .table th,
          .table td {
            padding: 10px 8px;
            font-size: 13px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .header p {
            font-size: 14px;
          }

          .business-description,
          .business-address {
            max-width: 150px;
          }
        }

        @media (max-width: 480px) {
          .table th,
          .table td {
            padding: 8px 6px;
            font-size: 12px;
          }
          
          .status-badge {
            font-size: 10px;
            padding: 3px 8px;
          }

          .business-description,
          .business-address {
            max-width: 120px;
          }
        }
      `}</style>

      <div className="header">
        <h1>All Providers</h1>
        <p>Total Providers: {providers.length}</p>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Business Name</th>
              <th>Business Address</th>
              <th>Business Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr key={provider._id}>
                <td className="name">{provider.name}</td>
                <td>
                  <a href={`mailto:${provider.email}`} className="email">
                    {provider.email}
                  </a>
                </td>
                <td className="business-name">{provider.businessName || 'N/A'}</td>
                <td className="business-address">
                  {provider.businessAddress ? (
                    <span 
                      className="tooltip" 
                      data-tooltip={provider.businessAddress}
                    >
                      {truncateText(provider.businessAddress, 30)}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="business-description">
                  {provider.businessDescription ? (
                    <span 
                      className="tooltip" 
                      data-tooltip={provider.businessDescription}
                    >
                      {truncateText(provider.businessDescription, 40)}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <span className={`status-badge ${provider.isApproved ? 'status-approved' : 'status-pending'}`}>
                    {provider.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProvidersDisplay;