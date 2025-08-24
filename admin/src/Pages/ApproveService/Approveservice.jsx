import { useState, useEffect } from 'react';

const ProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [approveLoading, setApproveLoading] = useState({});
  const [rejectLoading, setRejectLoading] = useState({});

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

  const handleApproveReject = async (providerId, isApproved) => {
    if (isApproved) {
      setApproveLoading(prev => ({ ...prev, [providerId]: true }));
    } else {
      setRejectLoading(prev => ({ ...prev, [providerId]: true }));
    }
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/approve-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          isApproved
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the provider in the local state
        setProviders(prev => 
          prev.map(provider => 
            provider._id === providerId 
              ? { ...provider, isApproved, status: isApproved ? 'approved' : 'rejected' }
              : provider
          )
        );
      } else {
        setError('Failed to update provider status');
      }
    } catch (err) {
      setError('Error updating provider status');
    } finally {
      if (isApproved) {
        setApproveLoading(prev => ({ ...prev, [providerId]: false }));
      } else {
        setRejectLoading(prev => ({ ...prev, [providerId]: false }));
      }
    }
  };

  const getProviderStatus = (provider) => {
    if (provider.status === 'rejected') return 'rejected';
    if (provider.isApproved) return 'approved';
    return 'pending';
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
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
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
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
          min-width: 1200px;
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

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-approve {
          background: #28a745;
          color: white;
        }

        .btn-approve:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-reject {
          background: #dc3545;
          color: white;
        }

        .btn-reject:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-1px);
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
        }

        .business-name {
          font-weight: 500;
          color: #333;
        }

        .business-description {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          max-width: 300px;
        }

        .business-address {
          color: #666;
          font-size: 13px;
          max-width: 200px;
        }

        .provider-name {
          font-weight: 500;
          color: #333;
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
          white-space: nowrap;
          z-index: 1000;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 5px;
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
            font-size: 12px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .btn {
            min-width: 60px;
            padding: 6px 10px;
            font-size: 11px;
          }

          .business-description,
          .business-address {
            max-width: 150px;
          }
        }
      `}</style>

      <div className="header">
        <h1>Provider Management</h1>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => {
              const status = getProviderStatus(provider);
              return (
                <tr key={provider._id}>
                  <td className="provider-name">{provider.name}</td>
                  <td className="email">{provider.email}</td>
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
                    <span className={`status-badge status-${status}`}>
                      {getStatusDisplay(status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-approve"
                        onClick={() => handleApproveReject(provider._id, true)}
                        disabled={approveLoading[provider._id] || status === 'approved'}
                      >
                        {approveLoading[provider._id] ? 'Loading...' : 'Approve'}
                      </button>
                      <button
                        className="btn btn-reject"
                        onClick={() => handleApproveReject(provider._id, false)}
                        disabled={rejectLoading[provider._id] || status === 'rejected'}
                      >
                        {rejectLoading[provider._id] ? 'Loading...' : 'Reject'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProviderManagement;