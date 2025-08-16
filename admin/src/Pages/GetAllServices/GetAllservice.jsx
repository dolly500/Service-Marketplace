import { useState, useEffect } from 'react';
import { Edit2, X, Save, Upload } from 'lucide-react';

const ServicesTable = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, service: null });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/service/all');
      const result = await response.json();
      
      if (result.success) {
        setServices(result.data);
      } else {
        setError('Failed to fetch services');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/category/list');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleEdit = (service) => {
    setEditModal({
      isOpen: true,
      service: {
        ...service,
        categoryName: service.category?.name || ''
      }
    });
    setEditError(null);
  };

  const handleCloseModal = () => {
    setEditModal({ isOpen: false, service: null });
    setEditError(null);
  };

  const handleInputChange = (field, value) => {
    setEditModal(prev => ({
      ...prev,
      service: {
        ...prev.service,
        [field]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditModal(prev => ({
        ...prev,
        service: {
          ...prev.service,
          imageFile: file
        }
      }));
    }
  };

  const handleUpdateService = async () => {
    if (!editModal.service) return;

    try {
      setEditLoading(true);
      setEditError(null);

      const formData = new FormData();
      formData.append('id', editModal.service._id);
      formData.append('name', editModal.service.name);
      formData.append('description', editModal.service.description);
      formData.append('price', editModal.service.price.toString());
      formData.append('category', editModal.service.categoryName);
      formData.append('isActive', editModal.service.isActive.toString());
      
      if (editModal.service.imageFile) {
        formData.append('image', editModal.service.imageFile);
      }

      const response = await fetch(`http://localhost:4000/api/service/update`, {
        method: 'PUT',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update the service in the local state
        setServices(prev => prev.map(service => 
          service._id === editModal.service._id ? result.data : service
        ));
        handleCloseModal();
      } else {
        setEditError(result.message || 'Failed to update service');
      }
    } catch (err) {
      setEditError('Error updating service: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const truncateText = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchServices} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Services Management</h2>
        <div style={styles.stats}>
          Total Services: <span style={styles.count}>{services.length}</span>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Service Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Updated at</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id} style={styles.row}>
                <td style={styles.td}>
                  {service.image ? (
                    <div style={styles.imageContainer}>
                      <img 
                        src={`http://localhost:4000/uploads/${service.image}`} 
                        alt={service.name}
                        style={styles.image}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div style={{...styles.imagePlaceholder, display: 'none'}}>
                        No Image
                      </div>
                    </div>
                  ) : (
                    <div style={styles.imagePlaceholder}>No Image</div>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.serviceName}>{service.name}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.description} title={service.description}>
                    {truncateText(service.description)}
                  </span>
                </td>
                <td style={styles.td}>
                  {service.category ? (
                    <span style={styles.categoryTag}>
                      {service.category.name}
                    </span>
                  ) : (
                    <span style={styles.noCategory}>No Category</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={styles.price}>{formatPrice(service.price)}</span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.status,
                    ...(service.isActive ? styles.statusActive : styles.statusInactive)
                  }}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.date}>{formatDate(service.createdAt)}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.date}>{formatDate(service.updatedAt)}</span>
                </td>
                <td style={styles.td}>
                  <button 
                    onClick={() => handleEdit(service)}
                    style={styles.editButton}
                    title="Edit Service"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {services.length === 0 && (
        <div style={styles.emptyState}>
          <h3>No Services Found</h3>
          <p>There are no services to display at the moment.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Service</h3>
              <button 
                onClick={handleCloseModal}
                style={styles.closeButton}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {editError && (
                <div style={styles.modalError}>
                  {editError}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Service Name</label>
                <input
                  type="text"
                  value={editModal.service?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={styles.input}
                  placeholder="Enter service name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={editModal.service?.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter service description"
                  rows="3"
                />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Price ($)</label>
                  <input
                    type="number"
                    value={editModal.service?.price || ''}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    style={styles.input}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    value={editModal.service?.categoryId || ''}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image</label>
                <div style={styles.imageUpload}>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                  <label htmlFor="image-upload" style={styles.fileLabel}>
                    <Upload size={16} />
                    Choose New Image
                  </label>
                  {editModal.service?.imageFile && (
                    <span style={styles.fileName}>
                      {editModal.service.imageFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editModal.service?.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    style={styles.checkbox}
                  />
                  Active Service
                </label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                onClick={handleCloseModal}
                style={styles.cancelButton}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateService}
                style={styles.saveButton}
                disabled={editLoading}
              >
                {editLoading ? (
                  'Updating...'
                ) : (
                  <>
                    <Save size={16} />
                    Update Service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '0 4px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0'
  },
  stats: {
    fontSize: '16px',
    color: '#6b7280',
    fontWeight: '500'
  },
  count: {
    color: '#3b82f6',
    fontWeight: '700'
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px'
  },
  headerRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '16px 12px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap'
  },
  row: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease'
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#374151',
    verticalAlign: 'middle'
  },
  imageContainer: {
    width: '60px',
    height: '60px',
    position: 'relative'
  },
  image: {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '2px solid #e5e7eb'
  },
  imagePlaceholder: {
    width: '60px',
    height: '60px',
    backgroundColor: '#f3f4f6',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500'
  },
  serviceName: {
    fontWeight: '600',
    color: '#1f2937',
    display: 'block',
    minWidth: '120px'
  },
  description: {
    color: '#6b7280',
    lineHeight: '1.4',
    maxWidth: '200px',
    display: 'block'
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
    border: '1px solid #bfdbfe'
  },
  noCategory: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: '12px'
  },
  price: {
    fontWeight: '700',
    color: '#059669',
    fontSize: '16px'
  },
  status: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0'
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca'
  },
  date: {
    color: '#6b7280',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },
  editButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: '#6b7280'
  },
  error: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    color: '#991b1b'
  },
  retryButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease'
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    marginTop: '24px',
    color: '#6b7280'
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.2s ease'
  },
  modalBody: {
    padding: '24px',
    maxHeight: 'calc(90vh - 140px)',
    overflowY: 'auto'
  },
  modalError: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    color: '#991b1b',
    fontSize: '14px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    minHeight: '80px'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none'
  },
  imageUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  fileName: {
    fontSize: '14px',
    color: '#6b7280'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  cancelButton: {
    padding: '10px 20px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }
};

// Add hover effects
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  tr:hover {
    background-color: #f9fafb !important;
  }
  
  .edit-button:hover {
    background-color: #2563eb !important;
  }
  
  .retry-button:hover {
    background-color: #dc2626 !important;
  }
  
  .close-button:hover {
    color: #374151 !important;
  }
  
  .file-label:hover {
    background-color: #e5e7eb !important;
  }
  
  .cancel-button:hover {
    background-color: #f9fafb !important;
  }
  
  .save-button:hover {
    background-color: #047857 !important;
  }
  
  input:focus, textarea:focus, select:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
`;
document.head.appendChild(styleSheet);

export default ServicesTable;