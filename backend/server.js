// server.js
const express = require('express');
const cors = require('cors');
const { pool, createTable, testConnection } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins for now — can restrict to your frontend domain later
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ✅ Request Logging (for debugging)
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${
      req.headers.origin || 'No Origin'
    }`
  );
  next();
});

// ✅ Database Initialization
const initializeDatabase = async () => {
  try {
    console.log('🟡 Initializing database...');
    await createTable();
    console.log('✅ Database table verified/created');

    const isConnected = await testConnection();
    if (!isConnected) throw new Error('Database connection test failed');

    console.log('✅ Database connection verified successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    if (process.env.NODE_ENV === 'development') process.exit(1);
  }
};

// Initialize database on startup
initializeDatabase();

// ✅ CRUD API Routes

// --- GET all products ---
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching all products...');
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- POST create new product ---
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and stock are required',
      });
    }

    const query = `
      INSERT INTO products (name, category, price, stock)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [name, category || null, parseFloat(price), parseInt(stock)];
    const result = await pool.query(query, values);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- PUT update existing product ---
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name, price, and stock are required',
      });
    }

    const query = `
      UPDATE products
      SET name = $1, category = $2, price = $3, stock = $4
      WHERE id = $5
      RETURNING *;
    `;
    const values = [name, category || null, parseFloat(price), parseInt(stock), id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DELETE product ---
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Health check endpoints
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      message: 'Server and database are running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      success: true,
      message: 'Database connected successfully',
      currentTime: result.rows[0].current_time,
      postgresVersion: result.rows[0].postgres_version,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
    });
  }
});

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory API Server is running 🚀',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      testDb: '/api/test-db',
      products: '/api/products',
    },
    timestamp: new Date().toISOString(),
  });
});

// ✅ 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health check: /api/health`);
  console.log(`📍 Database test: /api/test-db`);
  console.log(`📍 Products API: /api/products`);
  console.log(`🔗 URL: ${
    process.env.NODE_ENV === 'production'
      ? 'https://inventory-backend-5rk8.onrender.com'
      : `http://localhost:${PORT}`
  }`);
});
