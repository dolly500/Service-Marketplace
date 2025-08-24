import { useContext, useState, useEffect } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/storeContext";
import ServiceProviderSignup from "../../ServiceProviders/ServiceSignup";

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const [isServiceProviderModalOpen, setIsServiceProviderModalOpen] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  useEffect(() => {
    const serviceProviderToken = localStorage.getItem("serviceProviderToken");
    setIsServiceProvider(!!serviceProviderToken);
  }, [token]);

  const handleLogout = () => {
    // Clear both tokens on logout
    localStorage.removeItem("token");
    localStorage.removeItem("serviceProviderToken");
    setToken("");
    setIsServiceProvider(false);
    navigate("/");
    setIsMenuOpen(false); // Close menu after logout
  };

  const openServiceProviderModal = () => {
    setIsServiceProviderModalOpen(true);
    setIsMenuOpen(false); // Close menu when opening modal
  };

  const closeServiceProviderModal = () => {
    setIsServiceProviderModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (menuItem) => {
    setMenu(menuItem);
    setIsMenuOpen(false); // Close menu after clicking an item
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false); // Close menu after navigation
  };

  return (
    <>
      <div className="navbar">
        <Link to="/home">
          <img src={assets.logo} alt="" className="logo" height="89vh" width="17vw"/>
        </Link>
        
        {/* Hamburger Menu Button */}
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        {/* Mobile/Desktop Menu Overlay */}
        <div className={`menu-overlay ${isMenuOpen ? 'active' : ''}`}>
          <div className="menu-content">
            {/* Navigation Links */}
            <div className="menu-navigation">
              <Link
                to="/home"
                onClick={() => handleMenuClick("Home")}
                className={menu === "Home" ? "active" : ""}
              >
                Home
              </Link>
              <a
                href="/categories"
                onClick={() => handleMenuClick("Services")}
                className={menu === "Services" ? "active" : ""}
              >
                Service Categories
              </a>
              <a
                href="/services"
                onClick={() => handleMenuClick("Services")}
                className={menu === "Services" ? "active" : ""}
              >
                Services
              </a>
              <a
                href=""
                onClick={() => handleMenuClick("Contact Us")}
                className={menu === "Contact Us" ? "active" : ""}
              >
                Contact Us
              </a>
              <a
                href=""
                onClick={() => handleMenuClick("Contact Us")}
                className={menu === "Contact Us" ? "active" : ""}
              >
                About Us
              </a>
              
              {/* Only show "Become a Service Provider" if user is NOT logged in */}
             
            </div>

            {/* User Profile Section */}
            <div className="menu-user-section">
              {(token || isServiceProvider) ? (
                <div className="menu-profile">
                  <div className="profile-header">
                    <img src={assets.profile_icon} alt="" />
                    <span>My Account</span>
                  </div>
                  
                  <div className="profile-menu">
                    <div onClick={() => handleNavigation('/profile')} className="profile-item">
                      <img src={assets.profile_icon} alt="" />
                      <p>My Profile</p>
                    </div>
                    
                    {isServiceProvider ? (
                      // Service provider specific menu items
                      <>
                        <div onClick={() => handleNavigation('/my-services')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>My Services</p>
                        </div>
                        <div onClick={() => handleNavigation('/service-bookings')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>Service Bookings</p>
                        </div>
                        <div onClick={() => handleNavigation('/service-history')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>Service History</p>
                        </div>
                      </>
                    ) : (
                      // Regular user menu items
                      <>
                        <div onClick={() => handleNavigation('/my-orders')} className="profile-item">
                          <img src={assets.bag_icon} alt="" />
                          <p>Booking History</p>
                        </div>
                      </>
                    )}
                    
                    <div onClick={() => handleNavigation('/notifications')} className="profile-item">
                      <img src={assets.bag_icon} alt="" />
                      <p>Notifications</p>
                    </div>
                    
                    <div onClick={handleLogout} className="profile-item logout">
                      <img src={assets.logout_icon} alt="" />
                      <p>Logout</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="menu-auth-buttons">
                  {/* <button onClick={() => handleNavigation("/providerlogin")}>
                    Get Started as Provider
                  </button> */}

               
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ServiceProviderSignup 
        isOpen={isServiceProviderModalOpen} 
        onClose={closeServiceProviderModal} 
      />
    </>
  );
};

export default Navbar;