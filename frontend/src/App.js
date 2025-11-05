import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { productAPI } from './services/api';
import ProductTable from './components/ProductTable';
import ProductForm from './components/ProductForm';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import StatsCard from './components/StatsCard';
import './App.css';

// Predefined categories
const PREDEFINED_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports',
  'Beauty',
  'Toys',
  'Automotive',
  'Health',
  'Grocery'
];

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    stockStatus: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    calculateStats();
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockItems = products.filter(product => product.stock < 10).length;

    setStats({
      totalProducts,
      totalStock,
      totalValue,
      lowStockItems
    });
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category === filters.category
      );
    }

    // Apply date range filter
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(product => 
        new Date(product.created_at) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(product => 
        new Date(product.created_at) <= endDate
      );
    }

    // Apply stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'in-stock':
          filtered = filtered.filter(product => product.stock >= 10);
          break;
        case 'low-stock':
          filtered = filtered.filter(product => product.stock > 0 && product.stock < 10);
          break;
        case 'out-of-stock':
          filtered = filtered.filter(product => product.stock === 0);
          break;
        default:
          break;
      }
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      stockStatus: ''
    });
  };

  const handleCreate = async (productData) => {
    try {
      await productAPI.create(productData);
      toast.success('🎉 Product created successfully!');
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      toast.error('❌ Failed to create product');
    }
  };

  const handleUpdate = async (productData) => {
    try {
      await productAPI.update(editingProduct.id, productData);
      toast.success('✅ Product updated successfully!');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('❌ Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        toast.success('🗑️ Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        toast.error('❌ Failed to delete product');
      }
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Get unique categories from products for filter dropdown
  const getUniqueCategories = () => {
    const categories = products
      .map(product => product.category)
      .filter(category => category && category.trim() !== '');
    return [...new Set(categories)];
  };

  // Format currency in Indian Rupees
const formatRupees = (amount) => {
  // For display in tables and forms (full format)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const formatRupeesCompact = (amount) => {
  // For stats cards (compact format)
  if (amount >= 10000000) { // 1 crore
    const crores = amount / 10000000;
    return `₹${crores.toFixed(1)}Cr`;
  } else if (amount >= 100000) { // 1 lakh
    const lakhs = amount / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  } else if (amount >= 1000) {
    const thousands = amount / 1000;
    return `₹${thousands.toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>📦 Product Inventory Dashboard</h1>
            <p>Manage your product inventory with ease</p>
          </div>
          <button 
            className="btn-primary add-product-btn"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">+</span>
            Add Product
          </button>
        </div>
      </header>

      <div className="stats-container">
        <StatsCard 
          title="Total Products" 
          value={stats.totalProducts} 
          icon="📊"
          color="#3498db"
        />
        <StatsCard 
          title="Total Stock" 
          value={stats.totalStock} 
          icon="📦"
          color="#2ecc71"
        />
        <StatsCard 
          title="Inventory Value" 
          value={formatRupees(stats.totalValue)} 
          icon="💰"
          color="#f39c12"
        />
        <StatsCard 
          title="Low Stock Items" 
          value={stats.lowStockItems} 
          icon="⚠️"
          color="#e74c3c"
        />
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>Product List</h2>
          <SearchBar onSearch={handleSearch} />
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          categories={getUniqueCategories()}
        />

        <ProductTable
          products={filteredProducts}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
          loading={loading}
          formatRupees={formatRupees}
        />
      </div>

      {(showForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          formatRupees={formatRupees}
          predefinedCategories={PREDEFINED_CATEGORIES}
        />
      )}

      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;