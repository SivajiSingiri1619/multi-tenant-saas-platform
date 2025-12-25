// backend/src/config/db.js

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// simple DB connection test
const connectDB = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('DB connection error:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  connectDB,
};
