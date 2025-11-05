const express = require('express');
const cors = require('cors');
const { pool, createTable, testConnection } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins in development, allow all in production for now
    // You can restrict this later to specific domains
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No Origin'}`);
  next();
});

// Initialize database with error handling
const initializeDatabase = async () => {
  try {
    await createTable();
    console.log('✅ Database table initialized');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection test failed');
    }
    console.log('✅ Database connection verified');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // Don't exit process in production, just log error
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

// Initialize database when server starts
initializeDatabase();

// Routes

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('Fetching all products...');
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    console.log(`Found ${result.rows.length} products`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    const { name, category, price, stock } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, price, and stock are required' 
      });
    }

    const query = `
      INSERT INTO products (name, category, price, stock) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const values = [name, category || null, parseFloat(price), parseInt(stock)];
    
    const result = await pool.query(query, values);
    console.log('Product created:', result.rows[0]);
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, req.body);
    const { id } = req.params;
    const { name, category, price, stock } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, price, and stock are required' 
      });
    }

    const query = `
      UPDATE products 
      SET name = $1, category = $2, price = $3, stock = $4 
      WHERE id = $5 
      RETURNING *
    `;
    const values = [name, category || null, parseFloat(price), parseInt(stock), id];
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    console.log('Product updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    
    console.log('Product deleted:', result.rows[0]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint with database test
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'Server and database are running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server running but database connection failed',
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Database connection test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      success: true,
      database: 'Connected successfully',
      currentTime: result.rows[0].current_time,
      postgresVersion: result.rows[0].postgres_version,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory API Server is running! 🚀',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      testDb: '/api/test-db',
      products: {
        getAll: 'GET /api/products',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test-db',
      'GET /api/products',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`📍 Health check: /api/health`);
  console.log(`📍 Database test: /api/test-db`);
  console.log(`📍 Products API: /api/products`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🔗 Network: http://192.168.161.216:${PORT}`);
  } else {
    console.log(`🔗 Production URL: [Your Render URL will appear after deployment]`);
  }
});