import "./Sidebar1.css";
import { assets } from "../../assets/assets";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="sidebar">
      {/* Content Section */}
      <div className="sidebar-section">
        <h3 className="section-title">Content</h3>
        <div className="sidebar-options">
          <NavLink to="" className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Dashboard</p>
          </NavLink>
          <NavLink to="/addcategory" className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Create Service Category</p>
          </NavLink>
          <NavLink to="/addservice" className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Create Service</p>
          </NavLink>
          <NavLink to="/getcategory" className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Get All Service Category</p>
          </NavLink>
          <NavLink to="/getallservices" className="sidebar-option">
            <img src={assets.add_icon} alt="" />
            <p>Get All Services</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Bookings</p>
          </NavLink>
        </div>
      </div>

      {/* People Section */}
      <div className="sidebar-section">
        <h3 className="section-title">People</h3>
        <div className="sidebar-options">
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Providers</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Users</p>
          </NavLink>
        </div>
      </div>

      {/* Communication Section */}
      <div className="sidebar-section">
        <h3 className="section-title">Communication</h3>
        <div className="sidebar-options">
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Chat</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Notifications</p>
          </NavLink>
        </div>
      </div>

      {/* Finance Section */}
      <div className="sidebar-section">
        <h3 className="section-title">Finance</h3>
        <div className="sidebar-options">
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Transactions</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Provider Earning</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Provider Request</p>
          </NavLink>
        </div>
      </div>

      {/* System Section */}
      <div className="sidebar-section">
        <h3 className="section-title">System</h3>
        <div className="sidebar-options">
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Settings</p>
          </NavLink>
          <NavLink to="" className="sidebar-option">
            <img src={assets.order_icon} alt="" />
            <p>Log Out</p>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;