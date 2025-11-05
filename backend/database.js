const { Pool } = require('pg');
require('dotenv').config();

const getDatabaseConfig = () => {
  const baseConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  // Add SSL for production (Render PostgreSQL requires SSL)
  if (process.env.NODE_ENV === 'production') {
    baseConfig.ssl = {
      rejectUnauthorized: false
    };
  }

  return baseConfig;
};

const pool = new Pool(getDatabaseConfig());

// Create table if not exists
const createTable = async () => {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10, 2) NOT NULL,
        stock INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
    console.log('✅ Products table created/verified');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

module.exports = { pool, createTable, testConnection };