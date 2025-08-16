import { useState } from "react";
import "./Add1.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const AddCategory = ({ url }) => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("image", image);

    try {
      const res = await axios.post(`${url}/api/category/add`, formData);
      if (res.data.success) {
        setData({ name: "", description: "" });
        setImage(null);
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding category");
    }
  };

  return (
    <div className="admin-form-container">
      <h2 className="form-title">Add Service Category</h2>
      <form onSubmit={onSubmitHandler} className="form-grid">
        
        {/* Upload */}
        <div className="form-group">
          <label className="form-label">Upload Image</label>
          <div className="upload-box">
            <label htmlFor="image">
              <img
                src={image ? URL.createObjectURL(image) : assets.upload_area}
                alt="Upload"
                className="upload-preview"
              />
            </label>
            <input
              type="file"
              id="image"
              hidden
              required
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter category name"
            value={data.name}
            onChange={onChangeHandler}
            required
            className="form-input"
          />
        </div>

        {/* Description */}
        <div className="form-group full-width">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            rows="4"
            placeholder="Write a brief description"
            value={data.description}
            onChange={onChangeHandler}
            required
            className="form-textarea"
          ></textarea>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Add Category
          </button>
        </div>
      </form>
    </div>
  );
};

AddCategory.propTypes = {
  url: PropTypes.string.isRequired,
};

export default AddCategory;
