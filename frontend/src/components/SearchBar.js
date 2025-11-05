import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={handleChange}
        />
        {searchTerm && (
          <button className="clear-search" onClick={clearSearch}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;