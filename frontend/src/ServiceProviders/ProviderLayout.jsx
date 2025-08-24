import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import ProviderDashboard from "./ProviderDashboard";

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/provider/dashboard' },
    { id: 'services', label: 'Services', path: '/provider/services' },
    { id: 'bookings', label: 'Bookings', path: '/provider/bookings' },
    { id: 'profile', label: 'Profile', path: '/provider/profile' },
    { id: 'chat', label: 'Chat', path: '/provider/chat'},
    { id: 'settings', label: 'Settings', path: '/provider/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Service Provider Dashboard</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleNavigation(item.path)}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

const ProviderLayout = () => {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear provider-specific data
    localStorage.removeItem("providerToken");
    localStorage.removeItem("provider");
    navigate("/providerlogin");
  };

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        // Use providerToken instead of token
        const token = localStorage.getItem("providerToken");
        
        if (!token) {
          navigate("/providerlogin");
          return;
        }

        const response = await fetch("http://localhost:4000/api/auth/me-service", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        
        if (data.success && data.provider) {
          setProviderData(data.provider);
        } else {
          throw new Error("Invalid response format or unauthorized");
        }
      } catch (err) {
        console.error("Provider authentication error:", err);
        setError(err.message);
        
        // Clear invalid tokens and redirect
        localStorage.removeItem("providerToken");
        localStorage.removeItem("provider");
        
        setTimeout(() => {
          navigate("/providerlogin");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [navigate]);

  // Check if user is authenticated as provider on component mount
  useEffect(() => {
    const token = localStorage.getItem("providerToken");
    const providerInfo = localStorage.getItem("provider");
    
    if (!token || !providerInfo) {
      navigate("/providerlogin");
      return;
    }
    
    // Optional: Verify the stored provider data is valid
    try {
      JSON.parse(providerInfo);
    } catch (e) {
      console.error("Invalid provider data in localStorage");
      localStorage.removeItem("providerToken");
      localStorage.removeItem("provider");
      navigate("/providerlogin");
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>
        {`
          :root {
            --primary-color: #667eea;
            --text-color: #2d3748;
            --bg-color: #f7fafc;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
          }

          .dashboard-container {
            display: flex;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
          }

          .sidebar {
            width: 250px;
            background-color: var(--card-bg);
            border-right: 1px solid var(--border-color);
            padding: 20px;
            flex-shrink: 0;
          }

          .sidebar-header {
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 20px;
          }

          .sidebar-header h2 {
            font-size: 20px;
            color: var(--text-color);
            margin: 0;
          }

          .sidebar-nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-nav li {
            margin-bottom: 10px;
          }

          .sidebar-nav button {
            display: block;
            padding: 10px 15px;
            color: var(--text-color);
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          .sidebar-nav button:hover {
            background-color: var(--border-color);
          }

          .sidebar-nav button.active {
            background-color: var(--primary-color);
            color: white;
          }

          .sidebar-nav .logout-btn {
            margin-top: 20px;
            color: #e53e3e;
          }

          .sidebar-nav .logout-btn:hover {
            background-color: #fed7d7;
          }

          .main-content {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
          }

          .loading-container, .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: var(--bg-color);
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          .error-container {
            color: #e53e3e;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Sidebar onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<ProviderDashboard providerData={providerData} />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProviderLayout;