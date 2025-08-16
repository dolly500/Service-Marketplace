import { useState, useEffect } from 'react';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <h2 style={styles.title}>Categories Management</h2>
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
    border: '1px solid #e5e7eb'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
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
    borderBottom: '2px solid #e5e7eb'
  },
  row: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
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
    textTransform: 'capitalize'
  },
  description: {
    color: '#6b7280',
    lineHeight: '1.4'
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
    fontSize: '13px'
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
  }
};

// Add hover effect for table rows
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  tr:hover {
    background-color: #f9fafb !important;
  }
  
  button:hover {
    background-color: #dc2626 !important;
  }
`;
document.head.appendChild(styleSheet);

export default CategoriesTable;