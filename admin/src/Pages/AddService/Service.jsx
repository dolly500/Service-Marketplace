import { useState, useEffect } from 'react';
import './AddService.css';

const AddService = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: null,
    category: '',
    city: '',
    country: '',
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/category/list');
      const data = await response.json();

      if (data.success) {
        setCategories(data.data);
      } else {
        setMessage({ text: 'Failed to load categories', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ text: 'Error loading categories', type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validation
    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.city || !formData.country || !formData.image) {
      setMessage({ text: 'Please fill all required fields', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category); // send category _id
      formDataToSend.append('city', formData.city);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('image', formData.image);

      const response = await fetch('http://localhost:4000/api/service/add', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message || 'Service added successfully!', type: 'success' });
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          image: null,
          category: '',
          city: '',
          country: '',
          isActive: true,
        });
        setImagePreview(null);
        document.getElementById('image').value = '';
      } else {
        setMessage({ text: data.message || 'Failed to add service', type: 'error' });
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: null,
      category: '',
      city: '',
      country: '',
      isActive: true,
    });
    setImagePreview(null);
    setMessage({ text: '', type: '' });
    document.getElementById('image').value = '';
  };

  return (
    <div className="add-service-container">
      <div className="add-service-card">
        <div className="add-service-header">
          <h2>Add New Service</h2>
          <p>Create a new service for your business</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-service-form">
          <div className="form-group">
            <label htmlFor="name">Service Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter service name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter service description"
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price ($) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* New fields for city & country */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Enter country"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Service Image *</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Service preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Adding Service...
                </>
              ) : (
                'Add Service'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddService;
