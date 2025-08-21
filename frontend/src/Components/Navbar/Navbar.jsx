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
  };

  const openServiceProviderModal = () => {
    setIsServiceProviderModalOpen(true);
  };

  const closeServiceProviderModal = () => {
    setIsServiceProviderModalOpen(false);
  };

  return (
    <>
      <div className="navbar" style={{padding:'0, 100px'}}>
        <Link to="/">
          <img src={assets.logo} alt="" className="logo" height="90vh"/>
        </Link>
        <ul className="navbar-menu">
          <Link
            to="/"
            onClick={() => setMenu("Home")}
            className={menu === "Home" ? "active" : ""}
          >
            Home
          </Link>
          <a
            href="/categories"
            className={menu === "Services" ? "active" : ""}
          >
            Service Categories
          </a>
          <a
            href="/services"
            className={menu === "Services" ? "active" : ""}
          >
            Services
          </a>
          <a
            href=""
            className={menu === "Contact Us" ? "active" : ""}
          >
            Contact Us
          </a>
          <a
            href=""
            className={menu === "Contact Us" ? "active" : ""}
          >
            About Us
          </a>
          {/* Only show "Become a Service Provider" if user is NOT logged in */}
          {!token && !isServiceProvider && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                openServiceProviderModal();
              }}
              className={menu === "Become a Service Provider" ? "active" : ""}
            >
              Become a Service Provider
            </a>
          )}
        </ul>
        <div className="navbar-right">
          {(token || isServiceProvider) ? (
            <div className="navbar-profile">
              <img src={assets.profile_icon} alt="" />
              <ul className="nav-profile-dropdown">
                <li onClick={() => navigate('/profile')}>
                  <img src={assets.profile_icon} alt="" />
                  <p>My Profile</p>
                </li>
                {isServiceProvider ? (
                  // Service provider specific menu items
                  <>
                    <li onClick={() => navigate('/my-services')}>
                      <img src={assets.bag_icon} alt="" />
                      <p>My Services</p>
                    </li>
                    <li onClick={() => navigate('/service-bookings')}>
                      <img src={assets.bag_icon} alt="" />
                      <p>Service Bookings</p>
                    </li>
                    <li onClick={() => navigate('/service-history')}>
                      <img src={assets.bag_icon} alt="" />
                      <p>Service History</p>
                    </li>
                  </>
                ) : (
                  // Regular user menu items
                  <>
                    <li onClick={() => navigate('/my-orders')}>
                      <img src={assets.bag_icon} alt="" />
                      <p>All Bookings</p>
                    </li>
                    <li onClick={() => navigate('/my-orders')}>
                      <img src={assets.bag_icon} alt="" />
                      <p>Booking History</p>
                    </li>
                  </>
                )}
                <li onClick={() => navigate('/notifications')}>
                  <img src={assets.bag_icon} alt="" />
                  <p>Notifications</p>
                </li>
                <hr />
                <li onClick={handleLogout}>
                  <img src={assets.logout_icon} alt="" />
                  <p>Logout</p>
                </li>
              </ul>
            </div>
          ) : (
            <>
            <button onClick={() => navigate("/auth")}>Register</button>
            <button onClick={() => navigate("/providerlogin")}>Sign In as Provider</button>
            </>
          )}
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