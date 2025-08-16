import { useContext, useState } from "react";
import "./Navbar.css";
import { assets } from "../../assets/frontend_assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../context/storeContext";
// import { useDescope, useSession } from "@descope/react-sdk";

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const { token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  // const { isAuthenticated } = useSession();
  // const { logout } = useDescope();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
  };

  return (
    <div className="navbar" style={{padding:'0, 100px'}}>
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
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
          href="/services"
          className={menu === "Services" ? "active" : ""}
        >
          Services
        </a>
        <a
          href="/categories"
          className={menu === "Services" ? "active" : ""}
        >
          Services Category
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
         <a
          href=""
          className={menu === "Contact Us" ? "active" : ""}
        >
          Become a Service Provider
        </a>
       
      </ul>
      <div className="navbar-right">
        {token ? (
          <div className="navbar-profile">
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/profile')}>
                <img src={assets.profile_icon} alt="" />
                <p>My Profile</p>
              </li>
              <li onClick={() => navigate('/my-orders')}>
                <img src={assets.bag_icon} alt="" />
                <p>My Bookings</p>
              </li>
              <hr />
              <li onClick={handleLogout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        ) : (
          <button onClick={() => navigate("/auth")}>Sign Up</button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
