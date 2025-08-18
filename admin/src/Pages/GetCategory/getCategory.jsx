import { useState, useEffect } from 'react';
import { Edit2, X, Save, Upload, Trash2 } from 'lucide-react';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModal, setEditModal] = useState({ isOpen: false, category: null });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/category/admin/list');
      const result = await response.json();
      
      if (result.success) {
        setCategories(result.data);
      } else {
        setError('Failed to fetch categories');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditModal({
      isOpen: true,
      category: { ...category }
    });
    setEditError(null);
  };

  const handleCloseModal = () => {
    setEditModal({ isOpen: false, category: null });
    setEditError(null);
  };

  const handleInputChange = (field, value) => {
    setEditModal(prev => ({
      ...prev,
      category: {
        ...prev.category,
        [field]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditModal(prev => ({
        ...prev,
        category: {
          ...prev.category,
          imageFile: file
        }
      }));
    }
  };

  const handleUpdateCategory = async () => {
    if (!editModal.category) return;

    try {
      setEditLoading(true);
      setEditError(null);

      const formData = new FormData();
      formData.append('id', editModal.category._id);
      formData.append('name', editModal.category.name);
      formData.append('description', editModal.category.description);
      formData.append('isActive', editModal.category.isActive.toString());
      
      if (editModal.category.imageFile) {
        formData.append('image', editModal.category.imageFile);
      }

      const response = await fetch(`http://localhost:4000/api/category/update`, {
        method: 'PUT',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Update the category in the local state
        setCategories(prev => prev.map(category => 
          category._id === editModal.category._id ? result.data : category
        ));
        handleCloseModal();
      } else {
        setEditError(result.message || 'Failed to update category');
      }
    } catch (err) {
      setEditError('Error updating category: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (category) => {
    setDeleteModal({
      isOpen: true,
      category: category
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, category: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleteLoading(true);

      const response = await fetch('http://localhost:4000/api/category/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: deleteModal.category._id
        })
      });

      const result = await response.json();

      if (result.success) {
        // Remove the category from the local state
        setCategories(prev => prev.filter(category => 
          category._id !== deleteModal.category._id
        ));
        handleCloseDeleteModal();
      } else {
        setError(result.message || 'Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category: ' + err.message);
    } finally {
      setDeleteLoading(false);
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

  const truncateText = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchCategories} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Service Categories Management</h2>
        <div style={styles.stats}>
          Total Categories: <span style={styles.count}>{categories.length}</span>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Updated</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id} style={styles.row}>
                <td style={styles.td}>
                  {category.image ? (
                    <div style={styles.imageContainer}>
                      <img 
                        src={`http://localhost:4000/uploads/${category.image}`} 
                        alt={category.name}
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
                  <span style={styles.categoryName}>{category.name}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.description} title={category.description}>
                    {truncateText(category.description)}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.status,
                    ...(category.isActive ? styles.statusActive : styles.statusInactive)
                  }}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={styles.date}>{formatDate(category.createdAt)}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.date}>{formatDate(category.updatedAt)}</span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionsContainer}>
                    <button 
                      onClick={() => handleEdit(category)}
                      style={styles.editButton}
                      title="Edit Category"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category)}
                      style={styles.deleteButton}
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div style={styles.emptyState}>
          <h3>No Categories Found</h3>
          <p>There are no categories to display at the moment.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Category</h3>
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
                <label style={styles.label}>Category Name</label>
                <input
                  type="text"
                  value={editModal.category?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={styles.input}
                  placeholder="Enter category name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={editModal.category?.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  style={styles.textarea}
                  placeholder="Enter category description"
                  rows="3"
                />
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
                  {editModal.category?.imageFile && (
                    <span style={styles.fileName}>
                      {editModal.category.imageFile.name}
                    </span>
                  )}
                </div>
                {editModal.category?.image && !editModal.category?.imageFile && (
                  <div style={styles.currentImage}>
                    <span style={styles.currentImageLabel}>Current image: {editModal.category.image}</span>
                  </div>
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={editModal.category?.isActive || false}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    style={styles.checkbox}
                  />
                  Active Category
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
                onClick={handleUpdateCategory}
                style={styles.saveButton}
                disabled={editLoading}
              >
                {editLoading ? (
                  'Updating...'
                ) : (
                  <>
                    <Save size={16} />
                    Update Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.deleteModalContainer}>
            <div style={styles.deleteModalHeader}>
              <h3 style={styles.deleteModalTitle}>Delete Category</h3>
              <button 
                onClick={handleCloseDeleteModal}
                style={styles.closeButton}
                disabled={deleteLoading}
              >
                <X size={20} />
              </button>
            </div>

            <div style={styles.deleteModalBody}>
              <div style={styles.deleteWarning}>
                <Trash2 size={48} style={styles.deleteIcon} />
                <p style={styles.deleteMessage}>
                  Are you sure you want to delete the category <strong>"{deleteModal.category?.name}"</strong>?
                </p>
              </div>
            </div>

            <div style={styles.deleteModalFooter}>
              <button 
                onClick={handleCloseDeleteModal}
                style={styles.cancelButton}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={styles.deleteConfirmButton}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Category'}
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
    minWidth: '800px'
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
  categoryName: {
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
    minWidth: '120px',
    display: 'block'
  },
  description: {
    color: '#6b7280',
    lineHeight: '1.4',
    maxWidth: '250px',
    display: 'block'
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
  actionsContainer: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
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
  deleteButton: {
    backgroundColor: '#ef4444',
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
    maxWidth: '500px',
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
    outline: 'none',
    boxSizing: 'border-box'
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
    minHeight: '80px',
    boxSizing: 'border-box'
  },
  imageUpload: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
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
  currentImage: {
    marginTop: '8px'
  },
  currentImageLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontStyle: 'italic'
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
  },
  // Delete modal styles
  deleteModalContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '450px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  deleteModalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#fef2f2'
  },
  deleteModalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#991b1b',
    margin: 0
  },
  deleteModalBody: {
    padding: '24px'
  },
  deleteWarning: {
    textAlign: 'center'
  },
  deleteIcon: {
    color: '#ef4444',
    marginBottom: '16px'
  },
  deleteMessage: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  deleteSubMessage: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0
  },
  deleteModalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  deleteConfirmButton: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
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
  
  .delete-button:hover {
    background-color: #dc2626 !important;
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
  
  .delete-confirm-button:hover {
    background-color: #dc2626 !important;
  }
  
  input:focus, textarea:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
`;
document.head.appendChild(styleSheet);

export default CategoriesTable;