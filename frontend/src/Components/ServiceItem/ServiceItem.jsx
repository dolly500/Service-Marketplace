import { useContext } from "react";
import PropTypes from "prop-types";
import "./ServiceItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../context/storeContext";

const ServiceItem = ({ name, price, description, image }) => {
  const { url } = useContext(StoreContext);

  return (
    <div className="service-card">
      <div className="service-image-container">
        <img
          className="service-image"
          src={url + "/images/" + image}
          alt={name}
        />
      </div>

      <div className="service-details">
        <h3 className="service-title">{name}</h3>

        <div className="service-rating">
          <img src={assets.rating_starts} alt="rating" />
        </div>

        <p className="service-description">{description}</p>
        

        <div className="service-card-footer">
          <p className="service-price">Rs. {price}</p> 
          <p className="button-price">Book Now</p>       
          </div>
        </div>
      </div>
  );
};

ServiceItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string,
  image: PropTypes.string,
};

export default ServiceItem;
