import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit, onCancel, formatRupees, predefinedCategories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  });

  const [errors, setErrors] = useState({});
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category || '',
        price: product.price,
        stock: product.stock
      });
      
      
      if (product.category && !predefinedCategories.includes(product.category)) {
        setShowCustomCategory(true);
      }
    }
  }, [product, predefinedCategories]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
   
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }

 
    if (name === 'category' && value === 'custom') {
      setShowCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else if (name === 'category' && value !== 'custom') {
      setShowCustomCategory(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };
      onSubmit(submitData);
    }
  };

  const handleCustomCategoryToggle = () => {
    setShowCustomCategory(!showCustomCategory);
    setFormData(prev => ({ ...prev, category: '' }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              placeholder="Enter product name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            
            {!showCustomCategory ? (
              <>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select a category (optional)</option>
                  {predefinedCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="custom">+ Add Custom Category</option>
                </select>
              </>
            ) : (
              <div className="custom-category-input">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter custom category"
                />
                <button 
                  type="button" 
                  className="btn-custom-category"
                  onClick={handleCustomCategoryToggle}
                >
                  ← Choose from list
                </button>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'error' : ''}
                placeholder="0.00"
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
              {formData.price && !errors.price && (
                <span className="currency-preview">
                  ≈ {formatRupees(formData.price)}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={errors.stock ? 'error' : ''}
                placeholder="0"
              />
              {errors.stock && <span className="error-message">{errors.stock}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;