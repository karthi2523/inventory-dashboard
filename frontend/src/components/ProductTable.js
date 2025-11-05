import React from 'react';

const ProductTable = ({ products, onEdit, onDelete, loading, formatRupees }) => {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out-of-stock';
    if (stock < 10) return 'low-stock';
    return 'in-stock';
  };

  const getStockText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id} className="table-row">
                <td>
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    {/* <div className="product-id">ID: {product.id}</div> */}
                  </div>
                </td>
                <td>
                  <span className="category-tag">
                    {product.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="price-cell">
                  <span className="price">{formatRupees(product.price)}</span>
                </td>
                <td>
                  <span className={`stock-badge ${getStockStatus(product.stock)}`}>
                    {getStockText(product.stock)} ({product.stock})
                  </span>
                </td>
                <td>
                  <div className="date-cell">
                    {new Date(product.created_at).toLocaleDateString('en-IN')}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => onEdit(product)}
                      title="Edit product"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => onDelete(product.id)}
                      title="Delete product"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No products found</h3>
            <p>Try adding a new product or adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTable;