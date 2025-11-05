import React from 'react';

const FilterBar = ({ filters, onFilterChange, onClearFilters, categories }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return filters.category || filters.startDate || filters.endDate || filters.stockStatus;
  };

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <h3>🔍 Filters</h3>
        {hasActiveFilters() && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className="filter-grid">
        
        <div className="filter-group">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        
        <div className="filter-group">
          <label htmlFor="stock-filter">Stock Status</label>
          <select
            id="stock-filter"
            value={filters.stockStatus}
            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
          >
            <option value="">All Stock</option>
            <option value="in-stock">In Stock (≥10)</option>
            <option value="low-stock">Low Stock (1-9)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        
        <div className="filter-group">
          <label htmlFor="start-date">From Date</label>
          <input
            type="date"
            id="start-date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

       
        <div className="filter-group">
          <label htmlFor="end-date">To Date</label>
          <input
            type="date"
            id="end-date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            min={filters.startDate}
          />
        </div>
      </div>

 
      {hasActiveFilters() && (
        <div className="active-filters">
          <span className="active-filters-label">Active Filters:</span>
          {filters.category && (
            <span className="filter-badge">
              Category: {filters.category} 
              <button onClick={() => handleFilterChange('category', '')}>×</button>
            </span>
          )}
          {filters.stockStatus && (
            <span className="filter-badge">
              Stock: {filters.stockStatus === 'in-stock' ? 'In Stock' : 
                     filters.stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
              <button onClick={() => handleFilterChange('stockStatus', '')}>×</button>
            </span>
          )}
          {filters.startDate && (
            <span className="filter-badge">
              From: {new Date(filters.startDate).toLocaleDateString('en-IN')}
              <button onClick={() => handleFilterChange('startDate', '')}>×</button>
            </span>
          )}
          {filters.endDate && (
            <span className="filter-badge">
              To: {new Date(filters.endDate).toLocaleDateString('en-IN')}
              <button onClick={() => handleFilterChange('endDate', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;